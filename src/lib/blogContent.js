import { SEED_BLOG_POSTS, getSeedBlogPost, isSeedBlogSlug } from '../data/seedBlogPosts.js'
import { slugify } from './utils'
import { attachBlogCoverImage, getBlogImageUrl as resolveCoverUrl } from './blogImages.js'

/** Drop stale external URLs from DB — cover images always resolve from local assets. */
function normalizeBlogPost(post) {
  if (!post) return post
  const { image_url: _removed, ...rest } = post
  return attachBlogCoverImage(rest)
}

export { getSeedBlogPost, isSeedBlogSlug }

export function mergeSeedBlogPosts(dbPosts, { publicOnly = false } = {}) {
  const db = dbPosts || []
  const importedSlugs = new Set(db.map(p => p.slug).filter(Boolean))

  let fromDb = db.map(p => normalizeBlogPost({ ...p, is_seed: false }))
  if (publicOnly) fromDb = fromDb.filter(p => p.is_published)

  const fromSeeds = SEED_BLOG_POSTS
    .filter(s => !importedSlugs.has(s.slug))
    .map(s => ({ ...s, is_seed: true }))
    .filter(s => !publicOnly || s.is_published)

  return [...fromDb, ...fromSeeds]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function importSeedBlogPosts(supabase) {
  const { data: existing } = await supabase.from('blog_posts').select('slug')
  const existingSlugs = new Set((existing || []).map(r => r.slug))

  const toInsert = SEED_BLOG_POSTS
    .filter(p => !existingSlugs.has(p.slug))
    .map(({ id, is_seed, cover_image, ...rest }) => ({
      ...rest,
      slug: rest.slug || slugify(rest.title),
      seed_key: id,
      is_published: true,
    }))

  if (toInsert.length === 0) {
    return { inserted: 0, errors: [] }
  }

  const { error } = await supabase.from('blog_posts').insert(toInsert)
  return {
    inserted: error ? 0 : toInsert.length,
    errors: error ? [error.message] : [],
  }
}

export async function resolveBlogPost(supabase, slug) {
  const seed = getSeedBlogPost(slug)
  if (!supabase) return seed ? attachBlogCoverImage(seed) : null

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (data) return data.is_published ? normalizeBlogPost(data) : null
  return seed ? attachBlogCoverImage(seed) : null
}

/** Public helper for pages that load a single post outside mergeSeedBlogPosts. */
export function enrichBlogPost(post) {
  return normalizeBlogPost(post)
}

export function getBlogImageUrl(post) {
  return resolveCoverUrl(post)
}
