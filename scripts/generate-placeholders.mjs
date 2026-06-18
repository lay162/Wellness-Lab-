import { writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svg = readFileSync(join(publicDir, 'logo-placeholder.svg'))

// Minimal valid 1x1 green PNG (base64 decoded)
const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

// Write SVG-based references; copy SVG as fallback PNG names use minimal PNG
// For proper icons, replace these files with your branded assets
writeFileSync(join(publicDir, 'favicon.png'), png1x1)
writeFileSync(join(publicDir, 'app-icon-192.png'), png1x1)
writeFileSync(join(publicDir, 'app-icon-512.png'), png1x1)
writeFileSync(join(publicDir, 'logo-placeholder.png'), png1x1)

// Also write a proper SVG favicon
writeFileSync(join(publicDir, 'favicon.svg'), svg)
console.log('Placeholder assets generated in public/')
