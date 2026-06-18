import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { PageLoader } from '../../components/ui/Skeleton'

const slugTitles = {
  'privacy-policy': 'Privacy Policy',
  'terms-and-conditions': 'Terms and Conditions',
  'cookies': 'Cookie Policy',
  'legal-disclaimer': 'Legal Disclaimer',
  'compliance': 'Compliance Information',
}

export default function LegalPage({ slug: propSlug }) {
  const { slug: paramSlug } = useParams()
  const slug = propSlug || paramSlug
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('legal_pages').select('*').eq('slug', slug).single()
      .then(({ data }) => { setPage(data); setLoading(false) })
  }, [slug])

  const title = page?.title || slugTitles[slug] || 'Legal'

  if (loading) return <PageLoader />

  return (
    <div>
      <section className="gradient-hero text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold">{title}</h1>
        </div>
      </section>
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        {page?.content ? (
          <div className="prose prose-green max-w-none text-text-muted" dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <p className="text-text-muted">Content for this page is being prepared.</p>
        )}
      </section>
    </div>
  )
}
