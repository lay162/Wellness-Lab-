import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, ClipboardList, Package, Clock, TrendingUp, Calendar,
  Wallet, ShoppingBag, Boxes, Globe,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'

const PAID_STATUSES = new Set(['paid', 'completed'])
const EARNED_ORDER_STATUSES = new Set(['payment_received', 'completed', 'shipped'])

function isEarned(order) {
  return PAID_STATUSES.has(order.payment_status) || EARNED_ORDER_STATUSES.has(order.status)
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

function StatCard({ icon: Icon, label, value, sub, to, color, highlight }) {
  const content = (
    <Card
      hover={!!to}
      className={`p-6 h-full ${highlight ? 'bg-gradient-to-br from-primary/5 to-accent/40 border-primary/15' : ''}`}
    >
      <Icon className={`w-8 h-8 ${color} mb-3`} />
      <p className={`font-bold text-text ${highlight ? 'text-3xl' : 'text-3xl'}`}>{value}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-2">{sub}</p>}
    </Card>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    pending: 0,
    awaitingPayment: 0,
    processing: 0,
    totalOrders: 0,
    activeProducts: 0,
    totalEarnings: 0,
    monthEarnings: 0,
    pendingEarnings: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [customers, pending, awaiting, processing, products, ordersRes, recentRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('payment_status', 'awaiting_payment'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'processing'),
        supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('orders').select('total_amount, payment_status, status, created_at'),
        supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
      ])

      const orders = ordersRes.data || []
      let totalEarnings = 0
      let monthEarnings = 0
      let pendingEarnings = 0

      for (const o of orders) {
        const amount = Number(o.total_amount) || 0
        if (isEarned(o)) {
          totalEarnings += amount
          if (isThisMonth(o.created_at)) monthEarnings += amount
        }
        if (o.payment_status === 'awaiting_payment' || o.payment_status === 'pending') {
          pendingEarnings += amount
        }
      }

      setStats({
        customers: customers.count || 0,
        pending: pending.count || 0,
        awaitingPayment: awaiting.count || 0,
        processing: processing.count || 0,
        totalOrders: orders.length,
        activeProducts: products.count || 0,
        totalEarnings,
        monthEarnings,
        pendingEarnings,
      })
      setRecentOrders(recentRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const monthName = new Date().toLocaleString('en-GB', { month: 'long' })

  const earningsCards = [
    {
      icon: TrendingUp,
      label: 'Total earnings',
      value: formatCurrency(stats.totalEarnings),
      sub: 'Paid & completed orders',
      to: '/private-admin/earnings',
      color: 'text-primary',
      highlight: true,
    },
    {
      icon: Calendar,
      label: `${monthName} earnings`,
      value: formatCurrency(stats.monthEarnings),
      sub: 'This calendar month',
      to: '/private-admin/earnings',
      color: 'text-primary',
      highlight: true,
    },
    {
      icon: Wallet,
      label: 'Awaiting payment',
      value: formatCurrency(stats.pendingEarnings),
      sub: `${stats.awaitingPayment} order${stats.awaitingPayment === 1 ? '' : 's'} outstanding`,
      to: '/private-admin/earnings?filter=outstanding',
      color: 'text-amber-600',
      highlight: false,
    },
    {
      icon: ShoppingBag,
      label: 'Total orders',
      value: stats.totalOrders,
      sub: 'All time',
      to: '/private-admin/earnings',
      color: 'text-indigo-600',
      highlight: false,
    },
  ]

  const operationsCards = [
    { icon: Users, label: 'Total customers', value: stats.customers, to: '/private-admin/customers', color: 'text-primary' },
    { icon: Clock, label: 'Pending approvals', value: stats.pending, to: '/private-admin/customers', color: 'text-amber-600' },
    { icon: Package, label: 'Processing orders', value: stats.processing, to: '/private-admin/orders', color: 'text-orange-600' },
    { icon: Boxes, label: 'Active products', value: stats.activeProducts, to: '/private-admin/products', color: 'text-emerald-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-2">Admin Dashboard</h1>
      <p className="text-sm text-text-muted mb-8">Business overview for The Wellness Lab</p>

      <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">Earnings</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {earningsCards.map(c => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">Operations</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {operationsCards.map(c => (
          <StatCard key={c.label} {...c} />
        ))}
        <StatCard
          icon={Globe}
          label="Website content"
          value="Manage"
          sub="Blog, reviews, before & after"
          to="/private-admin/website"
          color="text-primary"
        />
      </div>

      <h2 className="text-lg font-semibold text-text mb-4">Recent orders</h2>
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
