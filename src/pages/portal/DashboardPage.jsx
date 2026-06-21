import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ClipboardList, Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Card, { CardBody } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'
import { shopPaths } from '../../lib/shopPaths'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState([])
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [o, p] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
      ])
      setOrders(o.data || [])
      setProductCount(p.count || 0)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const stats = [
    { icon: Package, label: 'Products Available', value: productCount, to: shopPaths.catalogue },
    { icon: ClipboardList, label: 'Total Orders', value: orders.length, to: shopPaths.orders },
    { icon: ShoppingBag, label: 'Browse shop', value: '→', to: shopPaths.catalogue },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Welcome back, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="text-text-muted">Your private customer dashboard</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} to={s.to}>
            <Card hover className="p-6">
              <s.icon className="w-8 h-8 text-primary mb-3" />
              <p className="text-2xl font-bold text-text">{s.value}</p>
              <p className="text-sm text-text-muted">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-text mb-4">Recent Orders</h2>
      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map(o => (
            <Link key={o.id} to={`/private-portal/order/${o.id}`}>
              <Card hover className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-text">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-text-muted">{formatDate(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{formatCurrency(o.total_amount)}</span>
                  <Badge status={o.status}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-text-muted mb-4">No orders yet</p>
          <Link to={shopPaths.catalogue} className="text-primary font-medium hover:underline">Browse the shop</Link>
        </Card>
      )}
    </div>
  )
}
