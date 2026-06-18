import { cn } from '../../lib/utils'

export default function Card({ children, className, hover, glass, onClick }) {
  return (
    <div
      className={cn(
        'rounded-2xl border shadow-sm',
        glass
          ? 'glass border-white/50'
          : 'bg-white border-gray-100/80',
        hover && 'hover-lift hover:border-primary/15 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return <div className={cn('p-6 pb-0', className)}>{children}</div>
}

export function CardBody({ children, className }) {
  return <div className={cn('p-6', className)}>{children}</div>
}

export function CardFooter({ children, className }) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>
}

export function FeatureCard({ icon: Icon, title, desc, className }) {
  return (
    <Card className={cn('p-7 text-center hover-lift group', className)}>
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-secondary/30 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
    </Card>
  )
}
