import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, FileText, ArrowLeft } from 'lucide-react'
import PortalBackLink from '../../components/portal/PortalBackLink'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useCart } from '../../context/CartContext'
import { getSeedProduct, isSeedProduct, resolveProduct } from '../../lib/products'
import Button from '../../components/ui/Button'
import Card, { CardBody } from '../../components/ui/Card'
import { formatProductPrice } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'
import { shopPathsForPortal } from '../../lib/shopPaths'
import SeoHead from '../../components/seo/SeoHead'
import { productSchema, SITE_URL } from '../../config/seo'

export default function ProductPage({ portal = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const paths = shopPathsForPortal(portal)
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (isSeedProduct(id)) setProduct(getSeedProduct(id))
      setLoading(false)
      return
    }
    resolveProduct(supabase, id).then(data => {
      setProduct(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <PageLoader />
  if (!product) return <div className="text-center py-20 text-text-muted">Product not found</div>

  const handleAdd = () => {
    if (product.stock <= 0) { toast.error('Out of stock'); return }
    addItem(product, quantity)
    toast.success(`Added ${quantity}x ${product.name} to cart`)
    if (!portal) navigate(paths.cart)
  }

  return (
    <>
      {!portal && (
        <SeoHead
          title={`${product.name} | ${product.category || 'Peptides'} UK | Wellness Lab`}
          description={product.description || `Order ${product.name} from Wellness Lab — UK peptide research shop with nationwide support.`}
          path={`/shop/product/${product.id}`}
          image={product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `${SITE_URL}${product.image_url}`) : undefined}
          type="product"
          jsonLd={productSchema(product)}
        />
      )}
    <div className={portal ? 'max-w-4xl mx-auto' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}>
      {portal ? (
        <PortalBackLink to={paths.catalogue}>Back to shop</PortalBackLink>
      ) : (
        <Link to={paths.catalogue} className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </Link>
      )}
      <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex items-center justify-center aspect-square">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-center">
              <div className="text-primary text-6xl font-bold mb-4">{product.name.charAt(0)}</div>
              {product.delivery?.length > 0 && (
                <p className="text-sm text-text-muted">{product.delivery.join(' · ')}</p>
              )}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {product.category && (
              <span className="text-xs font-medium text-primary uppercase">{product.category}</span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-text mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-primary mb-6">{formatProductPrice(product)}</p>

          {product.benefits?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-text mb-2">Key benefits</p>
              <ul className="flex flex-wrap gap-2">
                {product.benefits.map(b => (
                  <li key={b} className="px-3 py-1 rounded-full bg-accent text-xs font-medium text-primary-dark">{b}</li>
                ))}
              </ul>
            </div>
          )}

          {product.delivery?.length > 0 && (
            <p className="text-sm text-text-muted mb-6">
              <span className="font-medium text-text">Available formats:</span> {product.delivery.join(', ')}
            </p>
          )}

          {product.description && <p className="text-text-muted mb-6 leading-relaxed">{product.description}</p>}
          <p className="text-sm text-text-muted mb-6">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            {product.sku && ` · SKU: ${product.sku}`}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-text">Quantity</label>
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50">−</button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 hover:bg-gray-50">+</button>
              </div>
            </div>
          )}

          <Button onClick={handleAdd} disabled={product.stock <= 0} className="w-full sm:w-auto">
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </Button>

          {product.coa_url && (
            <Card className="mt-8 p-4">
              <a href={product.coa_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-primary hover:underline">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">View Certificate of Analysis (COA)</span>
              </a>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
    </>
  )
}
