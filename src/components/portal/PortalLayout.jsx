import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, ClipboardList,
  Star, Trophy, Heart, Lightbulb, User, Settings, LogOut, Menu, Download, ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { usePWA } from '../../hooks/usePWA'
import brand from '../../config/brand'
import { useEffect } from 'react'
import { portalShopPaths } from '../../lib/shopPaths'
import { isPortalRootPath, getPortalBackTarget, getPortalPageTitle } from '../../lib/portalNav'
import PortalBottomNav from './PortalBottomNav'

const navItems = [
  { to: '/private-portal/dashboard', icon: LayoutDashboard, label: 'Dashboard', match: (p) => p === '/private-portal/dashboard' },
  { to: portalShopPaths.catalogue, icon: ShoppingBag, label: 'Shop', match: (p) => p.startsWith('/private-portal/shop') },
  { to: portalShopPaths.cart, icon: ShoppingCart, label: 'Cart', match: (p) => p === portalShopPaths.cart },
  { to: '/private-portal/orders', icon: ClipboardList, label: 'Orders', match: (p) => p.startsWith('/private-portal/order') },
  { to: '/private-portal/private-reviews', icon: Star, label: 'Reviews', match: (p) => p.startsWith('/private-portal/private-reviews') },
  { to: '/private-portal/private-success-stories', icon: Trophy, label: 'Success Stories', match: (p) => p.startsWith('/private-portal/private-success-stories') },
  { to: '/private-portal/private-aftercare', icon: Heart, label: 'Aftercare', match: (p) => p.startsWith('/private-portal/private-aftercare') },
  { to: '/private-portal/private-advice', icon: Lightbulb, label: 'Wellness Advice', match: (p) => p.startsWith('/private-portal/private-advice') },
  { to: '/private-portal/profile', icon: User, label: 'Profile', match: (p) => p === '/private-portal/profile' },
  { to: '/private-portal/settings', icon: Settings, label: 'Settings', match: (p) => p === '/private-portal/settings' },
]

export default function PortalLayout() {
  const { signOut, profile, isApproved } = useAuth()
  const { itemCount } = useCart()
  const { canInstall, installApp, registerServiceWorker } = usePWA()
  const navigate = useNavigate()
  const location = useLocation()
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
            className={() =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.match(location.pathname)
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-gray-50 hover:text-text'
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

  const isRoot = isPortalRootPath(location.pathname)
  const pageTitle = getPortalPageTitle(location.pathname)

  const handleMobileBack = () => {
    navigate(getPortalBackTarget(location.pathname))
  }

  return (
    <div className="min-h-[100dvh] bg-background flex">
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

      <div className="flex-1 lg:ml-64 flex flex-col min-h-[100dvh]">
        {/* Mobile header — back, title, menu/cart */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-2 min-h-14 flex items-center gap-1 pt-[env(safe-area-inset-top)]">
          {isRoot ? (
            <button
              type="button"
              className="p-2.5 rounded-lg hover:bg-gray-100 shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              className="p-2.5 rounded-lg hover:bg-gray-100 shrink-0"
              onClick={handleMobileBack}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="flex-1 text-center text-sm font-semibold text-text truncate px-1">
            {pageTitle}
          </h1>
          <Link
            to={portalShopPaths.cart}
            className="relative p-2.5 rounded-lg hover:bg-gray-100 shrink-0"
            aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : 'Cart'}
          >
            <ShoppingCart className="w-5 h-5 text-text-muted" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-white text-[10px] min-w-[1rem] h-4 px-0.5 rounded-full flex items-center justify-center font-bold">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 h-14 items-center justify-end">
          <div className="flex items-center gap-3">
            {showInstall && canInstall && (
              <button
                onClick={installApp}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
            <Link to={portalShopPaths.cart} className="relative p-2 rounded-lg hover:bg-gray-100">
              <ShoppingCart className="w-5 h-5 text-text-muted" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-8">
          <Outlet />
        </main>

        <PortalBottomNav />
      </div>
    </div>
  )
}

export function PortalAuthLayout() {
  const [searchParams] = useSearchParams()
  const isAdminView = searchParams.get('mode') === 'admin'

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
          <div className="mt-10 pt-8 border-t border-white/10 text-sm text-white/50 space-y-3">
            <p>
              {isAdminView
                ? 'Business admin portal — products, customers & orders'
                : 'Sign in to shop, track orders & access your account'}
            </p>
            <a
              href={`${import.meta.env.BASE_URL}businesscard`}
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-xs"
            >
              View digital business card →
            </a>
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
