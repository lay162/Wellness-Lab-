import { cn } from '../../lib/utils'

const variants = {
  primary: 'gradient-button text-white hover:brightness-110 active:scale-[0.98] shadow-lg shadow-primary/25',
  secondary: 'bg-white text-primary-dark border border-primary/15 hover:bg-accent hover:border-primary/25 active:scale-[0.98]',
  outline: 'border border-gray-200 text-text hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]',
  ghost: 'text-text-muted hover:text-text hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-lg shadow-red-600/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

export default function Button({
  children, variant = 'primary', size = 'md', className, loading, disabled, ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
