import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const sourceDir = join(root, 'scripts', 'source-assets')
const logoSrc = join(sourceDir, 'logo-source.png')
const productSrc = join(sourceDir, 'product-source.png')

const publicDir = join(root, 'public')
const portalAssets = join(root, 'src', 'assets', 'portal')
mkdirSync(portalAssets, { recursive: true })

async function processLogo() {
  const { data, info } = await sharp(logoSrc)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = info
  let minX = width, minY = height, maxX = 0, maxY = 0

  // Find bounding box of non-black pixels (the white circle + logo content)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = data[i], g = data[i + 1], b = data[i + 2]
      // Skip pure black / near-black background from screenshot
      if (r + g + b > 60) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  const size = Math.max(maxX - minX, maxY - minY)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const pad = Math.round(size * 0.02)
  const cropSize = Math.round(size + pad * 2)
  const left = Math.max(0, Math.round(cx - cropSize / 2))
  const top = Math.max(0, Math.round(cy - cropSize / 2))

  const cropped = await sharp(logoSrc)
    .extract({
      left,
      top,
      width: Math.min(cropSize, width - left),
      height: Math.min(cropSize, height - top),
    })
    .resize(512, 512, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer()

  // Tight circular mask — removes black screenshot ring, keeps white circle only
  const mask = Buffer.from(
    `<svg width="512" height="512"><circle cx="256" cy="256" r="248" fill="white"/></svg>`
  )

  const logoCircle = await sharp(cropped)
    .composite([{ input: await sharp(mask).png().toBuffer(), blend: 'dest-in' }])
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer()

  await sharp(logoCircle).toFile(join(publicDir, 'logo.png'))
  await sharp(logoCircle).resize(192, 192).toFile(join(publicDir, 'app-icon-192.png'))
  await sharp(logoCircle).resize(512, 512).toFile(join(publicDir, 'app-icon-512.png'))
  await sharp(logoCircle).resize(32, 32).toFile(join(publicDir, 'favicon.png'))
  await sharp(logoCircle).resize(512, 512).toFile(join(publicDir, 'logo-placeholder.png'))

  console.log('Logo processed → public/logo.png (+ favicon & app icons)')
}

async function processProduct() {
  const { data, info } = await sharp(productSrc)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = info
  let minX = width, minY = height, maxX = 0, maxY = 0

  // Find product bounding box — exclude very dark/black screenshot edges
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = data[i], g = data[i + 1], b = data[i + 2]
      if (r + g + b > 40) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  // Trim dark screenshot edges, then resize onto clean white studio background
  await sharp(productSrc)
    .trim({ threshold: 20 })
    .resize(900, 900, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .modulate({ brightness: 1.03, saturation: 1.04 })
    .sharpen({ sigma: 0.6 })
    .png()
    .toFile(join(portalAssets, 'retatrutide-30mg.png'))

  console.log('Product processed → src/assets/portal/retatrutide-30mg.png')
}

await processLogo()
await processProduct()
console.log('Done.')
