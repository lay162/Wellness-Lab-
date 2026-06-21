import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Star, Trophy, Heart, Scale, Globe, Image, Download, Layout, HelpCircle, Lightbulb } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { mergeSeedReviews, mergeSeedStories, importSeedWebsiteContent } from '../../lib/websiteContent'
import { mergeSeedBlogPosts } from '../../lib/blogContent'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const sections = [
  {
    to: '/private-admin/website/pages',
    icon: Layout,
    title: 'Page content',
    desc: 'Homepage, about, wellness, how it works, contact, and page headers.',
    countKey: 'pages',
  },
  {
    to: '/private-admin/website/blog',
    icon: FileText,
    title: 'Blog',
    desc: 'Articles and news on your public website. Publish when ready.',
    countKey: 'blog',
  },
  {
    to: '/private-admin/website/reviews',
    icon: Star,
    title: 'Reviews',
    desc: 'Customer reviews with photos. Matches what visitors see on the reviews page.',
    countKey: 'reviews',
  },
  {
    to: '/private-admin/website/success-stories',
    icon: Trophy,
    title: 'Success stories & before/after',
    desc: 'Transformation stories and before/after photos from your website.',
    countKey: 'stories',
  },
  {
    to: '/private-admin/website/aftercare',
    icon: Heart,
    title: 'Aftercare',
    desc: 'Aftercare guides for public visitors or shop customers.',
    countKey: 'aftercare',
  },
  {
    to: '/private-admin/website/faqs',
    icon: HelpCircle,
    title: 'FAQs',
    desc: 'Questions and answers on your public FAQs page.',
    countKey: 'faqs',
  },
  {
    to: '/private-admin/website/wellness-advice',
    icon: Lightbulb,
    title: 'App wellness advice',
    desc: 'Educational content for registered customers in the app.',
    countKey: 'advice',
  },
  {
    to: '/private-admin/website/legal',
    icon: Scale,
    title: 'Legal pages',
    desc: 'Privacy policy, terms, cookies, and compliance text.',
    countKey: 'legal',
  },
]

export default function AdminWebsite() {
  const [counts, setCounts] = useState({ pages: 0, blog: 0, reviews: 0, stories: 0, aftercare: 0, faqs: 0, advice: 0, legal: 0, seedOnly: 0 })
  const [importing, setImporting] = useState(false)

  const loadCounts = async () => {
    const [blog, reviews, stories, aftercare, legal, faqs, advice, cards] = await Promise.all([
      supabase.from('blog_posts').select('*'),
      supabase.from('reviews').select('*'),
      supabase.from('success_stories').select('*'),
      supabase.from('aftercare_posts').select('id', { count: 'exact', head: true }),
      supabase.from('legal_pages').select('id', { count: 'exact', head: true }),
      supabase.from('faqs').select('id', { count: 'exact', head: true }),
      supabase.from('wellness_advice').select('id', { count: 'exact', head: true }),
      supabase.from('site_cards').select('id', { count: 'exact', head: true }),
    ])

    const mergedReviews = mergeSeedReviews(reviews.data || [])
    const mergedStories = mergeSeedStories(stories.data || [])
    const mergedBlog = mergeSeedBlogPosts(blog.data || [])
    const seedOnly = mergedReviews.filter(r => r.is_seed).length + mergedStories.filter(s => s.is_seed).length

    setCounts({
      pages: (cards.count || 0) + 8,
      blog: mergedBlog.length,
      reviews: mergedReviews.length,
      stories: mergedStories.length,
      aftercare: aftercare.count || 0,
      faqs: (faqs.count || 0) + 6,
      advice: advice.count || 0,
      legal: legal.count || 0,
      seedOnly,
    })
  }

  useEffect(() => { loadCounts() }, [])

  const handleImport = async () => {
    setImporting(true)
    const result = await importSeedWebsiteContent(supabase)
    if (result.errors.length) {
      toast.error(result.errors[0])
    } else if (result.reviews === 0 && result.stories === 0) {
      toast.success('All live website content is already in the database')
    } else {
      toast.success(`Imported ${result.reviews} review(s) and ${result.stories} success story/stories`)
    }
    setImporting(false)
    loadCounts()
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">Website management</h1>
        </div>
        <p className="text-sm text-text-muted leading-relaxed max-w-2xl">
          Everything visitors see on{' '}
          <span className="font-medium text-text">thewellnesslab.uk</span> — homepage, about, FAQs, reviews,
          before &amp; after photos, blog, aftercare, and legal pages — is managed here.
        </p>
      </div>

      {counts.seedOnly > 0 && (
        <Card className="p-5 mb-6 border-amber-200 bg-amber-50/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-text text-sm">
                {counts.seedOnly} item{counts.seedOnly === 1 ? '' : 's'} on your live website not yet saved to the database
              </p>
              <p className="text-xs text-text-muted mt-1">
                You can edit them now — saving copies them here. Or import everything in one go.
              </p>
            </div>
            <Button size="sm" onClick={handleImport} loading={importing}>
              <Download className="w-4 h-4" /> Import all live content
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-5 mb-8 bg-accent/40 border-primary/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3 min-w-0">
            <Image className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-text-muted leading-relaxed">
              <p className="font-medium text-text mb-1">Digital business card — share at gyms &amp; events</p>
              <p>
                Use this link or QR for in-person networking, WhatsApp, and social bios. Replaces old invite links.
              </p>
              <p className="font-mono text-xs text-primary mt-2 break-all">https://thewellnesslab.uk/businesscard</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText('https://thewellnesslab.uk/businesscard')
              toast.success('Card link copied')
            }}
          >
            Copy link
          </Button>
        </div>
      </Card>

      <Card className="p-5 mb-8 bg-accent/40 border-primary/10">
        <div className="flex gap-3">
          <Image className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-text-muted leading-relaxed">
            <p className="font-medium text-text mb-1">What you see here = what is on the website</p>
            <p>
              Reviews and before/after stories include everything currently live. Items marked{' '}
              <strong>Live on website</strong> can be edited — saving stores them permanently.
              Tick <strong>Show on public website</strong> and <strong>Approved</strong> to keep them visible.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map(s => (
          <Link key={s.to} to={s.to}>
            <Card hover className="p-6 h-full">
              <div className="flex items-start justify-between gap-3 mb-3">
                <s.icon className="w-8 h-8 text-primary shrink-0" />
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {counts[s.countKey]} on site
                </span>
              </div>
              <h2 className="font-semibold text-text mb-2">{s.title}</h2>
              <p className="text-sm text-text-muted leading-relaxed">{s.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
