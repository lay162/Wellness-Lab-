import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { mergeSeedStories } from '../../lib/websiteContent'
import Card, { CardBody } from '../../components/ui/Card'
import { StoryBeforeAfter } from '../../components/ui/ContentMedia'
import PageHero from '../../components/ui/PageHero'
import { SkeletonCard } from '../../components/ui/Skeleton'
import brand from '../../config/brand'

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState(() => mergeSeedStories([], { publicOnly: true }))
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('success_stories').select('*').eq('is_public', true).eq('is_approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setStories(mergeSeedStories(data || [], { publicOnly: true }))
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <PageHero
        title="Success Stories"
        subtitle="Real wellness journeys from our community. Individual results may vary."
      />

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-text-muted mb-10 p-4 bg-accent/50 rounded-xl border border-primary/10">
          {brand.disclaimer} Success stories are shared with permission and do not constitute medical claims.
        </p>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">{[1,2].map(i => <SkeletonCard key={i} />)}</div>
        ) : stories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {stories.map(s => (
              <Card key={s.id} className="overflow-hidden">
                <StoryBeforeAfter story={s} className="p-4 pb-0" />
                <CardBody>
                  <h3 className="font-semibold text-lg text-text mb-1">{s.title}</h3>
                  {s.author_name && <p className="text-xs text-primary font-medium mb-3">{s.author_name}</p>}
                  <div className="text-sm text-text-muted leading-relaxed prose-content" dangerouslySetInnerHTML={{ __html: s.content }} />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">Success stories will be published here soon.</p>
          </div>
        )}
      </section>
    </div>
  )
}
