import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { mergeSeedReviews, mergeSeedStories } from '../../data/seedStories'
import Card from '../../components/ui/Card'
import BeforeAfterCard from '../../components/ui/BeforeAfterCard'
import { SkeletonCard } from '../../components/ui/Skeleton'

export function PrivateReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews(mergeSeedReviews(data || [], { privatePortal: true }))
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-2">Private Reviews</h1>
      <p className="text-text-muted mb-8">Extended reviews available to approved customers</p>
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : reviews.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map(r => (
            <Card key={r.id} className="p-6">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: r.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-text-muted mb-4 leading-relaxed">{r.content}</p>
              <p className="font-medium text-sm">{r.author_name}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center"><p className="text-text-muted">No reviews available yet.</p></Card>
      )}
    </div>
  )
}

export function PrivateSuccessStoriesPage() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('success_stories').select('*').eq('is_approved', true).order('created_at', { ascending: false })
      .then(({ data }) => {
        setStories(mergeSeedStories(data || [], { privatePortal: true }))
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-2">Private Success Stories</h1>
      <p className="text-text-muted mb-8">Detailed success stories for approved customers</p>
      {loading ? (
        <div className="space-y-6">{[1,2].map(i => <SkeletonCard key={i} />)}</div>
      ) : stories.length > 0 ? (
        <div className="space-y-8">
          {stories.map(s => (
            <Card key={s.id} className="overflow-hidden">
              {(s.before_image || s.after_image) && (
                <div className="p-4 pb-0 max-w-lg">
                  <BeforeAfterCard before={s.before_image} after={s.after_image} author={s.author_name} />
                </div>
              )}
              <div className="p-6">
                <h3 className="font-semibold text-lg text-text mb-2">{s.title}</h3>
                {s.author_name && <p className="text-sm text-primary mb-3">{s.author_name}</p>}
                <div className="text-sm text-text-muted prose-content" dangerouslySetInnerHTML={{ __html: s.content }} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center"><p className="text-text-muted">No success stories available yet.</p></Card>
      )}
    </div>
  )
}

export function PrivateAftercarePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('aftercare_posts').select('*').eq('is_published', true).order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false) })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-2">Private Aftercare</h1>
      <p className="text-text-muted mb-8">Detailed aftercare guidance for approved customers</p>
      {loading ? (
        <div className="space-y-6">{[1,2].map(i => <SkeletonCard key={i} />)}</div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map(p => (
            <Card key={p.id} className="p-6">
              {p.category && <span className="text-xs font-medium text-primary uppercase">{p.category}</span>}
              <h3 className="font-semibold text-lg text-text mt-1 mb-3">{p.title}</h3>
              <div className="text-sm text-text-muted prose prose-sm" dangerouslySetInnerHTML={{ __html: p.content }} />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center"><p className="text-text-muted">No aftercare content available yet.</p></Card>
      )}
    </div>
  )
}

export function PrivateAdvicePage() {
  const [advice, setAdvice] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('wellness_advice').select('*').eq('is_published', true).order('created_at', { ascending: false })
      .then(({ data }) => { setAdvice(data || []); setLoading(false) })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-2">Wellness Advice</h1>
      <p className="text-text-muted mb-8">Exclusive wellness guidance for approved customers</p>
      {loading ? (
        <div className="space-y-6">{[1,2].map(i => <SkeletonCard key={i} />)}</div>
      ) : advice.length > 0 ? (
        <div className="space-y-6">
          {advice.map(a => (
            <Card key={a.id} className="p-6">
              {a.category && <span className="text-xs font-medium text-primary uppercase">{a.category}</span>}
              <h3 className="font-semibold text-lg text-text mt-1 mb-3">{a.title}</h3>
              <div className="text-sm text-text-muted prose prose-sm" dangerouslySetInnerHTML={{ __html: a.content }} />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center"><p className="text-text-muted">No wellness advice available yet.</p></Card>
      )}
    </div>
  )
}
