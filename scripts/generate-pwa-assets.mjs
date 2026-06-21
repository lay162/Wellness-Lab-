/**
 * Generates PWA icons, maskable icons, and iOS splash screens from logo.png
 * (falls back to logo-placeholder.svg when logo.png is missing).
 */
import sharp from 'sharp'
import { existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const splashDir = join(publicDir, 'splash')
mkdirSync(splashDir, { recursive: true })

const BRAND = {
  primary: '#1E6B5C',
  primaryDark: '#145A4A',
  primaryLight: '#2A9D8F',
  secondary: '#7CB342',
  splashBg: '#F8FAF9',
}

function gradientSvg(w, h) {
  return Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${BRAND.primaryDark}"/>
          <stop offset="40%" stop-color="${BRAND.primary}"/>
          <stop offset="75%" stop-color="${BRAND.primaryLight}"/>
          <stop offset="100%" stop-color="${BRAND.secondary}"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
    </svg>`)
}

async function loadLogoBuffer() {
  const logoPng = join(publicDir, 'logo.png')
  if (existsSync(logoPng)) {
    return sharp(logoPng).resize(512, 512, { fit: 'cover' }).png().toBuffer()
  }
  return sharp(join(publicDir, 'logo-placeholder.svg'))
    .resize(512, 512)
    .png()
    .toBuffer()
}

async function writeIcon(size, logoBuf, filename, { maskable = false } = {}) {
  const canvas = maskable ? Math.round(size * 0.8) : size
  const logoSize = maskable ? Math.round(size * 0.52) : size
  const logo = await sharp(logoBuf).resize(logoSize, logoSize, { fit: 'cover' }).png().toBuffer()

  const bg = maskable
    ? await sharp({
        create: { width: size, height: size, channels: 4, background: BRAND.primary },
      }).png().toBuffer()
    : logo

  if (maskable) {
    await sharp(bg)
      .composite([{ input: logo, gravity: 'centre' }])
      .png()
      .toFile(join(publicDir, filename))
  } else {
    await sharp(logo).resize(size, size, { fit: 'cover' }).png().toFile(join(publicDir, filename))
  }
}

async function writeSplash(width, height, logoBuf, filename) {
  const logoSize = Math.round(Math.min(width, height) * 0.2)
  const logo = await sharp(logoBuf).resize(logoSize, logoSize, { fit: 'cover' }).png().toBuffer()
  const ringSize = logoSize + 24

  const ring = Buffer.from(
    `<svg width="${ringSize}" height="${ringSize}">
      <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${ringSize / 2 - 2}" fill="white" opacity="0.95"/>
    </svg>`
  )

  const titleSvg = Buffer.from(`
    <svg width="${width}" height="120">
      <text x="50%" y="70" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="700" fill="white">Wellness Lab</text>
    </svg>`)

  const top = Math.round(height * 0.38 - ringSize / 2)

  await sharp(gradientSvg(width, height))
    .composite([
      { input: ring, top, left: Math.round((width - ringSize) / 2) },
      { input: logo, top: top + 12, left: Math.round((width - logoSize) / 2) },
      { input: titleSvg, top: top + ringSize + 16, left: 0 },
    ])
    .png()
    .toFile(join(splashDir, filename))
}

const SPLASH_SIZES = [
  [1170, 2532, 'apple-1170x2532.png'],
  [1284, 2778, 'apple-1284x2778.png'],
  [1290, 2796, 'apple-1290x2796.png'],
  [828, 1792, 'apple-828x1792.png'],
  [1242, 2688, 'apple-1242x2688.png'],
  [750, 1334, 'apple-750x1334.png'],
]

const logoBuf = await loadLogoBuffer()

await writeIcon(32, logoBuf, 'favicon.png')
await writeIcon(180, logoBuf, 'apple-touch-icon.png')
await writeIcon(192, logoBuf, 'app-icon-192.png')
await writeIcon(512, logoBuf, 'app-icon-512.png')
await writeIcon(512, logoBuf, 'app-icon-maskable-512.png', { maskable: true })

if (!existsSync(join(publicDir, 'logo.png'))) {
  await sharp(logoBuf).toFile(join(publicDir, 'logo.png'))
  console.log('logo.png generated from placeholder SVG')
}

for (const [w, h, name] of SPLASH_SIZES) {
  await writeSplash(w, h, logoBuf, name)
}

console.log('PWA assets generated: icons + iOS splash screens in public/splash/')
