import { Link } from 'react-router-dom'
import brand from '../../config/brand'
import PageHero from '../../components/ui/PageHero'
import InstallAppPanel from '../../components/ui/InstallAppPanel'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Smartphone, ShoppingBag, Bell } from 'lucide-react'

const benefits = [
  { icon: ShoppingBag, title: 'Private shop', desc: 'Browse products and place orders from your phone.' },
  { icon: Bell, title: 'Stay updated', desc: 'Order updates and aftercare guidance in one place.' },
  { icon: Smartphone, title: 'Works offline', desc: 'Installed as an app — fast, reliable, always handy.' },
]

export default function DownloadAppPage() {
  return (
    <div>
      <PageHero
        title="Download our app"
        subtitle={`Install the ${brand.name} app on your phone — then create a free account to access the private shop.`}
      />

      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <InstallAppPanel className="shadow-lg shadow-primary/5" />

        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          {benefits.map(b => (
            <Card key={b.title} className="p-5 text-center">
              <b.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-text text-sm mb-1">{b.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{b.desc}</p>
            </Card>
          ))}
        </div>

        <Card className="p-6 mt-10 text-center bg-accent/40 border-primary/10">
          <p className="text-sm text-text-muted mb-4">
            New here? Create a free account — our team will approve your access shortly.
          </p>
          <Link to="/private-portal/register">
            <Button size="lg">Create free account</Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}
