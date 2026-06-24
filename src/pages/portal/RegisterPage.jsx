import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured } from '../../lib/supabase'
import brand from '../../config/brand'
import Button from '../../components/ui/Button'
import Input, { Checkbox } from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import InstallAppPanel from '../../components/ui/InstallAppPanel'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { signUp, signIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    companyName: '', termsAccepted: false, complianceAccepted: false,
  })

  const set = (key) => (e) => setForm({
    ...form,
    [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.termsAccepted || !form.complianceAccepted) {
      toast.error('Please accept the terms and compliance requirements')
      return
    }
    if (!isSupabaseConfigured) {
      toast.error('Backend not connected. Add Supabase credentials to your .env file first.')
      return
    }
    setLoading(true)
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
      companyName: form.companyName,
      reasonForAccess: 'Self registration',
      termsAccepted: form.termsAccepted,
      complianceAccepted: form.complianceAccepted,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const { error: signInError } = await signIn(form.email, form.password)
    if (signInError) {
      toast.success('Registration complete! Please sign in.')
      navigate('/private-portal/login', { replace: true })
    } else {
      toast.success('Welcome to Wellness Lab!')
      navigate('/private-portal/pending', { replace: true })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <img src={brand.appIcon192} alt={brand.name} className="h-14 w-14 rounded-2xl mx-auto mb-4 lg:hidden shadow-md" />
        <h1 className="text-2xl font-bold text-text tracking-tight">Create your account</h1>
        <p className="text-sm text-text-muted mt-2">
          Create a free account to shop on the website and app.
        </p>
      </div>

      <InstallAppPanel />

      <Card glass className="p-8 shadow-xl shadow-primary/5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" required value={form.fullName} onChange={set('fullName')} />
          <Input label="Email" type="email" required value={form.email} onChange={set('email')} />
          <Input label="Password" type="password" required minLength={8} value={form.password} onChange={set('password')} />
          <Input label="Phone Number" type="tel" required value={form.phone} onChange={set('phone')} />
          <Input label="Company Name (optional)" value={form.companyName} onChange={set('companyName')} />
          <Checkbox label="I agree to the Terms and Conditions" checked={form.termsAccepted} onChange={set('termsAccepted')} />
          <Checkbox label="I confirm compliance with all applicable regulations" checked={form.complianceAccepted} onChange={set('complianceAccepted')} />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create account
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/private-portal/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
