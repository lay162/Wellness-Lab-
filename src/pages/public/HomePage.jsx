import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Shield, Heart, Users, Star, Award, CheckCircle2 } from 'lucide-react'
import brand from '../../config/brand'
import Button from '../../components/ui/Button'
import Card, { CardBody, FeatureCard } from '../../components/ui/Card'
import { SectionHeaderLink } from '../../components/ui/PageHero'
import EmptyState from '../../components/ui/EmptyState'
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { mergeSeedReviews, mergeSeedStories } from '../../data/seedStories'
import BeforeAfterCard from '../../components/ui/BeforeAfterCard'
import { SkeletonCard } from '../../components/ui/Skeleton'
import SocialLinks from '../../components/ui/SocialLinks'

const trustBadges = [
  { icon: Award, label: 'Premium Quality' },
  { icon: Shield, label: 'Fully Compliant' },
  { icon: CheckCircle2, label: 'Trusted Partner' },
]

export default function HomePage() {
  const [reviews, setReviews] = useState(() => mergeSeedReviews([], { publicOnly: true }).slice(0, 3))
  const [stories, setStories] = useState(() => mergeSeedStories([], { publicOnly: true }).slice(0, 3))
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    async function load() {
      const [r, s, b] = await Promise.all([
        supabase.from('reviews').select('*').eq('is_public', true).eq('is_approved', true).limit(3),
        supabase.from('success_stories').select('*').eq('is_public', true).eq('is_approved', true).limit(3),
        supabase.from('blog_posts').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
      ])
      setReviews(mergeSeedReviews(r.data || [], { publicOnly: true }))
      setStories(mergeSeedStories(s.data || [], { publicOnly: true }))
      setPosts(b.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const features = [
    { icon: Leaf, title: 'Holistic Wellness', desc: 'Evidence-informed guidance for your wellbeing journey.' },
    { icon: Shield, title: 'Trusted & Compliant', desc: 'Fully compliant operations with transparent practices.' },
    { icon: Heart, title: 'Personalised Care', desc: 'Tailored support designed around your unique needs.' },
    { icon: Users, title: 'Expert Team', desc: 'Dedicated professionals committed to your success.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-secondary text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                {brand.tagline}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-[1.1] tracking-tight">
                Your journey to better wellness starts here
              </h1>
              <p className="text-lg text-white/75 mb-8 leading-relaxed max-w-lg">
                {brand.description}
              </p>
              <div className="inline-flex flex-col items-center gap-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link to="/wellness"><Button size="lg">Explore Wellness</Button></Link>
                  <Link to="/contact"><Button variant="secondary" size="lg">Get in Touch</Button></Link>
                </div>
                <SocialLinks variant="hero" size="md" className="justify-center" nowrap />
              </div>
            </div>
            <div className="hidden lg:flex justify-center animate-fade-in-up animate-stagger-2">
              <div className="relative">
                <div className="w-80 h-80 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-8 shadow-2xl">
                  <img src={brand.logo} alt={brand.name} className="w-full h-full rounded-full object-cover shadow-lg" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full glass-dark text-white text-sm font-medium shadow-xl whitespace-nowrap">
                  Trusted wellness partner
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-16 pt-8 border-t border-white/10 animate-fade-in-up animate-stagger-3">
            {trustBadges.map(b => (
              <div key={b.label} className="flex items-center gap-2.5 text-white/70 text-sm">
                <b.icon className="w-5 h-5 text-secondary" />
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-text mb-4 tracking-tight">
              Why Choose {brand.name}?
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto leading-relaxed">
              We combine expertise, compassion, and compliance to deliver exceptional wellness support.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 gradient-hero-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeaderLink title="Success Stories" subtitle="Real experiences from people on their wellness journey" to="/success-stories" />
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : stories.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {stories.map(s => (
                <Card key={s.id} hover className="overflow-hidden group">
                  <div className="p-4 pb-0">
                    <BeforeAfterCard before={s.before_image} after={s.after_image} author={s.author_name} />
                  </div>
                  <CardBody>
                    <h3 className="font-semibold text-text mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                    <p className="text-sm text-text-muted line-clamp-3 leading-relaxed">
                      {s.excerpt || s.content?.replace(/<[^>]*>/g, '').slice(0, 120)}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Card><EmptyState icon={Heart} title="Success stories coming soon" description="We're collecting inspiring stories from our community." /></Card>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeaderLink title="What Our Clients Say" to="/reviews" />
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : reviews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map(r => (
                <Card key={r.id} className="p-7 hover-lift relative">
                  <div className="absolute top-6 right-6 text-4xl text-primary/10 font-display leading-none">"</div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-text-muted mb-5 line-clamp-4 leading-relaxed italic">{r.content}</p>
                  <p className="font-semibold text-sm text-text">{r.author_name}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card><EmptyState icon={Star} title="Reviews coming soon" description="Client testimonials will appear here." /></Card>
          )}
        </div>
      </section>

      {/* Blog */}
      <section className="py-24 gradient-hero-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeaderLink title="Latest from the Blog" to="/blog" />
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`}>
                  <Card hover className="overflow-hidden h-full group">
                    {p.image_url ? (
                      <div className="overflow-hidden">
                        <img src={p.image_url} alt="" className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="w-full h-52 bg-gradient-to-br from-primary/5 to-accent flex items-center justify-center">
                        <Leaf className="w-10 h-10 text-primary/20" />
                      </div>
                    )}
                    <CardBody>
                      {p.category && (
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{p.category}</span>
                      )}
                      <h3 className="font-semibold text-text mt-1.5 mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">{p.excerpt}</p>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card><EmptyState icon={Leaf} title="Blog articles coming soon" description="Wellness insights and educational content on the way." /></Card>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden gradient-hero text-white py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-in">
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
            Ready to begin your wellness journey?
          </h2>
          <p className="text-white/75 mb-8 text-lg leading-relaxed">
            Get in touch with our team to learn more about how we can support you.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary">
              Contact Us <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
