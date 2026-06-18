import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { mergeSeedReviews } from '../../data/seedStories'
import Card from '../../components/ui/Card'
import PageHero from '../../components/ui/PageHero'
import { SkeletonCard } from '../../components/ui/Skeleton'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(() => mergeSeedReviews([], { publicOnly: true }))
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('reviews').select('*').eq('is_public', true).eq('is_approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews(mergeSeedReviews(data || [], { publicOnly: true }))
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <PageHero title="Client Reviews" subtitle="Hear from clients who have experienced our wellness support." />

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(r => (
              <Card key={r.id} className="p-7 hover-lift">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: r.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-text-muted mb-5 leading-relaxed">{r.content}</p>
                <p className="font-semibold text-sm text-text">{r.author_name}</p>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">Reviews will be published here soon.</p>
          </div>
        )}
      </section>
    </div>
  )
}
