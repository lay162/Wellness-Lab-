import PageHero from '../../components/ui/PageHero'
import brand from '../../config/brand'
import { Target, Eye, Heart } from 'lucide-react'
import { FeatureCard } from '../../components/ui/Card'

export default function AboutPage() {
  return (
    <div>
      <PageHero title={`About ${brand.name}`} subtitle={brand.tagline} />

      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-text mb-6 tracking-tight">Our Story</h2>
        <div className="prose-content space-y-4">
          <p>
            {brand.name} was founded with a simple belief: everyone deserves access to thoughtful,
            professional wellness support. What began as a passion for holistic wellbeing has grown
            into a trusted platform serving clients across the United Kingdom.
          </p>
          <p>
            We combine evidence-informed practices with a deeply personal approach, ensuring every
            client feels heard, supported, and empowered on their wellness journey.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={Target} title="Our Mission" desc="To provide accessible, premium wellness support that empowers individuals to achieve their health and wellbeing goals." />
            <FeatureCard icon={Eye} title="Our Vision" desc="A world where quality wellness guidance is available to everyone who seeks it, delivered with integrity and care." />
            <FeatureCard icon={Heart} title="Our Values" desc="Integrity, compassion, compliance, and excellence guide everything we do — from first contact to ongoing support." />
          </div>
        </div>
      </section>
    </div>
  )
}
