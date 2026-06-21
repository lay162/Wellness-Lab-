import { SEED_SUCCESS_STORIES, SEED_REVIEWS } from '../data/seedStories'

/** Stable id used to link a seed row to its database copy */
export function getSeedKey(item) {
  if (!item) return null
  if (item.seed_key) return item.seed_key
  if (typeof item.id === 'string' && item.id.startsWith('seed-')) return item.id
  return null
}

function mapSeedItem(item, { privatePortal = false } = {}) {
  return {
    ...item,
    seed_key: item.id,
    is_seed: true,
    content: privatePortal ? (item.content_private || item.content) : item.content,
  }
}

/**
 * Merge database rows with built-in seed content.
 * Seeds only appear when no DB row shares the same seed_key — so the site and admin stay in sync.
 */
export function mergeWithSeeds(dbItems, seeds, { publicOnly = false, privatePortal = false } = {}) {
  const db = dbItems || []
  let seedList = seeds || []

  if (publicOnly) seedList = seedList.filter(s => s.is_public)

  const importedKeys = new Set(db.map(getSeedKey).filter(Boolean))

  const fromSeeds = seedList
    .filter(s => !importedKeys.has(s.id))
    .map(s => mapSeedItem(s, { privatePortal }))

  return [...db.map(item => ({ ...item, is_seed: false })), ...fromSeeds]
}

export function mergeSeedStories(stories, options = {}) {
  return mergeWithSeeds(stories, SEED_SUCCESS_STORIES, options)
}

export function mergeSeedReviews(reviews, options = {}) {
  return mergeWithSeeds(reviews, SEED_REVIEWS, options)
}

/** Strip seed-only fields before writing to Supabase */
export function toDbPayload(form, { seedKey } = {}) {
  const payload = { ...form }
  delete payload.id
  delete payload.is_seed
  delete payload.created_at
  delete payload.updated_at
  if (seedKey) payload.seed_key = seedKey
  return payload
}

export function isSeedId(id) {
  return typeof id === 'string' && id.startsWith('seed-')
}

/** Insert all seed reviews & success stories that are not yet in the database */
export async function importSeedWebsiteContent(supabase) {
  const [reviewsRes, storiesRes] = await Promise.all([
    supabase.from('reviews').select('seed_key'),
    supabase.from('success_stories').select('seed_key'),
  ])

  const existingReviewKeys = new Set((reviewsRes.data || []).map(r => r.seed_key).filter(Boolean))
  const existingStoryKeys = new Set((storiesRes.data || []).map(s => s.seed_key).filter(Boolean))

  const reviewsToInsert = SEED_REVIEWS
    .filter(r => !existingReviewKeys.has(r.id))
    .map(r => ({
      seed_key: r.id,
      author_name: r.author_name,
      content: r.content,
      content_private: r.content_private || null,
      rating: r.rating,
      image_url: r.image_url || null,
      is_public: r.is_public,
      is_approved: r.is_approved,
    }))

  const storiesToInsert = SEED_SUCCESS_STORIES
    .filter(s => !existingStoryKeys.has(s.id))
    .map(s => ({
      seed_key: s.id,
      title: s.title,
      author_name: s.author_name,
      excerpt: s.excerpt,
      content: s.content,
      content_private: s.content_private || null,
      image_url: s.image_url || null,
      before_image: s.before_image || null,
      after_image: s.after_image || null,
      is_public: s.is_public,
      is_approved: s.is_approved,
    }))

  const results = { reviews: 0, stories: 0, errors: [] }

  if (reviewsToInsert.length > 0) {
    const { error } = await supabase.from('reviews').insert(reviewsToInsert)
    if (error) results.errors.push(error.message)
    else results.reviews = reviewsToInsert.length
  }

  if (storiesToInsert.length > 0) {
    const { error } = await supabase.from('success_stories').insert(storiesToInsert)
    if (error) results.errors.push(error.message)
    else results.stories = storiesToInsert.length
  }

  return results
}
