import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Shield, Heart, Users, Star, Award } from 'lucide-react'
import brand from '../../config/brand'
import Button from '../../components/ui/Button'
import Card, { CardBody, FeatureCard } from '../../components/ui/Card'
import { SectionHeaderLink } from '../../components/ui/PageHero'
import EmptyState from '../../components/ui/EmptyState'
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { mergeSeedReviews, mergeSeedStories } from '../../lib/websiteContent'
import { mergeSeedBlogPosts } from '../../lib/blogContent'
import BlogCardImage from '../../components/ui/BlogCardImage'
import { StoryBeforeAfter, ReviewCardContent } from '../../components/ui/ContentMedia'
import { SkeletonCard } from '../../components/ui/Skeleton'
import SocialLinks, { HeroDownloadAppButton } from '../../components/ui/SocialLinks'
import InstallAppPanel from '../../components/ui/InstallAppPanel'
import { usePageContent, useAllPageCards, getLucideIcon } from '../../lib/siteContent'

export default function HomePage() {
  const { meta } = usePageContent('home')
  const { groups } = useAllPageCards('home')
  const features = groups.features || []
  const trustBadges = groups.trust || []
  const [reviews, setReviews] = useState(() => mergeSeedReviews([], { publicOnly: true }).slice(0, 3))
  const [stories, setStories] = useState(() => mergeSeedStories([], { publicOnly: true }).slice(0, 3))
  const [posts, setPosts] = useState(() => mergeSeedBlogPosts([], { publicOnly: true }).slice(0, 3))
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
      setPosts(mergeSeedBlogPosts(b.data || [], { publicOnly: true }).slice(0, 3))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="flex flex-col animate-fade-in-up">
            {/* Logo */}
            <div className="flex flex-col items-center mb-10 sm:mb-12">
              <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-6 sm:p-7 lg:p-8 shadow-2xl">
                <img src={brand.logo} alt={brand.name} className="w-full h-full rounded-full object-cover shadow-lg" />
              </div>
            </div>

            {/* Badge, headline, actions — centred under logo on all screen sizes */}
            <div className="flex flex-col items-center text-center mx-auto max-w-3xl w-full">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-secondary text-sm font-medium mb-5 sm:mb-6">
                <Leaf className="w-4 h-4 shrink-0" />
                <span>{meta.badge_text || brand.tagline}</span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold mb-5 sm:mb-6 text-balance leading-[1.1] tracking-tight max-w-3xl">
                {meta.hero_title}
              </h1>
              <p className="text-base sm:text-lg text-white/75 mb-8 leading-relaxed max-w-2xl mx-auto">
                {meta.hero_subtitle || brand.description}
                {!meta.hero_subtitle && (
                  <>
                    <br />
                    <span className="text-white/60">{brand.descriptionNote}</span>
                  </>
                )}
              </p>
              <div className="flex flex-col items-center gap-5 sm:gap-6 w-full">
                <div className="flex flex-wrap gap-3 sm:gap-4 justify-center w-full max-w-sm sm:max-w-none">
                  <Link to="/wellness" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto justify-center">Explore Wellness</Button>
                  </Link>
                  <Link to="/contact" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center">Get in Touch</Button>
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-2 flex-nowrap">
                  <HeroDownloadAppButton size="md" />
                  <SocialLinks variant="hero" size="md" className="justify-center" nowrap />
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-16 pt-8 border-t border-white/10 w-full animate-fade-in-up animate-stagger-3">
            {trustBadges.map(b => {
              const Icon = getLucideIcon(b.icon, Award)
              return (
                <div
                  key={b.id}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/80 text-sm"
                >
                  <Icon className="w-4 h-4 text-secondary shrink-0" />
                  <span>{b.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-text mb-4 tracking-tight">
              {meta.section_title}
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto leading-relaxed">
              {meta.section_subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = getLucideIcon(f.icon, Leaf)
              return <FeatureCard key={f.id} icon={Icon} title={f.title} desc={f.description} />
            })}
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
                  <StoryBeforeAfter story={s} className="p-4 pb-0" />
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
                <Card key={r.id} className="p-7 hover-lift relative overflow-hidden">
                  <div className="absolute top-6 right-6 text-4xl text-primary/10 font-display leading-none">"</div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <ReviewCardContent review={r} className="italic" />
                  <p className="font-semibold text-sm text-text">{r.author_name || 'Verified client'}</p>
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
                <Link key={p.id} to={`/blog/${p.slug}`} className="group block">
                  <Card hover className="overflow-hidden h-full">
                    <BlogCardImage post={p} />
                    <CardBody>
                      <h3 className="font-semibold text-text mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
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

      {/* Download app */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-text mb-4 tracking-tight">
              {meta.extra_title}
            </h2>
            <p className="text-text-muted max-w-xl mx-auto leading-relaxed">
              {meta.extra_subtitle}
            </p>
          </div>
          <InstallAppPanel compact className="max-w-lg mx-auto" />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden gradient-hero text-white py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-in">
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4 tracking-tight">
            {meta.cta_title}
          </h2>
          <p className="text-white/75 mb-8 text-lg leading-relaxed">
            {meta.cta_subtitle}
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
