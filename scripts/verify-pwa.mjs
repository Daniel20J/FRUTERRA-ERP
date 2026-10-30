import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import vm from 'node:vm'

const dist = resolve('dist')
const manifest = JSON.parse(readFileSync(resolve(dist, 'manifest.webmanifest'), 'utf8'))
const html = readFileSync(resolve(dist, 'index.html'), 'utf8')
const source = readFileSync(resolve(dist, 'sw.js'), 'utf8')
const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
let checks = 0
async function check(name, run) { await run(); checks++; console.log('PASS ' + name) }

await check('Manifest, standalone launch, icons and Apple metadata are included', () => {
  assert.equal(manifest.id, '/')
  assert.equal(manifest.start_url, '/dashboard')
  assert.equal(manifest.scope, '/')
  assert.equal(manifest.display, 'standalone')
  assert.ok(html.includes('rel="manifest"'))
  assert.ok(html.includes('apple-touch-icon'))
  for (const icon of manifest.icons) {
    const png = readFileSync(resolve(dist, '.' + icon.src))
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
    assert.equal(png.readUInt32BE(16), Number(icon.sizes.split('x')[0]))
    assert.equal(png.readUInt32BE(20), Number(icon.sizes.split('x')[1]))
  }
  assert.ok(manifest.icons.some(icon => icon.purpose === 'maskable' && icon.sizes === '512x512'))
  assert.ok(existsSync(resolve(dist, 'images/pwa/apple-touch-icon.png')))
})

