import { useState } from 'react'
import { getBlogImageUrl, getBlogCategoryImage } from '../../lib/blogImages'
import { cn } from '../../lib/utils'
import { Leaf } from 'lucide-react'

export default function BlogCardImage({
  post,
  className,
  heightClass = 'h-52',
  showCategory = true,
}) {
  const [useCategoryFallback, setUseCategoryFallback] = useState(false)
  const [failed, setFailed] = useState(false)
  const src = useCategoryFallback ? getBlogCategoryImage(post) : getBlogImageUrl(post)

  return (
    <div className={cn('relative overflow-hidden', heightClass, className)}>
      {!failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => {
            if (!useCategoryFallback) setUseCategoryFallback(true)
            else setFailed(true)
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center">
          <Leaf className="w-10 h-10 text-primary/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />
      {showCategory && post.category && (
        <span className="absolute bottom-3 left-3 text-[11px] font-semibold text-white uppercase tracking-wider bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
          {post.category}
        </span>
      )}
    </div>
  )
}
