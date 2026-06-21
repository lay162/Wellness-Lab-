import { getBlogImageUrl } from '../../lib/blogImages'
import { cn } from '../../lib/utils'

export default function BlogCardImage({
  post,
  className,
  heightClass = 'h-52',
  showCategory = true,
}) {
  const src = getBlogImageUrl(post)

  return (
    <div className={cn('relative overflow-hidden', heightClass, className)}>
      <img
        src={src}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />
      {showCategory && post.category && (
        <span className="absolute bottom-3 left-3 text-[11px] font-semibold text-white uppercase tracking-wider bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
          {post.category}
        </span>
      )}
    </div>
  )
}
