import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import Card, { CardBody } from '../../components/ui/Card'
import { SkeletonCard } from '../../components/ui/Skeleton'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('blog_posts').select('*').eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const p = data || []
        setPosts(p)
        setFiltered(p)
        setCategories([...new Set(p.map(x => x.category).filter(Boolean))])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let result = posts
    if (activeCategory !== 'all') result = result.filter(p => p.category === activeCategory)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [search, activeCategory, posts])

  const featured = posts.filter(p => p.featured)

  return (
    <div>
      <section className="gradient-hero text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Wellness Blog</h1>
          <p className="text-white/80 max-w-2xl mx-auto">Insights, tips, and educational articles for your wellbeing.</p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'}`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === c ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {featured.length > 0 && activeCategory === 'all' && !search && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-text mb-6">Featured</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.slice(0, 2).map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`}>
                  <Card hover className="overflow-hidden">
                    {p.image_url && <img src={p.image_url} alt="" className="w-full h-56 object-cover" />}
                    <CardBody>
                      <h3 className="font-semibold text-lg text-text">{p.title}</h3>
                      <p className="text-sm text-text-muted mt-2">{p.excerpt}</p>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <Link key={p.id} to={`/blog/${p.slug}`}>
                <Card hover className="overflow-hidden h-full">
                  {p.image_url && <img src={p.image_url} alt="" className="w-full h-48 object-cover" />}
                  <CardBody>
                    {p.category && <span className="text-xs font-medium text-primary uppercase">{p.category}</span>}
                    <h3 className="font-semibold text-text mt-1 mb-2">{p.title}</h3>
                    <p className="text-sm text-text-muted line-clamp-2">{p.excerpt}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-muted py-16">No articles found.</p>
        )}
      </section>
    </div>
  )
}
