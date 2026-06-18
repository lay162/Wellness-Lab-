import { cn, getStatusColor } from '../../lib/utils'

export default function Badge({ children, status, className }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      status ? getStatusColor(status) : 'bg-gray-100 text-gray-800',
      className
    )}>
      {children}
    </span>
  )
}
