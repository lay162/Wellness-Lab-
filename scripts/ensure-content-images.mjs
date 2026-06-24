/**
 * Ensures public content images exist before build (CI-safe).
 * Tries real testimonial processing when source files are present;
 * otherwise generates simple placeholder JPEGs so paths never 404.
 */
import sharp from 'sharp'
import { existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import { BLOG_REMOTE_BY_SEED_ID } from '../src/lib/blogImages.js'
import { SEED_BLOG_POSTS } from '../src/data/seedBlogPosts.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'content', 'success-stories')
const blogDir = join(root, 'public', 'content', 'blog')
const portalDir = join(root, 'src', 'assets', 'portal')
const publicDir = join(root, 'public')

mkdirSync(outDir, { recursive: true })
mkdirSync(blogDir, { recursive: true })
mkdirSync(portalDir, { recursive: true })

const STORY_IMAGES = [
  'chantelle-anita-rowland-before.jpg',
  'chantelle-anita-rowland-after.jpg',
  'steph-wilcock-before.jpg',
  'steph-wilcock-after.jpg',
]

const missingStories = STORY_IMAGES.filter((f) => !existsSync(join(outDir, f)))
if (missingStories.length > 0) {
  const proc = spawnSync(process.execPath, [join(__dirname, 'process-testimonial-assets.mjs')], {
    cwd: root,
    stdio: 'pipe',
    encoding: 'utf8',
  })
  if (proc.status === 0) {
    console.log('Testimonial images processed from source assets')
  }
}

async function writePlaceholderJpeg(path, label, colors) {
  const [c1, c2] = colors
  const svg = Buffer.from(`
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <text x="400" y="310" text-anchor="middle" fill="rgba(255,255,255,0.85)"
        font-family="Georgia,serif" font-size="36" font-weight="600">${label}</text>
    </svg>`)
  await sharp(svg).jpeg({ quality: 85 }).toFile(path)
}

const stillMissing = STORY_IMAGES.filter((f) => !existsSync(join(outDir, f)))
if (stillMissing.length > 0) {
  const palette = [
    ['#145A4A', '#2A9D8F'],
    ['#1E6B5C', '#7CB342'],
    ['#1B4332', '#40916C'],
    ['#2D6A4F', '#95D5B2'],
  ]
  for (let i = 0; i < STORY_IMAGES.length; i++) {
    const file = STORY_IMAGES[i]
    const dest = join(outDir, file)
    if (!existsSync(dest)) {
      const kind = file.includes('before') ? 'Before' : 'After'
      await writePlaceholderJpeg(dest, kind, palette[i % palette.length])
      console.log(`Placeholder created: content/success-stories/${file}`)
    }
  }
}

const productPng = join(portalDir, 'retatrutide-30mg.png')
if (!existsSync(productPng)) {
  const svg = Buffer.from(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" rx="24" fill="#F8FAF9"/>
      <rect x="120" y="80" width="160" height="240" rx="20" fill="#1E6B5C" opacity="0.9"/>
      <rect x="140" y="100" width="120" height="160" rx="8" fill="#E8F5E9"/>
      <text x="200" y="360" text-anchor="middle" fill="#1E6B5C" font-family="Inter,sans-serif" font-size="14" font-weight="600">Product</text>
    </svg>`)
  await sharp(svg).png().toFile(productPng)
  console.log('Placeholder created: src/assets/portal/retatrutide-30mg.png')
}

const ogImage = join(publicDir, 'og-image.png')
if (!existsSync(ogImage) && existsSync(join(publicDir, 'logo.png'))) {
  const logo = await sharp(join(publicDir, 'logo.png')).resize(280, 280).png().toBuffer()
  const bg = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: '#145A4A' },
  }).png().toBuffer()
  await sharp(bg)
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toFile(ogImage)
  console.log('og-image.png generated')
}

const categoryBySlug = Object.fromEntries(SEED_BLOG_POSTS.map((p) => [p.slug, p.category]))
const blogPalette = [
  ['#145A4A', '#2A9D8F'],
  ['#1E6B5C', '#7CB342'],
  ['#1B4332', '#40916C'],
  ['#2D6A4F', '#95D5B2'],
  ['#0F4C3A', '#52B788'],
]

for (let i = 0; i < SEED_BLOG_POSTS.length; i++) {
  const post = SEED_BLOG_POSTS[i]
  const fileName = `blog-${String(i + 1).padStart(2, '0')}.jpg`
  const dest = join(blogDir, fileName)
  if (existsSync(dest)) continue

  const remoteUrl = BLOG_REMOTE_BY_SEED_ID[post.id]
  let saved = false

  if (remoteUrl) {
    try {
      const res = await fetch(remoteUrl, { signal: AbortSignal.timeout(20000) })
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        await sharp(buf).resize(800, 600, { fit: 'cover' }).jpeg({ quality: 85 }).toFile(dest)
        console.log(`Blog image downloaded: content/blog/${fileName}`)
        saved = true
      }
    } catch {
      /* fall through to placeholder */
    }
  }

  if (!saved) {
    const label = (categoryBySlug[post.slug] || post.category || 'Wellness').slice(0, 28)
    await writePlaceholderJpeg(dest, label, blogPalette[i % blogPalette.length])
    console.log(`Blog placeholder created: content/blog/${fileName}`)
  }
}

console.log('Content images ready')
