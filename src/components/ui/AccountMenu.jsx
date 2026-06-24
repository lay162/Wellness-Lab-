import { Link, useNavigate } from 'react-router-dom'
import { User, LayoutDashboard, ClipboardList, ShoppingBag, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { shopPaths } from '../../lib/shopPaths'

export default function AccountMenu({ className = '' }) {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  if (!user) {
    return (
      <Link
        to={shopPaths.login}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-primary hover:bg-accent/50 transition-colors ${className}`}
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Account'

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text hover:bg-accent/50 transition-colors border border-gray-200/80 bg-white"
        aria-expanded={open}
      >
        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
          {firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-[7rem] truncate">{firstName}</span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 py-1.5 bg-white rounded-xl border border-gray-100 shadow-lg shadow-primary/5 z-50 animate-fade-in">
          <p className="px-4 py-2 text-xs text-text-muted truncate border-b border-gray-50 mb-1">
            {profile?.email}
          </p>
          {isAdmin ? (
            <Link
              to="/private-admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-gray-50"
            >
              <LayoutDashboard className="w-4 h-4" /> Admin dashboard
            </Link>
          ) : (
            <Link
              to="/private-portal/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-gray-50"
            >
              <LayoutDashboard className="w-4 h-4" /> My dashboard
            </Link>
          )}
          <Link
            to={shopPaths.orders}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-gray-50"
          >
            <ClipboardList className="w-4 h-4" /> My orders
          </Link>
          <Link
            to={shopPaths.catalogue}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-gray-50"
          >
            <ShoppingBag className="w-4 h-4" /> Shop
          </Link>
          <Link
            to="/private-portal/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-gray-50"
          >
            <User className="w-4 h-4" /> Profile
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-50 mt-1"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
