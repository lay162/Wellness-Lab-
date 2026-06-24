import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getPortalBackTarget } from '../../lib/portalNav'

/** In-page back link — hidden on mobile where the portal header back button is shown. */
export default function PortalBackLink({ to, children = 'Back', className = '' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const target = to ?? getPortalBackTarget(location.pathname)

  return (
    <button
      type="button"
      onClick={() => navigate(target)}
      className={`hidden lg:inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline mb-6 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" aria-hidden />
      {children}
    </button>
  )
}

export function PortalBackLinkAnchor({ to, children = 'Back', className = '' }) {
  return (
    <Link
      to={to}
      className={`hidden lg:inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline mb-6 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" aria-hidden />
      {children}
    </Link>
  )
}
