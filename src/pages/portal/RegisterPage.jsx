import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import brand from '../../config/brand'
import Button from '../../components/ui/Button'
import Input, { Textarea, Checkbox } from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    companyName: '', reasonForAccess: '',
    termsAccepted: false, complianceAccepted: false,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.termsAccepted || !form.complianceAccepted) {
      toast.error('Please accept the terms and compliance requirements')
      return
    }
    setLoading(true)
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
      companyName: form.companyName,
      reasonForAccess: form.reasonForAccess,
      termsAccepted: form.termsAccepted,
      complianceAccepted: form.complianceAccepted,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Registration submitted! Awaiting approval.')
    navigate('/private-portal/pending')
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  return (
    <Card glass className="p-8 max-w-lg mx-auto shadow-xl shadow-primary/5">
      <div className="text-center mb-8">
        <img src={brand.appIcon192} alt={brand.name} className="h-16 w-16 rounded-2xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text">Request Access</h1>
        <p className="text-sm text-text-muted mt-2">Complete the form to request portal access</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" required value={form.fullName} onChange={set('fullName')} />
        <Input label="Email" type="email" required value={form.email} onChange={set('email')} />
        <Input label="Password" type="password" required minLength={8} value={form.password} onChange={set('password')} />
        <Input label="Phone Number" type="tel" required value={form.phone} onChange={set('phone')} />
        <Input label="Company Name" value={form.companyName} onChange={set('companyName')} />
        <Textarea label="Reason For Access" required rows={3} value={form.reasonForAccess} onChange={set('reasonForAccess')} />
        <Checkbox label="I agree to the Terms and Conditions" checked={form.termsAccepted} onChange={set('termsAccepted')} />
        <Checkbox label="I confirm compliance with all applicable regulations" checked={form.complianceAccepted} onChange={set('complianceAccepted')} />
        <Button type="submit" loading={loading} className="w-full">Submit Registration</Button>
      </form>
      <p className="text-center text-sm text-text-muted mt-6">
        Already have an account?{' '}
        <Link to="/private-portal/login" className="text-primary font-medium hover:underline">Sign In</Link>
      </p>
    </Card>
  )
}
