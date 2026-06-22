/** Keep image fields aligned between admin and the public website */
import { resolveImageUrl } from './assetUrl'

export function getReviewImage(review) {
  return resolveImageUrl(review?.image_url)
}

export function getStoryBeforeAfter(story) {
  return {
    before: resolveImageUrl(story?.before_image),
    after: resolveImageUrl(story?.after_image || story?.image_url),
  }
}

/** After save — image_url matches the primary after photo for listings */
export function syncStoryImageFields(payload) {
  const next = { ...payload }
  if (next.after_image) {
    next.image_url = next.after_image
  } else if (next.before_image && !next.image_url) {
    next.image_url = next.before_image
  }
  return next
}
