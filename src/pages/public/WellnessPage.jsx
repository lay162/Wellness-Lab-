import PageHero from '../../components/ui/PageHero'
import Card from '../../components/ui/Card'
import { usePageContent, getLucideIcon } from '../../lib/siteContent'
import { PageLoader } from '../../components/ui/Skeleton'

export default function WellnessPage() {
  const { meta, cards, loading } = usePageContent('wellness', { cardGroup: 'topics' })

  if (loading) return <PageLoader />

  return (
    <div>
      <PageHero title={meta.hero_title} subtitle={meta.hero_subtitle} />

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map(t => {
            const Icon = getLucideIcon(t.icon)
            return (
              <Card key={t.id} className="p-8 hover-lift">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-secondary/30 flex items-center justify-center shrink-0">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-text mb-2">{t.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{t.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {meta.note_html && (
          <Card className="mt-12 p-6 bg-accent/40 border-primary/10">
            <p className="text-sm text-text-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: meta.note_html }} />
          </Card>
        )}
      </section>
    </div>
  )
}
