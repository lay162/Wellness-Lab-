import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import Card, { CardBody } from '../../components/ui/Card'
import { formatProductPrice } from '../../lib/utils'
import { mergeSeedProducts } from '../../lib/products'
import { collectProductCategories, productMatchesCategory } from '../../lib/shopCategories'
import PageHero from '../../components/ui/PageHero'
import { PortalPageHeader } from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { shopPathsForPortal } from '../../lib/shopPaths'

export default function CataloguePage({ portal = false }) {
  const paths = shopPathsForPortal(portal)
  const [products, setProducts] = useState(() => mergeSeedProducts([]))
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('products').select('*').eq('is_active', true).order('name')
      .then(({ data }) => {
        setProducts(mergeSeedProducts(data || []))
        setLoading(false)
      })
  }, [])

  const categories = useMemo(() => collectProductCategories(products), [products])

  const filtered = useMemo(() => {
    let result = products.filter(p => productMatchesCategory(p, activeCategory))
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.benefits?.some(b => b.toLowerCase().includes(q))
      )
    }
    return result
  }, [products, search, activeCategory])

  const searchBar = (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" aria-hidden />
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
      />
    </div>
  )

  const categoryBar = categories.length > 0 && (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        type="button"
        onClick={() => setActiveCategory('all')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          activeCategory === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {categories.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => setActiveCategory(c)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeCategory === c ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )

  return (
    <div>
      {portal ? (
        <div className="flex flex-col gap-6 mb-8">
          <PortalPageHeader title="Shop" subtitle="Browse by category or search for products." />
          {searchBar}
          <div className="flex justify-center">{categoryBar}</div>
        </div>
      ) : (
        <>
          <PageHero title="Shop" subtitle="Browse peptides and wellness products by category." />
          <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 flex flex-col items-center">
            {searchBar}
            {categoryBar}
          </section>
        </>
      )}

      <div className={portal ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-4'}>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            {activeCategory !== 'all' && (
              <p className="text-sm text-text-muted mb-4">
                Showing <strong className="text-text">{filtered.length}</strong> in {activeCategory}
              </p>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => (
                <Link key={p.id} to={paths.product(p.id)}>
                  <Card hover className="overflow-hidden h-full">
                    {p.image_url ? (
                      <div className="w-full h-52 bg-white flex items-center justify-center p-4">
                        <img src={p.image_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-accent flex flex-col items-center justify-center px-4 text-center">
                        <span className="text-primary text-3xl font-bold mb-2">{p.name.charAt(0)}</span>
                        {p.delivery?.length > 0 && (
                          <span className="text-xs text-text-muted">{p.delivery.join(' · ')}</span>
                        )}
                      </div>
                    )}
                    <CardBody>
                      <div className="flex items-center gap-2 flex-wrap">
                        {p.category && (
                          <span className="text-xs text-primary font-medium uppercase tracking-wide">{p.category}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-text mt-1">{p.name}</h3>
                      {p.benefits?.length > 0 && (
                        <p className="text-xs text-text-muted mt-2 line-clamp-2">{p.benefits.join(' · ')}</p>
                      )}
                      <p className="text-lg font-bold text-primary mt-2">{formatProductPrice(p)}</p>
                      {p.stock <= 0 && (
                        <span className="text-xs text-red-600 font-medium">Out of stock</span>
                      )}
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-text-muted">
              {search || activeCategory !== 'all'
                ? 'No products match your filters.'
                : 'No products available yet.'}
            </p>
            {activeCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="mt-4 text-sm text-primary font-medium hover:underline"
              >
                View all products
              </button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
