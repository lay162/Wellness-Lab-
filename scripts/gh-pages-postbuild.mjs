/**
 * GitHub Pages post-build — SPA fallback + business card path fix.
 * GitHub Pages has no server rewrites; 404.html is served for unknown paths.
 */
import { copyFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const dist = join(process.cwd(), 'dist')

copyFileSync(join(dist, 'index.html'), join(dist, '404.html'))

// /businesscard (no trailing slash) → static folder needs /
writeFileSync(
  join(dist, 'businesscard.html'),
  `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/businesscard/"><script>location.replace('/businesscard/')</script></head><body></body></html>`
)

console.log('GitHub Pages post-build: 404.html + businesscard redirect ready')
