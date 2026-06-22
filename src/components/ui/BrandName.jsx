import brand from '../../config/brand'
import { cn } from '../../lib/utils'

/** Splits "Wellness Lab" so "Lab" uses the logo accent colour (secondary green). */
export default function BrandName({ className, labClassName, variant = 'default' }) {
  const [first, second] = brand.name.includes(' ')
    ? [brand.name.slice(0, brand.name.lastIndexOf(' ')), brand.name.slice(brand.name.lastIndexOf(' ') + 1)]
    : [brand.name, '']

  const variants = {
    default: { first: 'text-primary-dark', lab: 'text-secondary' },
    light: { first: 'text-white', lab: 'text-secondary' },
    hero: { first: 'text-white', lab: 'text-secondary' },
  }

  const v = variants[variant] || variants.default

  return (
    <span className={cn('font-semibold tracking-tight', className)}>
      <span className={cn(v.first)}>{first}</span>
      {second && (
        <>
          {' '}
          <span className={cn(v.lab, labClassName)}>{second}</span>
        </>
      )}
    </span>
  )
}
