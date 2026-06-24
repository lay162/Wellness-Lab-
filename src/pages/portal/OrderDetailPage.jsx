import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ExternalLink, Truck, RotateCcw, Package } from 'lucide-react'
import { PortalBackLinkAnchor } from '../../components/portal/PortalBackLink'
import { supabase } from '../../lib/supabase'
import { useCart } from '../../context/CartContext'
import { resolveProduct } from '../../lib/products'
import Card, { CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import {
  formatCurrency, formatDateTime, ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS,
} from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'
import { portalShopPaths } from '../../lib/shopPaths'
import toast from 'react-hot-toast'

const TRACKING_STEPS = [
  { key: 'requested', label: 'Order placed' },
  { key: 'awaiting_payment', label: 'Awaiting payment' },
  { key: 'payment_received', label: 'Payment received' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'completed', label: 'Delivered' },
]

function stepIndex(status) {
  const i = TRACKING_STEPS.findIndex(s => s.key === status)
  return i >= 0 ? i : 0
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(false)

  useEffect(() => {
    async function load() {
      const [o, i] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).single(),
        supabase.from('order_items').select('*').eq('order_id', id),
      ])
      setOrder(o.data)
      setItems(i.data || [])
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (!loading && searchParams.get('reorder') === '1' && items.length > 0) {
      handleReorder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, searchParams, items.length])

  const handleReorder = async () => {
    if (items.length === 0) return
    setReordering(true)
    let added = 0
    for (const item of items) {
      const product = await resolveProduct(supabase, item.product_id)
      if (product) {
        addItem(product, item.quantity)
        added += 1
      }
    }
    setReordering(false)
    if (added > 0) {
      toast.success('Items added to your cart')
      navigate(portalShopPaths.cart)
    } else {
      toast.error('Could not re-add items — contact us for help')
    }
  }

  if (loading) return <PageLoader />
  if (!order) return <div className="text-center py-20 text-text-muted">Order not found</div>

  const currentStep = stepIndex(order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'rejected'

  return (
    <div className="max-w-3xl mx-auto">
      <PortalBackLinkAnchor to="/private-portal/orders">Back to Orders</PortalBackLinkAnchor>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-text-muted">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge status={order.status}>{ORDER_STATUS_LABELS[order.status]}</Badge>
          <Badge status={order.payment_status}>{PAYMENT_STATUS_LABELS[order.payment_status]}</Badge>
        </div>
      </div>

      {!isCancelled && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center gap-2 mb-5">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-text">Delivery status</h2>
            </div>
            <div className="space-y-3">
              {TRACKING_STEPS.map((step, i) => {
                const done = i <= currentStep
                const active = i === currentStep
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${
                      done ? 'bg-primary' : 'bg-gray-200'
                    } ${active ? 'ring-4 ring-primary/20' : ''}`} />
                    <span className={`text-sm ${done ? 'text-text font-medium' : 'text-text-muted'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
            {order.shipping_notes && (
              <p className="mt-4 pt-4 border-t border-gray-100 text-sm text-text-muted">
                <span className="font-medium text-text">Shipping update:</span> {order.shipping_notes}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={handleReorder} loading={reordering} variant="secondary">
          <RotateCcw className="w-4 h-4" /> Re-order these items
        </Button>
        <Button variant="outline" onClick={() => navigate(portalShopPaths.catalogue)}>
          <Package className="w-4 h-4" /> Continue shopping
        </Button>
      </div>

      <Card className="mb-6">
        <CardBody>
          <h2 className="font-semibold text-text mb-4">Items</h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-text">{item.product_name} × {item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 mt-4 border-t border-gray-100 font-bold">
            <span>Total</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </CardBody>
      </Card>

      {(order.delivery_address || order.payment_method || order.payment_link || order.customer_notes) && (
        <Card className="mb-6">
          <CardBody className="space-y-3 text-sm">
            {order.delivery_address && (
              <div>
                <p className="text-text-muted mb-1">Delivery address</p>
                <p className="text-text whitespace-pre-line">{order.delivery_address}</p>
              </div>
            )}
            {order.payment_method && (
              <p><span className="text-text-muted">Payment Method:</span> {PAYMENT_METHOD_LABELS[order.payment_method]}</p>
            )}
            {order.payment_link && (
              <p>
                <span className="text-text-muted">Payment Link:</span>{' '}
                <a href={order.payment_link} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline">
                  Pay Now <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            )}
            {order.customer_notes && <p><span className="text-text-muted">Your Notes:</span> {order.customer_notes}</p>}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
