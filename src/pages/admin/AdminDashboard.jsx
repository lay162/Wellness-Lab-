import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ClipboardList, Package, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ customers: 0, pending: 0, awaitingPayment: 0, processing: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [all, pending, awaiting, processing, orders] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('payment_status', 'awaiting_payment'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'processing'),
        supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({
        customers: all.count || 0,
        pending: pending.count || 0,
        awaitingPayment: awaiting.count || 0,
        processing: processing.count || 0,
      })
      setRecentOrders(orders.data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const cards = [
    { icon: Users, label: 'Total Customers', value: stats.customers, to: '/private-admin/customers', color: 'text-primary' },
    { icon: Clock, label: 'Pending Approvals', value: stats.pending, to: '/private-admin/customers', color: 'text-amber-600' },
    { icon: ClipboardList, label: 'Awaiting Payment', value: stats.awaitingPayment, to: '/private-admin/orders', color: 'text-orange-600' },
    { icon: Package, label: 'Processing Orders', value: stats.processing, to: '/private-admin/orders', color: 'text-indigo-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-8">Admin Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <Link key={c.label} to={c.to}>
            <Card hover className="p-6">
              <c.icon className={`w-8 h-8 ${c.color} mb-3`} />
              <p className="text-3xl font-bold text-text">{c.value}</p>
              <p className="text-sm text-text-muted">{c.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-text mb-4">Recent Orders</h2>
      {recentOrders.length > 0 ? (
        <div className="space-y-3">
          {recentOrders.map(o => (
            <Link key={o.id} to="/private-admin/orders">
              <Card hover className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{o.profiles?.full_name || 'Customer'}</p>
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
        <Card className="p-8 text-center"><p className="text-text-muted">No orders yet</p></Card>
      )}
    </div>
  )
}
