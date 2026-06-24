import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, ClipboardList, ShoppingCart, Truck, RotateCcw,
  MessageCircle, Package,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { supabase } from '../../lib/supabase'
import brand from '../../config/brand'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'
import { portalShopPaths, accountPaths } from '../../lib/shopPaths'

const TRACKABLE_STATUSES = new Set(['processing', 'shipped', 'awaiting_payment', 'payment_received'])

const CARD_VISUALS = {
  shop: {
    type: 'shop-brand',
    panel: 'bg-gradient-to-br from-[#145A4A] to-primary',
  },
  cart: {
    type: 'cart',
    panel: 'bg-gradient-to-br from-primary to-primary-light',
  },
  orders: {
    type: 'photo',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80',
    panel: 'bg-primary-dark',
  },
  help: {
    type: 'brand',
    image: brand.logo,
    panel: 'bg-gradient-to-br from-secondary/90 to-primary',
  },
}

function PeptideHelixBg({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22 4 C38 18 38 32 22 46 C6 60 6 74 22 88 C38 102 38 116 22 116"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M58 4 C42 18 42 32 58 46 C74 60 74 74 58 88 C42 102 42 116 58 116"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {[22, 38, 54, 70, 86].map(y => (
        <line key={y} x1="24" y1={y} x2="56" y2={y} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      ))}
    </svg>
  )
}

function CardVisual({ visual, itemCount }) {
  if (visual.type === 'shop-brand') {
    return (
      <div className={`relative w-[5.5rem] sm:w-28 shrink-0 overflow-hidden flex items-center justify-center p-2 ${visual.panel}`}>
        <PeptideHelixBg className="absolute -right-1 top-1/2 -translate-y-1/2 h-[85%] w-auto text-white/20 pointer-events-none" />
        <PeptideHelixBg className="absolute -left-3 top-1/2 -translate-y-1/2 h-[70%] w-auto text-white/10 pointer-events-none scale-x-[-1]" />
        <img
          src={brand.logo}
          alt=""
          className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-md ring-2 ring-white/25"
        />
      </div>
    )
  }

  if (visual.type === 'cart') {
    return (
      <div className={`relative w-[5.5rem] sm:w-28 shrink-0 overflow-hidden flex flex-col items-center justify-center gap-1.5 ${visual.panel}`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_55%)]" />
        <ShoppingCart className="w-9 h-9 text-white/95 relative z-10 drop-shadow-sm" strokeWidth={1.75} />
        {itemCount > 0 ? (
          <span className="relative z-10 text-[11px] font-bold text-primary bg-white px-2 py-0.5 rounded-full shadow-sm">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
        ) : (
          <span className="relative z-10 text-[10px] font-medium text-white/80">Ready to fill</span>
        )}
      </div>
    )
  }

  if (visual.type === 'brand') {
    return (
      <div className={`relative w-[5.5rem] sm:w-28 shrink-0 overflow-hidden flex items-center justify-center p-3 ${visual.panel}`}>
        <img
          src={visual.image}
          alt=""
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-lg ring-2 ring-white/40"
        />
      </div>
    )
  }

  return (
    <div className={`relative w-[5.5rem] sm:w-28 shrink-0 overflow-hidden ${visual.panel}`}>
      <img
        src={visual.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
    </div>
  )
}

