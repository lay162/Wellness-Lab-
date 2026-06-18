import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Package, ShoppingCart, ClipboardList,
  Star, Trophy, Heart, Lightbulb, User, Settings, LogOut, Menu, X, Download,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { usePWA } from '../../hooks/usePWA'
import brand from '../../config/brand'
import { useEffect } from 'react'

const navItems = [
  { to: '/private-portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/private-portal/catalogue', icon: ShoppingBag, label: 'Catalogue' },
  { to: '/private-portal/cart', icon: ShoppingCart, label: 'Cart' },
  { to: '/private-portal/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/private-portal/private-reviews', icon: Star, label: 'Reviews' },
  { to: '/private-portal/private-success-stories', icon: Trophy, label: 'Success Stories' },
  { to: '/private-portal/private-aftercare', icon: Heart, label: 'Aftercare' },
  { to: '/private-portal/private-advice', icon: Lightbulb, label: 'Wellness Advice' },
  { to: '/private-portal/profile', icon: User, label: 'Profile' },
  { to: '/private-portal/settings', icon: Settings, label: 'Settings' },
]

export default function PortalLayout() {
  const { signOut, profile, isApproved } = useAuth()
  const { itemCount } = useCart()
  const { canInstall, installApp, registerServiceWorker } = usePWA()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    if (isApproved) registerServiceWorker()
  }, [isApproved, registerServiceWorker])

  useEffect(() => {
    if (canInstall) setShowInstall(true)
  }, [canInstall])

  const handleSignOut = async () => {
    await signOut()
    navigate('/private-portal/login')
  }

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src={brand.appIcon192} alt={brand.name} className="h-10 w-10 rounded-xl" />
          <div>
            <p className="font-semibold text-sm text-text">{brand.name}</p>
            <p className="text-xs text-text-muted">Customer Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-text-muted hover:bg-gray-50 hover:text-text'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
            {item.label === 'Cart' && itemCount > 0 && (
              <span className="ml-auto bg-secondary text-primary-dark text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-text-muted px-4 mb-2 truncate">{profile?.full_name}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30">
        <NavContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white flex flex-col shadow-xl">
            <NavContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between lg:px-8">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            {showInstall && canInstall && (
              <button
                onClick={installApp}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
            <Link to="/private-portal/cart" className="relative p-2 rounded-lg hover:bg-gray-100">
              <ShoppingCart className="w-5 h-5 text-text-muted" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function PortalAuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>
        <div className="relative text-white max-w-md text-center">
          <img src={brand.logo} alt={brand.name} className="h-24 w-24 rounded-2xl mx-auto mb-8 shadow-2xl" />
          <h2 className="font-display text-3xl font-bold mb-4 tracking-tight">{brand.name}</h2>
          <p className="text-white/70 leading-relaxed">{brand.tagline}</p>
          <div className="mt-10 pt-8 border-t border-white/10 text-sm text-white/50">
            Private customer portal — invite only
          </div>
        </div>
      </div>

      {/* Auth form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
