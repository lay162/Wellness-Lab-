import { useEffect, useState } from 'react'
import brand from '../../config/brand'
import { cn } from '../../lib/utils'
import { isAppInstalled } from '../../lib/pwaInstall'
import { Link, useLocation } from 'react-router-dom'
import { Smartphone } from 'lucide-react'

export function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function TikTokIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  )
}

export function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export const socialChannels = [
  {
    id: 'whatsapp',
    label: `WhatsApp ${brand.contact.phone}`,
    href: brand.contact.whatsappUrl,
    Icon: WhatsAppIcon,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    href: brand.social.tiktok,
    Icon: TikTokIcon,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: brand.social.facebook,
    Icon: FacebookIcon,
  },
]

const variants = {
  light: {
    link: 'text-white/60 hover:text-white hover:bg-white/10',
    ring: 'ring-white/20',
  },
  dark: {
    link: 'text-text-muted hover:text-primary hover:bg-accent',
    ring: 'ring-gray-200',
  },
  hero: {
    link: 'text-white/80 hover:text-white hover:bg-white/15',
    ring: 'ring-white/25',
  },
  header: {
    link: 'text-text-muted hover:text-primary hover:bg-gray-100/80',
    ring: 'ring-gray-200/80',
  },
}

const sizes = {
  xs: { btn: 'w-8 h-8', icon: 'w-3.5 h-3.5', gap: 'gap-1' },
  sm: { btn: 'w-9 h-9', icon: 'w-4 h-4', gap: 'gap-1.5' },
  md: { btn: 'w-10 h-10', icon: 'w-5 h-5', gap: 'gap-2' },
  lg: { btn: 'w-12 h-12', icon: 'w-6 h-6', gap: 'gap-2' },
}

export default function SocialLinks({ variant = 'dark', size = 'md', className, showLabels = false, nowrap = false }) {
  const v = variants[variant] || variants.dark
  const s = sizes[size] || sizes.md

  return (
    <div className={cn('flex items-center', s.gap, nowrap ? 'flex-nowrap shrink-0' : 'flex-wrap', className)}>
      {socialChannels.map(({ id, label, href, Icon }) => (
        <a
          key={id}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-200 ring-1',
            s.btn,
            v.link,
            v.ring,
            showLabels && 'w-auto px-4 gap-2'
          )}
        >
          <Icon className={s.icon} />
          {showLabels && <span className="text-sm font-medium">{id === 'whatsapp' ? brand.contact.phone : label}</span>}
        </a>
      ))}
    </div>
  )
}

export function HeroDownloadAppButton({ size = 'md', className }) {
  const s = sizes[size] || sizes.md
  const v = variants.hero

  return (
    <Link
      to="/get-app"
      aria-label="Download our app"
      title="Download our app"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-200 ring-1',
        s.btn,
        v.link,
        v.ring,
        className
      )}
    >
      <Smartphone className={s.icon} />
    </Link>
  )
}

/** Fixed FAB — top-right below sticky header so it stays visible (WhatsApp stays bottom-right) */
export function DownloadAppFloat() {
  const { pathname } = useLocation()
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setInstalled(isAppInstalled())
  }, [])

  if (installed || pathname === '/get-app') return null

  return (
    <Link
      to="/get-app"
      aria-label="Download our app"
      title="Download our app"
      className="fixed top-[4.75rem] lg:top-[5rem] right-4 sm:right-6 z-30 flex items-center justify-center w-14 h-14 rounded-full overflow-hidden bg-white shadow-lg shadow-primary-dark/30 hover:scale-105 hover:shadow-xl transition-all duration-200 ring-2 ring-primary/20"
    >
      <img
        src={brand.appIcon192}
        alt=""
        className="w-full h-full object-cover"
      />
    </Link>
  )
}

export function WhatsAppFloat() {
  return (
    <a
      href={brand.contact.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp — ${brand.contact.phone}`}
      title={`WhatsApp ${brand.contact.phone}`}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:scale-105 hover:shadow-xl transition-all duration-200"
    >
      <WhatsAppIcon className="w-7 h-7" />
    </a>
  )
}
