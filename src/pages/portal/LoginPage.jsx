import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import brand from '../../config/brand'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await signIn(email, password)
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    toast.success('Welcome back!')

    if (profile?.role === 'admin' && profile?.status === 'approved') {
      navigate('/private-admin')
    } else if (profile?.status === 'approved') {
      navigate(location.state?.from?.pathname || '/private-portal/dashboard')
    } else if (profile?.status === 'pending') {
      navigate('/private-portal/pending')
    } else {
      navigate('/private-portal/access-denied')
    }
    setLoading(false)
  }

  return (
    <Card glass className="p-8 shadow-xl shadow-primary/5">
      <div className="text-center mb-8">
        <img src={brand.appIcon192} alt={brand.name} className="h-14 w-14 rounded-2xl mx-auto mb-4 lg:hidden shadow-md" />
        <h1 className="text-2xl font-bold text-text tracking-tight">Welcome back</h1>
        <p className="text-sm text-text-muted mt-2">Sign in to your private account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
      </form>
      <p className="text-center text-sm text-text-muted mt-6">
        Need access?{' '}
        <Link to="/private-portal/register" className="text-primary font-semibold hover:underline">Request access</Link>
      </p>
    </Card>
  )
}
