import { cn } from '../../lib/utils'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-6">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-accent/80 flex items-center justify-center mx-auto mb-5">
          <Icon className="w-8 h-8 text-primary/60" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      {description && <p className="text-text-muted text-sm max-w-sm mx-auto mb-6">{description}</p>}
      {action}
    </div>
  )
}

export function PortalPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text tracking-tight">{title}</h1>
        {subtitle && <p className="text-text-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, color = 'text-primary' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-primary/10 transition-all duration-300">
      <Icon className={cn('w-8 h-8 mb-3', color)} />
      <p className="text-3xl font-bold text-text tracking-tight">{value}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  )
}
