import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight, ShoppingCart, ChevronDown } from 'lucide-react'
import brand from '../../config/brand'
import Button from '../ui/Button'
import ScrollToTop from '../ui/ScrollToTop'
import SocialLinks, { WhatsAppFloat, DownloadAppFloat } from '../ui/SocialLinks'
import { useCart } from '../../context/CartContext'
import { shopPaths } from '../../lib/shopPaths'
import SeoHead, { GlobalStructuredData } from '../seo/SeoHead'

const primaryNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/wellness', label: 'Wellness' },
  { to: shopPaths.catalogue, label: 'Shop' },
  { to: '/blog', label: 'Blog' },
  { to: '/faqs', label: 'FAQs' },
]

const moreNavLinks = [
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/success-stories', label: 'Success Stories' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/aftercare', label: 'Aftercare' },
  { to: '/contact', label: 'Contact' },
]

const allNavLinks = [...primaryNavLinks, ...moreNavLinks]

function HeaderCartButton({ className = '' }) {
  const { itemCount } = useCart()

  return (
    <Link
      to={shopPaths.cart}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-text-muted hover:text-primary hover:border-primary/30 hover:bg-accent/40 transition-colors ${className}`}
      aria-label={itemCount > 0 ? `Shopping cart, ${itemCount} items` : 'Shopping cart'}
    >
      <ShoppingCart className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.75} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  )
}

function NavItem({ link, onClick }) {
  return (
    <NavLink
      to={link.to}
      end={link.to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `px-2.5 xl:px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
          isActive
            ? 'text-primary bg-accent/80 shadow-sm'
            : 'text-text-muted hover:text-text hover:bg-gray-50/80'
        }`
      }
    >
      {link.label}
    </NavLink>
  )
}

export default function PublicLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const moreRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    if (!moreOpen) return
    const close = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [moreOpen])

  const moreIsActive = moreNavLinks.some(l => location.pathname === l.to)

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead />
      <GlobalStructuredData />
      <ScrollToTop />

      <header className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled ? 'glass shadow-sm shadow-primary/5 border-b border-gray-100/80' : 'bg-white/70 backdrop-blur-md border-b border-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 lg:h-[4.25rem] gap-3 lg:gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <img src={brand.logo} alt={brand.name} className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-sm ring-1 ring-gray-100 group-hover:scale-105 transition-transform shrink-0" />
              <span className="font-semibold text-base sm:text-lg text-primary-dark tracking-tight whitespace-nowrap">{brand.name}</span>
            </Link>

            {/* Desktop nav — centred, cannot bleed into actions */}
            <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-center">
              <div className="flex items-center gap-0.5 xl:gap-1">
                {primaryNavLinks.map(link => (
                  <NavItem key={link.to} link={link} />
                ))}
                <div className="relative" ref={moreRef}>
                  <button
                    type="button"
                    onClick={() => setMoreOpen(v => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                      moreIsActive || moreOpen
                        ? 'text-primary bg-accent/80 shadow-sm'
                        : 'text-text-muted hover:text-text hover:bg-gray-50/80'
                    }`}
                    aria-expanded={moreOpen}
                    aria-haspopup="true"
                  >
                    More
                    <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {moreOpen && (
                    <div className="absolute top-full left-0 mt-1.5 min-w-[11rem] py-1.5 bg-white rounded-xl border border-gray-100 shadow-lg shadow-primary/5 z-50 animate-fade-in">
                      {moreNavLinks.map(link => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          onClick={() => setMoreOpen(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2.5 text-sm font-medium transition-colors ${
                              isActive ? 'text-primary bg-accent/50' : 'text-text-muted hover:text-text hover:bg-gray-50'
                            }`
                          }
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </nav>

            {/* Actions — fixed width, separated from nav */}
            <div className="flex items-center shrink-0 gap-2 sm:gap-3 ml-auto lg:ml-0 lg:pl-4 lg:border-l lg:border-gray-200/80">
              <HeaderCartButton className="hidden sm:inline-flex" />
              <Link to="/contact" className="hidden sm:block">
                <Button size="sm" className="whitespace-nowrap">
                  <span className="hidden md:inline">Get in Touch</span>
                  <span className="md:hidden">Contact</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <button
                type="button"
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <>
            <div className="lg:hidden fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-30" onClick={() => setMenuOpen(false)} />
            <nav className="lg:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-gray-100 shadow-xl animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain">
              <div className="px-4 py-4 space-y-1">
                <Link
                  to={shopPaths.cart}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 mb-2 rounded-xl bg-accent/50 border border-primary/10 text-sm font-medium text-text"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    View cart
                  </span>
                  <CartCountBadge />
                </Link>
                {allNavLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'text-primary bg-accent' : 'text-text-muted hover:bg-gray-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="pt-4 mt-2 border-t border-gray-100 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-text-muted text-center mb-3">Connect with us</p>
                    <SocialLinks variant="dark" size="sm" className="justify-center" nowrap />
                  </div>
                  <Link to="/contact" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full">Get in Touch</Button>
                  </Link>
                </div>
              </div>
            </nav>
          </>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src={brand.logo} alt={brand.name} className="h-11 w-11 rounded-full object-cover ring-1 ring-white/20" />
                <span className="font-semibold text-xl tracking-tight">{brand.name}</span>
              </div>
              <p className="text-white/65 text-sm max-w-md leading-relaxed">
                {brand.description}
                <br />
                {brand.descriptionNote}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <SocialLinks variant="light" size="md" />
                <div className="flex flex-col gap-1.5 text-sm text-white/50">
                  <span>{brand.contact.email}</span>
                  <a href={brand.contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {brand.contact.phone}
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white/90">Quick Links</h3>
              <ul className="space-y-2.5 text-sm text-white/60">
                {allNavLinks.slice(0, 6).map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white/90">Shop</h3>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><Link to={shopPaths.catalogue} className="hover:text-white transition-colors">Browse shop</Link></li>
                <li><Link to={shopPaths.cart} className="hover:text-white transition-colors">Your cart</Link></li>
                <li><Link to="/get-app" className="hover:text-white transition-colors">Get the App</Link></li>
                <li><a href="/businesscard" className="hover:text-white transition-colors">Digital business card</a></li>
                <li><Link to={shopPaths.register} className="hover:text-white transition-colors">Create account</Link></li>
                <li><Link to={shopPaths.login} className="hover:text-white transition-colors">Sign in</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white/90">Legal</h3>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                <li><Link to="/legal-disclaimer" className="hover:text-white transition-colors">Legal Disclaimer</Link></li>
                <li><Link to="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <p>&copy; {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
            <SocialLinks variant="light" size="sm" nowrap />
          </div>
        </div>
      </footer>

      <DownloadAppFloat />
      <WhatsAppFloat />
    </div>
  )
}

function CartCountBadge() {
  const { itemCount } = useCart()
  if (itemCount <= 0) return null
  return (
    <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
      {itemCount}
    </span>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
