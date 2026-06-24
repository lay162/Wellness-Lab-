import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, ShoppingCart, ClipboardList, User } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { portalShopPaths } from '../../lib/shopPaths'

const tabs = [
  { to: '/private-portal/dashboard', icon: LayoutDashboard, label: 'Home', match: (p) => p === '/private-portal/dashboard' },
  { to: portalShopPaths.catalogue, icon: ShoppingBag, label: 'Shop', match: (p) => p.startsWith('/private-portal/shop') && p !== portalShopPaths.cart },
  { to: portalShopPaths.cart, icon: ShoppingCart, label: 'Cart', match: (p) => p === portalShopPaths.cart },
  { to: '/private-portal/orders', icon: ClipboardList, label: 'Orders', match: (p) => p.startsWith('/private-portal/order') },
  { to: '/private-portal/profile', icon: User, label: 'Profile', match: (p) => p === '/private-portal/profile' || p === '/private-portal/settings' },
]

export default function PortalBottomNav() {
  const { itemCount } = useCart()
  const location = useLocation()

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto h-16">
        {tabs.map(({ to, icon: Icon, label, match }) => {
          const active = match(location.pathname)
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 px-1 text-[10px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-text-muted'
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 1.75} />
                {label === 'Cart' && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[1rem] h-4 px-0.5 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </span>
              <span className="truncate w-full text-center">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
