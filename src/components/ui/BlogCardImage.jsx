import { useEffect, useState } from 'react'
import { getBlogImageUrl, getBlogRemoteImageUrl } from '../../lib/blogImages'
import { cn } from '../../lib/utils'
import { Leaf } from 'lucide-react'

const FALLBACK_STEPS = (post) => {
  const steps = [getBlogImageUrl(post)]
  const remote = getBlogRemoteImageUrl(post)
  if (remote && !steps.includes(remote)) steps.push(remote)
  return steps
}

export default function BlogCardImage({
  post,
  className,
  heightClass = 'h-52',
  showCategory = true,
  priority = false,
}) {
  const [step, setStep] = useState(0)
  const [failed, setFailed] = useState(false)
  const steps = FALLBACK_STEPS(post)
  const src = steps[step] || null

  useEffect(() => {
    setStep(0)
    setFailed(false)
  }, [post?.slug, post?.title, post?.cover_image, post?.seed_key])

  const handleError = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
      return
    }
    setFailed(true)
  }

  const alt = post?.title ? `${post.title} — featured image` : ''

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-200 shrink-0 w-full',
        heightClass,
        className,
      )}
    >
      {!failed && src ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url("${src}")` }}
            role="img"
            aria-label={alt}
          />
          <img
            src={src}
            alt=""
            aria-hidden
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            referrerPolicy="no-referrer"
            onError={handleError}
            className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-secondary/35 flex items-center justify-center">
          <Leaf className="w-10 h-10 text-primary/50" />
        </div>
      )}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />
      {showCategory && post?.category && (
        <span className="absolute bottom-3 left-3 z-20 text-[11px] font-semibold text-white uppercase tracking-wider bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
          {post.category}
        </span>
      )}
    </div>
  )
}
