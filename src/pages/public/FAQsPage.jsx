import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'What services does Wellness Lab provide?', a: 'We provide wellness education, guidance, and personalised support for approved clients. Our public website offers general wellness information and educational content.' },
  { q: 'How do I get started?', a: 'Begin by exploring our website and contacting us through the contact form. Our team will guide you through the next steps based on your needs.' },
  { q: 'Is the information on this website medical advice?', a: 'No. All content on this website is for general educational and informational purposes only. It does not constitute medical advice. Always consult a qualified healthcare professional.' },
  { q: 'How can I contact the team?', a: 'You can reach us via the contact form on our website, by email, or by phone during business hours. Details are available on the Contact page.' },
  { q: 'What are your business hours?', a: 'Our team is available Monday to Friday, 9am to 5pm. We aim to respond to all enquiries within 24–48 business hours.' },
  { q: 'Do you operate across the UK?', a: 'Yes, we serve clients across the United Kingdom with a commitment to compliance and quality in all our operations.' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-text pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed">{a}</div>}
    </div>
  )
}

export default function FAQsPage() {
  return (
    <div>
      <section className="gradient-hero text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-white/80 max-w-2xl mx-auto">Find answers to common questions about our services.</p>
        </div>
      </section>

      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
        {faqs.map(f => <FAQItem key={f.q} {...f} />)}
      </section>
    </div>
  )
}
