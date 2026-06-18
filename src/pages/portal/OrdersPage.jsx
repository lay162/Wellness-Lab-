import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [])

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-8">Order History</h1>
      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map(o => (
            <Link key={o.id} to={`/private-portal/order/${o.id}`}>
              <Card hover className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-text">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-text-muted">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold">{formatCurrency(o.total_amount)}</span>
                    <Badge status={o.status}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                    <Badge status={o.payment_status}>{PAYMENT_STATUS_LABELS[o.payment_status]}</Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-text-muted">No orders yet</p>
        </Card>
      )}
    </div>
  )
}
