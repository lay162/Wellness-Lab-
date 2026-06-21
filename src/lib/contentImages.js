/** Keep image fields aligned between admin and the public website */

export function getReviewImage(review) {
  return review?.image_url || null
}

export function getStoryBeforeAfter(story) {
  return {
    before: story?.before_image || null,
    after: story?.after_image || story?.image_url || null,
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
