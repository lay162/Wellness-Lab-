import { useState } from 'react'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import brand from '../../config/brand'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import PageHero from '../../components/ui/PageHero'
import SocialLinks, { WhatsAppIcon } from '../../components/ui/SocialLinks'
import toast from 'react-hot-toast'
import { usePageContent } from '../../lib/siteContent'
import { PageLoader } from '../../components/ui/Skeleton'

export default function ContactPage() {
  const { meta, loading: pageLoading } = usePageContent('contact')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    const body = [
      `Name: ${form.name}`,
      `Reply-to: ${form.email}`,
      '',
      form.message,
    ].join('\n')
    const mailto = `${brand.contact.mailto}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    toast.success('Opening your email app — send the message to reach our team.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setLoading(false)
  }

  const info = [
    { icon: Mail, label: 'Email', value: brand.contact.email, href: brand.contact.mailto },
    { icon: Phone, label: 'Phone / WhatsApp', value: brand.contact.phone, href: brand.contact.whatsappUrl },
    { icon: MapPin, label: 'Address', value: brand.contact.address },
    { icon: Clock, label: 'Hours', value: brand.contact.hours },
  ]

  if (pageLoading) return <PageLoader />

  return (
    <div>
      <PageHero
        title={meta.hero_title}
        subtitle={meta.hero_subtitle}
      />

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="text-sm font-medium text-text mb-3">Connect with us</p>
              <SocialLinks variant="dark" size="lg" showLabels />
            </div>

            {info.map(item => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-text-muted">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            <a href={brand.contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full mt-4">
                <WhatsAppIcon className="w-4 h-4" /> Chat on WhatsApp
              </Button>
            </a>
          </div>

          <Card className="lg:col-span-3 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Input label="Full Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <Input label="Subject" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              <Textarea label="Message" required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              <Button type="submit" loading={loading} className="w-full sm:w-auto">Send Message</Button>
            </form>
          </Card>
        </div>
      </section>
    </div>
  )
}
