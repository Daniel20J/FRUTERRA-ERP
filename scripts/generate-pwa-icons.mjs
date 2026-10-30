import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

// Rasterize the existing F brand mark without new dependencies or external image services.
const output = new URL('../public/images/pwa/', import.meta.url)
mkdirSync(output, { recursive: true })
function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0) }
  return (crc ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const name = Buffer.from(type), length = Buffer.alloc(4), checksum = Buffer.alloc(4)
  length.writeUInt32BE(data.length); checksum.writeUInt32BE(crc32(Buffer.concat([name, data])))
  return Buffer.concat([length, name, data, checksum])
}
function makeIcon(size) {
  const raw = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let coverage = 0
    for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
      const px = (x + (sx + .5) / 4) * 512 / size, py = (y + (sy + .5) / 4) * 512 / size
      if (px >= 150 && px < 204 && py >= 130 && py < 382 || px >= 150 && px < 362 && py >= 130 && py < 180 || px >= 150 && px < 336 && py >= 236 && py < 286) coverage++
    }
    const offset = y * (size * 3 + 1) + 1 + x * 3
    ;[23, 39, 52].forEach((background, channel) => { raw[offset + channel] = Math.round(background + ([228, 173, 100][channel] - background) * coverage / 16) })
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 2
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['maskable-512.png', 512], ['apple-touch-icon.png', 180]]) writeFileSync(new URL(name, output), makeIcon(size))
console.log('FRUTERRA: iconos PWA de 192, 512 y 180 px generados.')
