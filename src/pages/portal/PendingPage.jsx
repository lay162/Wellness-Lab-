import { Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import brand from '../../config/brand'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function PendingPage() {
  const { signOut, profile } = useAuth()

  return (
    <Card className="p-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
        <Clock className="w-8 h-8 text-amber-600" />
      </div>
      <h1 className="text-2xl font-bold text-text mb-3">Awaiting Approval</h1>
      <p className="text-text-muted mb-2">
        Thank you{profile?.full_name ? `, ${profile.full_name}` : ''}! Your registration has been received.
      </p>
      <p className="text-sm text-text-muted mb-8">
        Our team will review your application and notify you once your account has been approved.
        This typically takes 1–2 business days.
      </p>
      <Button variant="outline" onClick={signOut}>Sign Out</Button>
    </Card>
  )
}

export function AccessDeniedPage() {
  const { signOut, profile } = useAuth()

  return (
    <Card className="p-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">🚫</span>
      </div>
      <h1 className="text-2xl font-bold text-text mb-3">Access Denied</h1>
      <p className="text-text-muted mb-2">
        {profile?.status === 'rejected'
          ? 'Your access request has been declined.'
          : profile?.status === 'suspended'
          ? 'Your account has been suspended.'
          : 'You do not have permission to access this area.'}
      </p>
      <p className="text-sm text-text-muted mb-8">
        If you believe this is an error, please contact {brand.contact.email}.
      </p>
      <Button variant="outline" onClick={signOut}>Sign Out</Button>
    </Card>
  )
}
