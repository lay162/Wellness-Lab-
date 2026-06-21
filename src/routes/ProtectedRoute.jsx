import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/Skeleton'

export function ProtectedRoute({ children, requireApproved, requireAdmin, requireAuth, allowPasswordChange }) {
  const { user, profile, loading, isAdmin, isApproved, isPending, isRejected, isSuspended, mustChangePassword } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (requireAuth && !user) {
    return <Navigate to="/private-portal/login" state={{ from: location }} replace />
  }

  if (user && mustChangePassword && !allowPasswordChange) {
    return <Navigate to="/private-portal/change-password" replace />
  }

  if (requireAdmin) {
    if (!user) return <Navigate to="/private-portal/login" replace />
    if (!isAdmin) return <Navigate to="/private-portal/access-denied" replace />
    return children
  }

  if (requireApproved) {
    if (!user) return <Navigate to="/private-portal/login" state={{ from: location }} replace />
    if (isPending) return <Navigate to="/private-portal/pending" replace />
    if (isRejected || isSuspended) return <Navigate to="/private-portal/access-denied" replace />
    if (!isApproved && !isAdmin) return <Navigate to="/private-portal/access-denied" replace />
    return children
  }

  return children
}

export function GuestRoute({ children }) {
  const { user, profile, loading, isAdmin, isApproved, isPending, mustChangePassword } = useAuth()
  if (loading) return <PageLoader />
  if (user) {
    if (mustChangePassword) return <Navigate to="/private-portal/change-password" replace />
    if (isAdmin) return <Navigate to="/private-admin" replace />
    if (isApproved) return <Navigate to="/private-portal/dashboard" replace />
    if (isPending) return <Navigate to="/private-portal/pending" replace />
    return <Navigate to="/private-portal/access-denied" replace />
  }
  return children
}
