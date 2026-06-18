import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { WhatsAppIcon } from '../../components/ui/SocialLinks'
import { useAuth } from '../../context/AuthContext'
import brand from '../../config/brand'
import Button from '../../components/ui/Button'
import Input, { Checkbox } from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import toast from 'react-hot-toast'

function InvitationRequired() {
  return (
    <Card glass className="p-8 max-w-lg mx-auto shadow-xl shadow-primary/5 text-center">
      <img src={brand.appIcon192} alt={brand.name} className="h-16 w-16 rounded-2xl mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-text">Invitation Required</h1>
      <p className="text-sm text-text-muted mt-3 leading-relaxed">
        The Wellness Lab portal is invite-only. You need a personal invitation link from our team before you can register.
      </p>
      <p className="text-sm text-text-muted mt-2">
        If you have been invited, open the link from your invitation email or message — it will bring you back here to complete registration.
      </p>
      <div className="mt-6 space-y-3">
        <a href={brand.contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full">
            <WhatsAppIcon className="w-4 h-4" /> Contact Us on WhatsApp
          </Button>
        </a>
        <Link to="/private-portal/login" className="block text-sm text-primary font-medium hover:underline">
          Already registered? Sign in
        </Link>
      </div>
    </Card>
  )
}

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite')

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    companyName: '',
    termsAccepted: false, complianceAccepted: false,
  })

  if (!inviteToken) {
    return <InvitationRequired />
  }

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
      reasonForAccess: 'Invited customer',
      termsAccepted: form.termsAccepted,
      complianceAccepted: form.complianceAccepted,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Registration complete! You can now sign in.')
    navigate('/private-portal/login')
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  return (
    <Card glass className="p-8 max-w-lg mx-auto shadow-xl shadow-primary/5">
      <div className="text-center mb-8">
        <img src={brand.appIcon192} alt={brand.name} className="h-16 w-16 rounded-2xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text">Complete Your Invitation</h1>
        <p className="text-sm text-text-muted mt-2">
          You&apos;ve been invited to {brand.name}. Create your account below to access the private portal.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" required value={form.fullName} onChange={set('fullName')} />
        <Input label="Email" type="email" required value={form.email} onChange={set('email')} />
        <Input label="Password" type="password" required minLength={8} value={form.password} onChange={set('password')} />
        <Input label="Phone Number" type="tel" required value={form.phone} onChange={set('phone')} />
        <Input label="Company Name (optional)" value={form.companyName} onChange={set('companyName')} />
        <Checkbox label="I agree to the Terms and Conditions" checked={form.termsAccepted} onChange={set('termsAccepted')} />
        <Checkbox label="I confirm compliance with all applicable regulations" checked={form.complianceAccepted} onChange={set('complianceAccepted')} />
        <Button type="submit" loading={loading} className="w-full">Complete Registration</Button>
      </form>
      <p className="text-center text-sm text-text-muted mt-6">
        Already have an account?{' '}
        <Link to="/private-portal/login" className="text-primary font-medium hover:underline">Sign In</Link>
      </p>
    </Card>
  )
}
