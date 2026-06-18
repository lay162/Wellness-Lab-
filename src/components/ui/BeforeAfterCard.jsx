import { cn } from '../../lib/utils'

export default function BeforeAfterCard({ before, after, author, className }) {
  if (!before && !after) return null

  return (
    <div className={cn('grid grid-cols-2 gap-2 rounded-xl overflow-hidden', className)}>
      {before && (
        <div className="relative aspect-[3/4] bg-gray-100">
          <img src={before} alt={author ? `${author} before` : 'Before'} className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-xs font-semibold uppercase tracking-wide">
            Before
          </span>
        </div>
      )}
      {after && (
        <div className="relative aspect-[3/4] bg-gray-100">
          <img src={after} alt={author ? `${author} after` : 'After'} className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-primary/90 text-white text-xs font-semibold uppercase tracking-wide">
            After
          </span>
        </div>
      )}
    </div>
  )
}

export function StoryCard({ story, showBeforeAfter = true }) {
  return (
    <div className="space-y-4">
      {showBeforeAfter && (story.before_image || story.after_image) ? (
        <BeforeAfterCard before={story.before_image} after={story.after_image} author={story.author_name} />
      ) : story.image_url ? (
        <img src={story.image_url} alt="" className="w-full h-52 object-cover rounded-xl" />
      ) : null}
      <div>
        <h3 className="font-semibold text-text">{story.title}</h3>
        {story.author_name && <p className="text-xs text-primary font-medium mt-1">{story.author_name}</p>}
        <p className="text-sm text-text-muted mt-2 leading-relaxed">
          {story.excerpt || story.content?.replace(/<[^>]*>/g, '').slice(0, 200)}
        </p>
      </div>
    </div>
  )
}
