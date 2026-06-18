import { cn } from '../../lib/utils'

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white',
          'text-text placeholder:text-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'transition-all duration-200',
          error && 'border-red-300 focus:ring-red-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white',
          'text-text placeholder:text-text-muted resize-y min-h-[100px]',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'transition-all duration-200',
          error && 'border-red-300 focus:ring-red-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-text">{label}</label>}
      <select
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white',
          'text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function Checkbox({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      <label className={cn('flex items-start gap-3 cursor-pointer', className)}>
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
          {...props}
        />
        <span className="text-sm text-text-muted">{label}</span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
