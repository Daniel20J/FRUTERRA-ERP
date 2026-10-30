/* Build replaces these tokens with a fingerprint and the complete production shell. */
const CACHE_NAME = 'fruterra-shell-__VERSION__'
const PRECACHE = __PRECACHE__

self.addEventListener('install', event => {
  // Installation is atomic: an incomplete download cannot replace the working version.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' })))))
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await Promise.all((await caches.keys()).filter(key => key.startsWith('fruterra-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))
    await self.clients.claim()
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach(client => client.postMessage({ type: 'OFFLINE_READY' }))
  })())
})

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data?.type === 'CHECK_OFFLINE_READY') {
    event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
      const available = await Promise.all(PRECACHE.map(url => cache.match(url)))
      event.source?.postMessage({ type: available.every(Boolean) ? 'OFFLINE_READY' : 'OFFLINE_UNAVAILABLE' })
    }))
  }
})

self.addEventListener('fetch', event => {
  const { request } = event, url = new URL(request.url)
  // Never intercept business submissions, external resources or other origins.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    // Pin HTML and hashed assets to the same release until the user accepts an update.
    event.respondWith(caches.open(CACHE_NAME).then(async cache => (await cache.match('/index.html')) || fetch(request)))
    return
  }
  if (PRECACHE.includes(url.pathname)) event.respondWith(caches.open(CACHE_NAME).then(async cache => (await cache.match(url.pathname)) || fetch(request)))
})
