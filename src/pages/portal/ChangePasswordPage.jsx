import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import brand from '../../config/brand'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import toast from 'react-hot-toast'

export default function ChangePasswordPage() {
  const { profile, isAdmin, updatePassword, mustChangePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    const { error } = await updatePassword(password)
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Password updated!')
    navigate(isAdmin ? '/private-admin' : '/private-portal/dashboard', { replace: true })
    setLoading(false)
  }

  return (
    <div className="min-h-screen gradient-hero-subtle flex items-center justify-center p-6">
      <Card glass className="p-8 max-w-md w-full shadow-xl shadow-primary/5">
        <div className="text-center mb-8">
          <img src={brand.appIcon192} alt={brand.name} className="h-14 w-14 rounded-2xl mx-auto mb-4" />
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">
            {mustChangePassword ? 'Set your new password' : 'Change password'}
          </h1>
          <p className="text-sm text-text-muted mt-2 leading-relaxed">
            {mustChangePassword
              ? 'For security, choose a new password before continuing to the shop dashboard.'
              : 'Enter a new password for your account.'}
          </p>
          {profile?.email && (
            <p className="text-xs text-text-muted mt-2">{profile.email}</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            {mustChangePassword ? 'Continue to dashboard' : 'Update password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
