import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export default function PageHero({ title, subtitle, children, compact }) {
  return (
    <section className="relative overflow-hidden gradient-hero text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-light/5 blur-3xl" />
      </div>
      <div className={cn(
        'relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in',
        compact ? 'py-14 lg:py-16' : 'py-20 lg:py-28'
      )}>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-balance tracking-tight">{title}</h1>
        {subtitle && <p className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed">{subtitle}</p>}
        {children}
      </div>
    </section>
  )
}

export function SectionHeader({ title, subtitle, linkTo, linkLabel = 'View all' }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
      <div>
        <h2 className="text-3xl font-bold text-text tracking-tight">{title}</h2>
        {subtitle && <p className="text-text-muted mt-2 max-w-xl">{subtitle}</p>}
      </div>
      {linkTo && (
        <a href={linkTo} className="text-primary font-medium flex items-center gap-1.5 hover:gap-2.5 transition-all shrink-0 group">
          {linkLabel}
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </a>
      )}
    </div>
  )
}

// React Router Link variant
export function SectionHeaderLink({ title, subtitle, to, linkLabel = 'View all' }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
      <div>
        <h2 className="text-3xl font-bold text-text tracking-tight">{title}</h2>
        {subtitle && <p className="text-text-muted mt-2 max-w-xl">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="text-primary font-medium flex items-center gap-1.5 hover:gap-2.5 transition-all shrink-0 group">
          {linkLabel}
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      )}
    </div>
  )
}
