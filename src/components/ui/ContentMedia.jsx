import BeforeAfterCard from './BeforeAfterCard'
import { getReviewImage, getStoryBeforeAfter } from '../../lib/contentImages'

export function ReviewPhoto({ review, className = 'w-full h-40 object-cover' }) {
  const src = getReviewImage(review)
  if (!src) return null
  return (
    <img src={src} alt="" className={className} />
  )
}

export function ReviewCardContent({ review, className = '', privatePortal = false }) {
  const src = getReviewImage(review)
  const text = privatePortal ? (review.content_private || review.content) : review.content
  return (
    <>
      {src && (
        <div className="overflow-hidden rounded-xl mb-4 -mt-1">
          <img src={src} alt="" className="w-full h-44 object-cover" />
        </div>
      )}
      <p className={`text-sm text-text-muted mb-5 leading-relaxed ${className}`}>{text}</p>
    </>
  )
}

export function StoryBeforeAfter({ story, className = '' }) {
  const { before, after } = getStoryBeforeAfter(story)
  if (!before && !after) return null
  return (
    <div className={className}>
      <BeforeAfterCard before={before} after={after} author={story.author_name} />
    </div>
  )
}
