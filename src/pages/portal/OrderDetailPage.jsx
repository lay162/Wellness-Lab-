import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card, { CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import {
  formatCurrency, formatDateTime, ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS,
} from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <PageLoader />
  if (!order) return <div className="text-center py-20 text-text-muted">Order not found</div>

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/private-portal/orders" className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-text-muted">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <Badge status={order.status}>{ORDER_STATUS_LABELS[order.status]}</Badge>
          <Badge status={order.payment_status}>{PAYMENT_STATUS_LABELS[order.payment_status]}</Badge>
        </div>
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

      {(order.payment_method || order.payment_link || order.shipping_notes || order.customer_notes) && (
        <Card className="mb-6">
          <CardBody className="space-y-3 text-sm">
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
            {order.shipping_notes && <p><span className="text-text-muted">Shipping Notes:</span> {order.shipping_notes}</p>}
            {order.customer_notes && <p><span className="text-text-muted">Your Notes:</span> {order.customer_notes}</p>}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
