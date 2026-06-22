/**
 * GitHub Pages post-build — SPA fallback + business card path fix.
 * GitHub Pages has no server rewrites; 404.html is served for unknown paths.
 */
import { copyFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const dist = join(process.cwd(), 'dist')
const base = (process.env.VITE_BASE || '/').replace(/\/?$/, '/')
const cardUrl = `${base}businesscard/`

copyFileSync(join(dist, 'index.html'), join(dist, '404.html'))

writeFileSync(
  join(dist, 'businesscard.html'),
  `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${cardUrl}"><script>location.replace('${cardUrl}')</script></head><body></body></html>`
)

console.log(`GitHub Pages post-build: 404.html + businesscard redirect → ${cardUrl}`)