function QuickActionCard({ action, visual, external, itemCount }) {
  const inner = (
    <Card
      hover
      className="overflow-hidden h-full border border-primary/10 shadow-sm shadow-primary/5 group"
    >
      <div className="flex h-full min-h-[6.75rem]">
        <div className="flex-1 p-5 flex flex-col justify-center bg-white">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-2.5">
            <action.icon className="w-5 h-5 text-primary" />
          </div>
          <p className="font-semibold text-text">{action.label}</p>
          <p className="text-sm text-text-muted">{action.desc}</p>
        </div>
        <CardVisual visual={visual} itemCount={itemCount} />
      </div>
    </Card>
  )

  if (external) {
    return (
      <a href={action.to} target="_blank" rel="noopener noreferrer" className="block h-full">
        {inner}
      </a>
    )
  }
  return <Link to={action.to} className="block h-full">{inner}</Link>
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { itemCount } = useCart()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <PageLoader />

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const activeOrder = orders.find(o => TRACKABLE_STATUSES.has(o.status))
  const recentOrders = orders.slice(0, 5)

  const quickActions = [
    { key: 'shop', icon: ShoppingBag, label: 'Shop', desc: 'Browse products', to: portalShopPaths.catalogue },
    { key: 'cart', icon: ShoppingCart, label: 'Your cart', desc: itemCount > 0 ? `${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Empty', to: portalShopPaths.cart },
    { key: 'orders', icon: ClipboardList, label: 'All orders', desc: `${orders.length} total`, to: accountPaths.orders },
    { key: 'help', icon: MessageCircle, label: 'Get help', desc: 'WhatsApp support', to: brand.contact.whatsappUrl, external: true },
  ]

  return (
    <div className="max-w-4xl">
      <div className="rounded-2xl gradient-hero text-white p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-32 rounded-full bg-secondary/20 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-4 sm:gap-5">
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover shadow-lg ring-2 ring-white/25 shrink-0"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>
          </div>
        </div>
      </div>

      {activeOrder && (
        <Card className="mb-6 border-primary/25 bg-gradient-to-r from-accent via-white to-accent/40 overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Active order</p>
                <p className="font-semibold text-text">
                  Order #{activeOrder.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-text-muted mt-0.5">
                  {ORDER_STATUS_LABELS[activeOrder.status]} · {formatDate(activeOrder.created_at)}
                </p>
              </div>
            </div>
            <Link
              to={`/private-portal/order/${activeOrder.id}`}
              className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 px-7 py-3.5 text-base rounded-xl gradient-button text-white hover:brightness-110 w-full sm:w-auto"
            >
              Track order
            </Link>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-2 mb-4">
        <span className="h-5 w-1 rounded-full bg-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">Quick actions</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {quickActions.map(action => (
          <QuickActionCard
            key={action.key}
            action={action}
            visual={CARD_VISUALS[action.key]}
            external={action.external}
            itemCount={action.key === 'cart' ? itemCount : 0}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-primary/10 bg-gradient-to-b from-accent/40 to-white p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-primary" />
            <h2 className="text-lg font-semibold text-text">Recent orders</h2>
          </div>
          {orders.length > 0 && (
            <Link to={accountPaths.orders} className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          )}
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map(o => (
              <Card key={o.id} className="p-4 border-primary/10 bg-white/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-text">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-text-muted">{formatDate(o.created_at)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-medium">{formatCurrency(o.total_amount)}</span>
                      <Badge status={o.status}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/private-portal/order/${o.id}`}
                      className="inline-flex items-center justify-center gap-2 font-medium px-3 py-1.5 text-sm rounded-lg bg-accent text-primary-dark border border-primary/15 hover:bg-primary hover:text-white transition-colors"
                    >
                      View
                    </Link>
                    {TRACKABLE_STATUSES.has(o.status) && (
                      <Link
                        to={`/private-portal/order/${o.id}`}
                        className="inline-flex items-center justify-center gap-2 font-medium px-3 py-1.5 text-sm rounded-lg border border-primary/20 text-primary hover:bg-accent transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" /> Track
                      </Link>
                    )}
                    <Link
                      to={`/private-portal/order/${o.id}?reorder=1`}
                      className="inline-flex items-center justify-center gap-2 font-medium px-3 py-1.5 text-sm rounded-lg border border-primary/20 text-primary hover:bg-accent transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Re-order
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center bg-white/70 border-primary/10 border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-accent mx-auto mb-4 flex items-center justify-center">
              <img src={brand.appIcon192} alt="" className="w-10 h-10 rounded-xl object-cover" />
            </div>
            <p className="text-text-muted mb-4">No orders yet — when you place one, it will show here.</p>
            <Link to={portalShopPaths.catalogue}>
              <span className="inline-flex items-center justify-center gap-2 font-medium px-7 py-3.5 text-base rounded-xl gradient-button text-white hover:brightness-110">
                Start shopping
              </span>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
