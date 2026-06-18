import PageHero from '../../components/ui/PageHero'
import { Leaf, Brain, Moon, Droplets } from 'lucide-react'
import Card from '../../components/ui/Card'

const topics = [
  { icon: Leaf, title: 'Nutrition & Balance', desc: 'Understanding how balanced nutrition supports overall wellbeing, energy levels, and long-term health outcomes.' },
  { icon: Brain, title: 'Mental Wellness', desc: 'Practical strategies for managing stress, building resilience, and maintaining mental clarity in daily life.' },
  { icon: Moon, title: 'Rest & Recovery', desc: 'The importance of quality sleep and recovery in supporting physical and mental health.' },
  { icon: Droplets, title: 'Hydration & Vitality', desc: 'How proper hydration and lifestyle habits contribute to sustained energy and vitality.' },
]

export default function WellnessPage() {
  return (
    <div>
      <PageHero
        title="Wellness Education"
        subtitle="General wellness information to support your health journey. For educational purposes only."
      />

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {topics.map(t => (
            <Card key={t.title} className="p-8 hover-lift">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-secondary/30 flex items-center justify-center shrink-0">
                  <t.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-text mb-2">{t.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{t.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-12 p-6 bg-accent/40 border-primary/10">
          <p className="text-sm text-text-muted leading-relaxed">
            <strong className="text-text">Disclaimer:</strong> The information on this page is for general educational purposes only
            and does not constitute medical advice. Always consult a qualified healthcare professional
            before making changes to your health regimen.
          </p>
        </Card>
      </section>
    </div>
  )
}
