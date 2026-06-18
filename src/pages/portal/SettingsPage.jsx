import { useAuth } from '../../context/AuthContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/private-portal/login')
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-text mb-8">Settings</h1>
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="font-semibold text-text mb-2">Account</h2>
          <p className="text-sm text-text-muted mb-4">Signed in as {profile?.email}</p>
          <Button variant="danger" onClick={handleSignOut}>Sign Out</Button>
        </div>
        <div className="pt-6 border-t border-gray-100">
          <h2 className="font-semibold text-text mb-2">Notifications</h2>
          <p className="text-sm text-text-muted">Email notifications for order updates are enabled by default.</p>
        </div>
      </Card>
    </div>
  )
}
