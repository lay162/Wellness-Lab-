import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    company_name: profile?.company_name || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id)
    if (error) toast.error(error.message)
    else { toast.success('Profile updated'); refreshProfile() }
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-text mb-8">Profile</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Full Name" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Email" value={profile?.email || ''} disabled />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="Company Name" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
          <div className="text-sm text-text-muted">
            <p>Status: <span className="font-medium capitalize">{profile?.status}</span></p>
            <p>Member since: {new Date(profile?.created_at).toLocaleDateString()}</p>
          </div>
          <Button type="submit" loading={loading}>Save Changes</Button>
        </form>
      </Card>
    </div>
  )
}
