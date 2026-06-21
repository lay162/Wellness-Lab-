import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import Card, { CardBody } from '../../components/ui/Card'
import { SkeletonCard, PageLoader } from '../../components/ui/Skeleton'
import { usePageContent } from '../../lib/siteContent'

export default function AftercarePage() {
  const { meta, loading: metaLoading } = usePageContent('aftercare')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('aftercare_posts').select('*').eq('is_public', true).eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false) })
  }, [])

  if (metaLoading) return <PageLoader />

  return (
    <div>
      <section className="gradient-hero text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{meta.hero_title}</h1>
          <p className="text-white/80 max-w-2xl mx-auto">{meta.hero_subtitle}</p>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="space-y-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(p => (
              <Card key={p.id}>
                <CardBody>
                  {p.category && <span className="text-xs font-medium text-primary uppercase">{p.category}</span>}
                  <h3 className="font-semibold text-lg text-text mt-1 mb-3">{p.title}</h3>
                  <div className="text-sm text-text-muted prose prose-sm" dangerouslySetInnerHTML={{ __html: p.content }} />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">Aftercare content will be published here soon.</p>
          </div>
        )}

        <div className="mt-12 p-6 bg-accent/50 rounded-2xl border border-primary/10">
          <p className="text-sm text-text-muted" dangerouslySetInnerHTML={{ __html: meta.note_html || '' }} />
        </div>
      </section>
    </div>
  )
}
