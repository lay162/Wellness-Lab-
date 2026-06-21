import { useState } from 'react'
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { isDevBypass } from '../../lib/devAuth'
import brand from '../../config/brand'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signIn, enterDevAs } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const isAdminView = searchParams.get('mode') === 'admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const setAdminView = (admin) => {
    const next = new URLSearchParams(searchParams)
    if (admin) next.set('mode', 'admin')
    else next.delete('mode')
    setSearchParams(next, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      toast.error('Backend not connected. Add Supabase credentials to your .env file first.')
      return
    }
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

    if (profile?.must_change_password) {
      navigate('/private-portal/change-password')
    } else if (profile?.role === 'admin' && profile?.status === 'approved') {
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

  const handleDevEnter = (role) => {
    enterDevAs(role)
    toast.success(`Dev mode — entered as ${role}`)
    navigate(role === 'admin' ? '/private-admin' : '/private-portal/dashboard')
  }

  const devBypass = isDevBypass()

  return (
    <Card glass className="p-8 shadow-xl shadow-primary/5">
      {devBypass && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 space-y-3">
          <p className="font-medium">Development mode</p>
          <p className="text-amber-800/90 leading-relaxed">
            Skip login while email is being set up. Catalogue uses seed data if the database blocks writes.
          </p>
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={() => handleDevEnter('admin')} className="w-full">
              Enter as Admin (dev)
            </Button>
            <Button type="button" variant="secondary" onClick={() => handleDevEnter('customer')} className="w-full">
              Enter as Customer (dev)
            </Button>
          </div>
          <p className="text-xs text-amber-700/80 pt-1 border-t border-amber-200/80">
            Or use real login below when Supabase users exist.
          </p>
        </div>
      )}
      {!isSupabaseConfigured && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <p className="font-medium">Sign-in is not active yet</p>
          <p className="mt-1 text-amber-800/90 leading-relaxed">
            The database is not connected. Create a free Supabase project, add your keys to a <code className="text-xs bg-amber-100 px-1 rounded">.env</code> file, then register an account.
          </p>
        </div>
      )}
      <div className="text-center mb-8">
        <img src={brand.appIcon192} alt={brand.name} className="h-14 w-14 rounded-2xl mx-auto mb-4 lg:hidden shadow-md" />
        {isAdminView && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-accent px-3 py-1 rounded-full mb-3">
            Admin
          </span>
        )}
        <h1 className="text-2xl font-bold text-text tracking-tight">
          {isAdminView ? 'Admin' : 'Welcome back'}
        </h1>
        <p className="text-sm text-text-muted mt-2">
          {isAdminView
            ? 'Manage products, customers, and orders'
            : 'Sign in to your private account'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign In
        </Button>
      </form>

      <p className="text-center text-xs text-text-muted mt-6">
        {isAdminView ? (
          <>
            Not an admin?{' '}
            <button type="button" onClick={() => setAdminView(false)} className="text-primary font-medium hover:underline">
              Customer
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <Link to="/private-portal/register" className="text-primary font-medium hover:underline">
              Create one free
            </Link>
            <span className="block mt-3">
              <button type="button" onClick={() => setAdminView(true)} className="text-primary/80 font-medium hover:text-primary hover:underline">
                Admin
              </button>
            </span>
          </>
        )}
      </p>
    </Card>
  )
}
