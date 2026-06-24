import { assetUrl, resolveImageUrl } from './assetUrl.js'
import { getSeedBlogPost, SEED_BLOG_POSTS } from '../data/seedBlogPosts.js'

const SEED_BY_ID = Object.fromEntries(SEED_BLOG_POSTS.map((p) => [p.id, p]))
const SEED_BY_SLUG = Object.fromEntries(SEED_BLOG_POSTS.map((p) => [p.slug, p]))
const SEED_BY_TITLE = Object.fromEntries(SEED_BLOG_POSTS.map((p) => [p.title, p]))

function normTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const SEED_BY_NORM_TITLE = Object.fromEntries(
  SEED_BLOG_POSTS.map((p) => [normTitle(p.title), p]),
)

/** Verified Unsplash IDs — used at build time to fetch local copies. */
const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`

const U = {
  gymTraining: unsplash('photo-1571019613454-1cb2f99b2d8b'),
  gymWorkout: unsplash('photo-1517836357463-d25dfeac3438'),
  gymAthlete: unsplash('photo-1518611012118-696072aa579a'),
  gymFacility: unsplash('photo-1534438327276-14e5300c3a48'),
  weights: unsplash('photo-1571902943202-507ec2618e8f'),
  healthyBowl: unsplash('photo-1490645935967-10de6ba17061'),
  freshFood: unsplash('photo-1512621776951-a57141f2eefd'),
  meditation: unsplash('photo-1506126613408-eca07ce68773'),
  yogaRest: unsplash('photo-1544367567-0f2fcb009e0b'),
  beautySkincare: unsplash('photo-1522335789203-aabd1fc54bc9'),
  skincareProducts: unsplash('photo-1556228578-0d85b1a4d571'),
  studyFocus: unsplash('photo-1434030216411-0b793f4b4173'),
  booksFocus: unsplash('photo-1481627834876-b7833e8f5570'),
  supplements: unsplash('photo-1584308666744-24d5c474f2ae'),
  coupleWellness: unsplash('photo-1516589178581-6cd7833ae3b2'),
  businessMeeting: unsplash('photo-1556761175-b413da4baf72'),
  documents: unsplash('photo-1450101499163-c8848c66ca85'),
  shopRetail: unsplash('photo-1556742049-0cfed4f6a45d'),
  natureWellness: unsplash('photo-1505751172876-fa1923c5c528'),
  diningCouple: unsplash('photo-1544025162-d76694265947'),
}

/** Remote URLs keyed by seed id — used by ensure-content-images.mjs at build time. */
export const BLOG_REMOTE_BY_SEED_ID = {
  'seed-blog-1': U.gymTraining,
  'seed-blog-2': U.meditation,
  'seed-blog-3': U.healthyBowl,
  'seed-blog-4': U.weights,
  'seed-blog-5': U.beautySkincare,
  'seed-blog-6': U.studyFocus,
  'seed-blog-7': U.gymWorkout,
  'seed-blog-8': U.yogaRest,
  'seed-blog-9': U.skincareProducts,
  'seed-blog-10': U.gymAthlete,
  'seed-blog-11': U.booksFocus,
  'seed-blog-12': U.supplements,
  'seed-blog-13': U.coupleWellness,
  'seed-blog-14': U.freshFood,
  'seed-blog-15': U.gymFacility,
  'seed-blog-16': U.gymAthlete,
  'seed-blog-17': U.documents,
  'seed-blog-18': U.businessMeeting,
  'seed-blog-19': U.gymTraining,
  'seed-blog-20': U.meditation,
  'seed-blog-21': U.beautySkincare,
  'seed-blog-22': U.freshFood,
  'seed-blog-23': U.natureWellness,
  'seed-blog-24': U.shopRetail,
}

export const BLOG_REMOTE_IMAGES = Object.fromEntries(
  SEED_BLOG_POSTS.map((p) => [p.slug, BLOG_REMOTE_BY_SEED_ID[p.id]]),
)

export const BLOG_CATEGORY_IMAGES = {
  Metabolic: [U.gymTraining, U.gymWorkout, U.gymAthlete],
  'Hormone & Growth': [U.gymAthlete, U.meditation, U.weights],
  'Immune Support': [U.healthyBowl, U.freshFood],
  'Recovery & Repair': [U.weights, U.gymWorkout, U.yogaRest],
  'Anti-Aging & Beauty': [U.beautySkincare, U.skincareProducts],
  Cognitive: [U.studyFocus, U.booksFocus],
  'Energy & Vitamins': [U.skincareProducts, U.supplements],
  'Intimacy & Wellness': [U.coupleWellness, U.diningCouple],
  'Wellness Business': [U.gymFacility, U.businessMeeting],
  Education: [U.documents, U.booksFocus],
  Compliance: [U.businessMeeting, U.documents],
  'Getting Started': [U.natureWellness, U.meditation],
  Shop: [U.shopRetail, U.gymFacility],
  default: [U.natureWellness, U.healthyBowl],
}

export function blogCoverPathForSeedId(seedId) {
  const match = /^seed-blog-(\d+)$/.exec(seedId || '')
  if (!match) return null
  return `content/blog/blog-${match[1].padStart(2, '0')}.jpg`
}

function slugIndex(slug) {
  if (!slug) return 0
  return [...slug].reduce((sum, c) => sum + c.charCodeAt(0), 0)
}

export function getBlogCategoryImage(post) {
  const pool = BLOG_CATEGORY_IMAGES[post?.category] || BLOG_CATEGORY_IMAGES.default
  return pool[slugIndex(post?.slug) % pool.length]
}

function matchSeedPost(post) {
  if (!post) return null
  if (post.id && SEED_BY_ID[post.id]) return SEED_BY_ID[post.id]
  if (post.seed_key && SEED_BY_ID[post.seed_key]) return SEED_BY_ID[post.seed_key]
  if (post.slug && SEED_BY_SLUG[post.slug]) return SEED_BY_SLUG[post.slug]
  if (post.title && SEED_BY_TITLE[post.title]) return SEED_BY_TITLE[post.title]
  const normalized = normTitle(post.title)
  if (normalized && SEED_BY_NORM_TITLE[normalized]) return SEED_BY_NORM_TITLE[normalized]
  if (post.slug) {
    const seed = getSeedBlogPost(post.slug)
    if (seed) return seed
  }
  return null
}

export function resolveBlogCoverPath(post) {
  if (post?.cover_image) return post.cover_image
  const seed = matchSeedPost(post)
  if (seed?.cover_image) return seed.cover_image
  if (seed?.id) return blogCoverPathForSeedId(seed.id)
  return blogCoverPathForSeedId(`seed-blog-${(slugIndex(post?.slug) % SEED_BLOG_POSTS.length) + 1}`)
}

export function attachBlogCoverImage(post) {
  if (!post) return post
  const cover_image = resolveBlogCoverPath(post)
  return cover_image ? { ...post, cover_image } : post
}

export function getBlogLocalImageUrl(path) {
  if (!path) return null
  return assetUrl(path)
}

/** Resolve the best image for a blog post — always prefers bundled local JPEGs. */
export function getBlogImageUrl(post) {
  const enriched = post?.cover_image ? post : attachBlogCoverImage(post)
  if (enriched?.cover_image) {
    return getBlogLocalImageUrl(enriched.cover_image)
  }

  if (post?.image_url && !/images\.unsplash\.com/i.test(post.image_url)) {
    if (/^https?:\/\//i.test(post.image_url)) return post.image_url
    return resolveImageUrl(post.image_url)
  }

  return getBlogCategoryImage(post)
}

/** Remote fallback when a local blog asset is missing (e.g. before first build). */
export function getBlogRemoteImageUrl(post) {
  const seed = matchSeedPost(post)
  if (seed?.id && BLOG_REMOTE_BY_SEED_ID[seed.id]) return BLOG_REMOTE_BY_SEED_ID[seed.id]
  return getBlogCategoryImage(post)
}
