import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import Card, { CardBody } from '../../components/ui/Card'
import { formatProductPrice } from '../../lib/utils'
import { mergeSeedProducts } from '../../data/seedProducts'
import Badge from '../../components/ui/Badge'
import { PortalPageHeader } from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/Skeleton'

export default function CataloguePage() {
  const [products, setProducts] = useState(() => mergeSeedProducts([]))
  const [filtered, setFiltered] = useState(() => mergeSeedProducts([]))
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.from('products').select('*').eq('is_active', true).order('name')
      .then(({ data }) => {
        const merged = mergeSeedProducts(data || [])
        setProducts(merged)
        setFiltered(merged)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!search) { setFiltered(products); return }
    const q = search.toLowerCase()
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.benefits?.some(b => b.toLowerCase().includes(q))
    ))
  }, [search, products])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <PortalPageHeader title="Product Catalogue" subtitle="Browse available peptides and wellness products. Invite-only access." />
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}</div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <Link key={p.id} to={`/private-portal/product/${p.id}`}>
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
                    {p.category && <span className="text-xs text-primary font-medium uppercase">{p.category}</span>}
                    {p.is_seed && <Badge status="pending">Catalogue</Badge>}
                  </div>
                  <h3 className="font-semibold text-text mt-1">{p.name}</h3>
                  {p.benefits?.length > 0 && (
                    <p className="text-xs text-text-muted mt-2 line-clamp-2">{p.benefits.join(' · ')}</p>
                  )}
                  <p className="text-lg font-bold text-primary mt-2">{formatProductPrice(p)}</p>
                  {p.stock <= 0 && <span className="text-xs text-red-600 font-medium">Out of stock</span>}
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-text-muted">{search ? 'No products match your search.' : 'No products available yet.'}</p>
        </Card>
      )}
    </div>
  )
}
