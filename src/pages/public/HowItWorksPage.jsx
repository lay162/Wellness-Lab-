import PageHero from '../../components/ui/PageHero'
import Card from '../../components/ui/Card'
import { usePageContent, getLucideIcon } from '../../lib/siteContent'
import { PageLoader } from '../../components/ui/Skeleton'

export default function HowItWorksPage() {
  const { meta, cards, loading } = usePageContent('how-it-works', { cardGroup: 'steps' })

  if (loading) return <PageLoader />

  return (
    <div>
      <PageHero title={meta.hero_title} subtitle={meta.hero_subtitle} />

      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="space-y-6">
          {cards.map((s, i) => {
            const Icon = getLucideIcon(s.icon)
            return (
              <Card key={s.id} className="p-6 hover-lift">
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-2xl gradient-button flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-lg shadow-primary/20">
                    {s.step_label || String(i + 1).padStart(2, '0')}
                  </div>
                  <div className={i < cards.length - 1 ? 'pb-2' : ''}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg text-text">{s.title}</h3>
                    </div>
                    <p className="text-text-muted leading-relaxed">{s.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
