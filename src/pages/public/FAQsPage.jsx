import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useFaqs, usePageContent } from '../../lib/siteContent'
import { PageLoader } from '../../components/ui/Skeleton'

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-text pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed">{answer}</div>}
    </div>
  )
}

export default function FAQsPage() {
  const { meta, loading: metaLoading } = usePageContent('faqs')
  const { faqs, loading: faqsLoading } = useFaqs()

  if (metaLoading || faqsLoading) return <PageLoader />

  return (
    <div>
      <section className="gradient-hero text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{meta.hero_title}</h1>
          <p className="text-white/80 max-w-2xl mx-auto">{meta.hero_subtitle}</p>
        </div>
      </section>

      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
        {faqs.map(f => (
          <FAQItem key={f.id} question={f.question} answer={f.answer} />
        ))}
      </section>
    </div>
  )
}