const cached = new Map(), listeners = new Map(), sent = []
let skipped = 0, claimed = 0, network = true, rejectInstall = false
class WorkerRequest { constructor(url, options = {}) { this.url = String(url); this.cache = options.cache } }
const caches = {
  async open(name) {
    if (!cached.has(name)) cached.set(name, new Map())
    const files = cached.get(name)
    return {
      async addAll(requests) {
        if (rejectInstall) throw Error('Network interrupted')
        // Cache.addAll commits atomically; verify all URLs exist in the actual build.
        const downloaded = requests.map(request => {
          assert.equal(request.cache, 'reload')
          assert.ok(existsSync(resolve(dist, '.' + request.url)), 'Missing file: ' + request.url)
          return [request.url, readFileSync(resolve(dist, '.' + request.url), 'utf8')]
        })
        downloaded.forEach(([url, body]) => files.set(url, body))
      },
      async match(url) { const body = files.get(String(url)); return body === undefined ? undefined : new Response(body) },
    }
  },
  async keys() { return [...cached.keys()] },
  async delete(name) { return cached.delete(name) },
}
const self = {
  location: { origin: 'https://fruterra.example' },
  clients: { async claim() { claimed++ }, async matchAll() { return [{ postMessage(message) { sent.push(message) } }] } },
  addEventListener(type, callback) { listeners.set(type, callback) },
  skipWaiting() { skipped++; return Promise.resolve() },
}
const context = vm.createContext({ self, caches, Request: WorkerRequest, Response, URL, fetch: async () => {
  if (!network) throw Error('Offline')
  return new Response('network response')
} })
vm.runInContext(source, context)
const urls = [...vm.runInContext('PRECACHE', context)]
const cacheName = vm.runInContext('CACHE_NAME', context)
function waitEvent(type, fields = {}) {
  let completion = Promise.resolve()
  listeners.get(type)({ ...fields, waitUntil(promise) { completion = Promise.resolve(promise) } })
  return completion
}
function fetchEvent(url, { method = 'GET', mode = 'navigate' } = {}) {
  let response = null
  listeners.get('fetch')({ request: { url: 'https://fruterra.example' + url, method, mode }, respondWith(promise) { response = Promise.resolve(promise) } })
  return response
}
await check('Complete build shell is downloaded without activating an update automatically', async () => {
  assert.ok(urls.includes('/index.html'))
  assert.ok(urls.includes('/manifest.webmanifest'))
  assert.ok(urls.includes('/images/cultivo_login_berries.png'))
  assert.ok(urls.some(url => /\/assets\/.*\.js$/.test(url)))
  assert.ok(urls.some(url => /\/assets\/.*\.css$/.test(url)))
  await waitEvent('install')
  assert.equal(cached.get(cacheName).size, urls.length)
  assert.equal(skipped, 0)
  assert.ok(!source.includes('__VERSION__') && !source.includes('__PRECACHE__'))
})
await check('Activation removes only old FRUTERRA shell caches and keeps saved-data caches', async () => {
  cached.set('fruterra-shell-previous', new Map())
  cached.set('unrelated-application-data', new Map([['saved', 'keep']]))
  await waitEvent('activate')
  assert.equal(cached.has('fruterra-shell-previous'), false)
  assert.equal(cached.get('unrelated-application-data').get('saved'), 'keep')
  assert.equal(claimed, 1)
  assert.equal(sent[0].type, 'OFFLINE_READY')
})
await check('Cold offline navigation to login and nested routes returns the cached React shell', async () => {
  network = false
  for (const route of ['/login', '/dashboard', '/gestion/pedido?crear=1', '/documentos/pedido/1']) assert.equal(await (await fetchEvent(route)).text(), html)
  for (const url of urls.filter(url => /\.(js|css)$/.test(url))) assert.ok((await fetchEvent(url, { mode: 'cors' })).ok)
})
await check('Non-GET submissions, cross-origin requests and unknown files are not cached', () => {
  assert.equal(fetchEvent('/api/operations', { method: 'POST', mode: 'cors' }), null)
  assert.equal(fetchEvent('/unknown.json', { mode: 'cors' }), null)
  let intercepted = false
  listeners.get('fetch')({ request: { url: 'https://third-party.example/photo.png', method: 'GET', mode: 'cors' }, respondWith() { intercepted = true } })
  assert.equal(intercepted, false)
})
await check('Only an explicit update request activates a waiting worker', async () => {
  await waitEvent('message', { data: { type: 'UNRELATED' } })
  assert.equal(skipped, 0)
  await waitEvent('message', { data: { type: 'SKIP_WAITING' } })
  assert.equal(skipped, 1)
})
await check('Offline-ready status detects an incomplete or evicted cached resource', async () => {
  const received = [], client = { postMessage(message) { received.push(message.type) } }
  await waitEvent('message', { data: { type: 'CHECK_OFFLINE_READY' }, source: client })
  assert.equal(received.at(-1), 'OFFLINE_READY')
  const asset = urls.find(url => url.endsWith('.js')), contents = cached.get(cacheName).get(asset)
  cached.get(cacheName).delete(asset)
  await waitEvent('message', { data: { type: 'CHECK_OFFLINE_READY' }, source: client })
  assert.equal(received.at(-1), 'OFFLINE_UNAVAILABLE')
  cached.get(cacheName).set(asset, contents)
})
await check('Interrupted installation fails without skipping the waiting state', async () => {
  rejectInstall = true
  const previous = skipped
  await assert.rejects(waitEvent('install'), /interrupted/)
  assert.equal(skipped, previous)
  assert.equal(await (await fetchEvent('/login')).text(), html)
})
await check('Vercel serves the manifest and worker with appropriate headers', () => {
  const headers = path => config.headers.find(rule => rule.source === path)?.headers ?? []
  assert.ok(headers('/sw.js').some(header => header.key === 'Cache-Control' && header.value.includes('no-store')))
  assert.ok(headers('/sw.js').some(header => header.key === 'Content-Type' && header.value.includes('javascript')))
  assert.ok(headers('/manifest.webmanifest').some(header => header.key === 'Content-Type' && header.value.includes('manifest+json')))
})
console.log(`Verified ${checks} PWA groups. Native phone installation and the public deployment require separate device checks.`)
