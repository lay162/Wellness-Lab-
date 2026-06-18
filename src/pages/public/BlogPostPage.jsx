import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).single()
      .then(({ data }) => { setPost(data); setLoading(false) })
  }, [slug])

  if (loading) return <PageLoader />

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-text mb-4">Article Not Found</h1>
        <Link to="/blog" className="text-primary hover:underline">Back to Blog</Link>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/blog" className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-8 hover:gap-3 transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>
      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-8" />
      )}
      {post.category && <span className="text-xs font-medium text-primary uppercase tracking-wide">{post.category}</span>}
      <h1 className="text-3xl sm:text-4xl font-bold text-text mt-2 mb-4">{post.title}</h1>
      <p className="text-sm text-text-muted mb-8">{formatDate(post.created_at)}</p>
      {post.excerpt && <p className="text-lg text-text-muted mb-8 leading-relaxed">{post.excerpt}</p>}
      <div className="prose prose-green max-w-none text-text-muted" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
