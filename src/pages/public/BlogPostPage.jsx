import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { resolveBlogPost } from '../../lib/blogContent'
import { getBlogImageUrl } from '../../lib/blogImages'
import { formatDate } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'
import BlogCardImage from '../../components/ui/BlogCardImage'
import SeoHead from '../../components/seo/SeoHead'
import { articleSchema, SITE_URL } from '../../config/seo'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    resolveBlogPost(isSupabaseConfigured ? supabase : null, slug)
      .then(data => { setPost(data); setLoading(false) })
  }, [slug])

  if (loading) return <PageLoader />

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <SeoHead title="Article Not Found | Wellness Lab" noindex path={`/blog/${slug}`} />
        <h1 className="text-2xl font-bold text-text mb-4">Article Not Found</h1>
        <Link to="/blog" className="text-primary hover:underline">Back to Blog</Link>
      </div>
    )
  }

  const ogImage = getBlogImageUrl(post)

  return (
    <>
      <SeoHead
        title={`${post.title} | Wellness Lab UK`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`}
        type="article"
        keywords={[post.category, post.title, 'Wellness Lab UK', 'peptides UK'].filter(Boolean).join(', ')}
        jsonLd={articleSchema(post)}
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-8 hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
        <BlogCardImage post={post} heightClass="h-64 sm:h-80" className="rounded-2xl mb-8" showCategory={false} />
        {post.category && <span className="text-xs font-medium text-primary uppercase tracking-wide">{post.category}</span>}
        <h1 className="text-3xl sm:text-4xl font-bold text-text mt-2 mb-4">{post.title}</h1>
        <p className="text-sm text-text-muted mb-8">{formatDate(post.created_at)}</p>
        {post.excerpt && <p className="text-lg text-text-muted mb-8 leading-relaxed">{post.excerpt}</p>}
        <div className="prose prose-green max-w-none text-text-muted" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </>
  )
}
