import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

export default function pwaPlugin(): Plugin {
  return {
    name: 'fruterra-offline-shell',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const publicFiles = ['manifest.webmanifest', 'images/cultivo_login_berries.png', 'images/pwa/icon-192.png', 'images/pwa/icon-512.png', 'images/pwa/maskable-512.png', 'images/pwa/apple-touch-icon.png', 'images/pwa/fruterra.svg']
      const outputFiles = Object.keys(bundle).filter(file => file === 'index.html' || /\.(js|css|woff2?|png|svg)$/.test(file)).sort()
      if (!outputFiles.includes('index.html')) throw new Error('La PWA requiere index.html en el build.')
      const fingerprint = createHash('sha256')
      for (const file of outputFiles) {
        const entry = bundle[file]
        fingerprint.update(file).update(entry.type === 'chunk' ? entry.code : entry.source)
      }
      for (const file of publicFiles) fingerprint.update(file).update(readFileSync(new URL('../public/' + file, import.meta.url)))
      const template = readFileSync(new URL('../src/pwa/service-worker.js', import.meta.url), 'utf8')
      fingerprint.update(template)
      const version = fingerprint.digest('hex').slice(0, 16)
      const urls = [...new Set([...outputFiles, ...publicFiles].map(file => '/' + file))]
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: template.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(urls)) })
    },
  }
}
