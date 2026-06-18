import PageHero from '../../components/ui/PageHero'
import { MessageCircle, ClipboardCheck, HeartHandshake, Sparkles } from 'lucide-react'
import Card from '../../components/ui/Card'

const steps = [
  { icon: MessageCircle, step: '01', title: 'Get in Touch', desc: 'Reach out via our contact form to express your interest and learn more about our services.' },
  { icon: ClipboardCheck, step: '02', title: 'Consultation', desc: 'We discuss your wellness goals and determine how we can best support your journey.' },
  { icon: HeartHandshake, step: '03', title: 'Personalised Plan', desc: 'Receive tailored guidance and support designed around your unique needs and preferences.' },
  { icon: Sparkles, step: '04', title: 'Ongoing Support', desc: 'Benefit from continuous aftercare, educational content, and dedicated client support.' },
]

export default function HowItWorksPage() {
  return (
    <div>
      <PageHero title="How It Works" subtitle="A simple, transparent process designed to put your wellness first." />

      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="space-y-6">
          {steps.map((s, i) => (
            <Card key={s.step} className="p-6 hover-lift">
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-2xl gradient-button flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-lg shadow-primary/20">
                  {s.step}
                </div>
                <div className={i < steps.length - 1 ? 'pb-2' : ''}>
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg text-text">{s.title}</h3>
                  </div>
                  <p className="text-text-muted leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
