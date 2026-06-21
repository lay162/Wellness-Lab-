import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCog, Package, ClipboardList, FileText, Star,
  Trophy, Heart, Settings, Scale, LogOut, Menu, PoundSterling, Globe,
  Layout, HelpCircle, Lightbulb,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import brand from '../../config/brand'

const shopNav = [
  { to: '/private-admin/customers', icon: Users, label: 'Customers' },
  { to: '/private-admin/team', icon: UserCog, label: 'Shop Team' },
  { to: '/private-admin/products', icon: Package, label: 'Products' },
  { to: '/private-admin/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/private-admin/earnings', icon: PoundSterling, label: 'Earnings' },
]

const websiteNav = [
  { to: '/private-admin/website', icon: Globe, label: 'Overview', end: true },
  { to: '/private-admin/website/pages', icon: Layout, label: 'Page content' },
  { to: '/private-admin/website/blog', icon: FileText, label: 'Blog' },
  { to: '/private-admin/website/reviews', icon: Star, label: 'Reviews' },
  { to: '/private-admin/website/success-stories', icon: Trophy, label: 'Before & After' },
  { to: '/private-admin/website/aftercare', icon: Heart, label: 'Aftercare' },
  { to: '/private-admin/website/faqs', icon: HelpCircle, label: 'FAQs' },
  { to: '/private-admin/website/wellness-advice', icon: Lightbulb, label: 'App advice' },
  { to: '/private-admin/website/legal', icon: Scale, label: 'Legal Pages' },
]

function NavSection({ title, items, onNavigate }) {
  return (
    <div className="pt-4 first:pt-0">
      <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted/70">
        {title}
      </p>
      <div className="space-y-1">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-dark text-white' : 'text-text-muted hover:bg-gray-50 hover:text-text'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/private-portal/login')
  }

  const closeMobile = () => setSidebarOpen(false)

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src={brand.logo} alt={brand.name} className="h-10 w-10 rounded-xl" />
          <div>
            <p className="font-semibold text-sm text-text">{brand.name}</p>
            <p className="text-xs text-primary font-medium">Admin Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1 mb-2">
          <NavLink
            to="/private-admin"
            end
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-dark text-white' : 'text-text-muted hover:bg-gray-50 hover:text-text'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            Dashboard
          </NavLink>
        </div>
        <div>
          <NavSection title="Shop" items={shopNav} onNavigate={closeMobile} />
          <NavSection title="Website management" items={websiteNav} onNavigate={closeMobile} />
        </div>
        <div className="pt-4 space-y-1">
          <NavLink
            to="/private-admin/settings"
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-dark text-white' : 'text-text-muted hover:bg-gray-50 hover:text-text'
              }`
            }
          >
            <Settings className="w-5 h-5 shrink-0" />
            Settings
          </NavLink>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-text-muted px-4 mb-2 truncate">{profile?.full_name}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50"
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
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center lg:px-8">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-medium text-text-muted ml-2 lg:ml-0">Administration</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
