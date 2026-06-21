import PageHero from '../../components/ui/PageHero'
import { FeatureCard } from '../../components/ui/Card'
import { usePageContent, getLucideIcon } from '../../lib/siteContent'
import { PageLoader } from '../../components/ui/Skeleton'

export default function AboutPage() {
  const { meta, cards, loading } = usePageContent('about', { cardGroup: 'values' })

  if (loading) return <PageLoader />

  return (
    <div>
      <PageHero title={meta.hero_title} subtitle={meta.hero_subtitle} />

      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-text mb-6 tracking-tight">{meta.section_title}</h2>
        <div className="prose-content space-y-4" dangerouslySetInnerHTML={{ __html: meta.body_html || '' }} />
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {cards.map(c => {
              const Icon = getLucideIcon(c.icon)
              return (
                <FeatureCard key={c.id} icon={Icon} title={c.title} desc={c.description} />
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
