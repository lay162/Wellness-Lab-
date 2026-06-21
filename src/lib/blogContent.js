import { SEED_BLOG_POSTS, getSeedBlogPost, isSeedBlogSlug } from '../data/seedBlogPosts'
import { slugify } from './utils'

export { getSeedBlogPost, isSeedBlogSlug }

export function mergeSeedBlogPosts(dbPosts, { publicOnly = false } = {}) {
  const db = dbPosts || []
  const importedSlugs = new Set(db.map(p => p.slug).filter(Boolean))

  let fromDb = db.map(p => ({ ...p, is_seed: false }))
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
    .map(({ id, is_seed, ...rest }) => ({
      ...rest,
      slug: rest.slug || slugify(rest.title),
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
  if (!supabase) return seed

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (data) return data.is_published ? data : null
  return seed
}
