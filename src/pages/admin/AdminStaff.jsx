import { useEffect, useState } from 'react'
import { Copy, Check, Plus, UserCog, Ban } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { createStaffUser, generateTempPassword } from '../../lib/staff'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { ConfirmModal } from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Skeleton'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

function CredentialsModal({ email, password, onClose }) {
  const [copied, setCopied] = useState(false)
  const text = `Wellness Lab Shop Dashboard\n\nLogin: ${window.location.origin}/private-portal/login?mode=admin\nEmail: ${email}\nTemporary password: ${password}\n\nYou must set a new password when you sign in for the first time.`

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Login details copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal isOpen onClose={onClose} title="Staff member added" footer={<Button onClick={onClose}>Done</Button>}>
      <div className="space-y-4">
        <p className="text-sm text-text-muted leading-relaxed">
          Share these details with your team member securely (e.g. WhatsApp). They must change their password on first sign-in.
        </p>
        <div className="p-4 rounded-xl bg-accent/60 border border-primary/10 text-sm space-y-2">
          <p><span className="font-medium text-text">Email:</span> {email}</p>
          <p><span className="font-medium text-text">Temporary password:</span> <code className="bg-white/80 px-2 py-0.5 rounded">{password}</code></p>
        </div>
        <Button variant="secondary" onClick={copy} className="w-full">
          {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy login details</>}
        </Button>
      </div>
    </Modal>
  )
}

export default function AdminStaff() {
  const { profile } = useAuth()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [credentials, setCredentials] = useState(null)
  const [revokeTarget, setRevokeTarget] = useState(null)
  const [form, setForm] = useState({ fullName: '', email: '', tempPassword: '' })

  const load = () => {
    supabase.from('profiles').select('*').eq('role', 'admin').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message)
        else setStaff(data || [])
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ fullName: '', email: '', tempPassword: generateTempPassword() })
    setShowCreate(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    const { error } = await createStaffUser({
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      tempPassword: form.tempPassword,
    })
    if (error) {
      const msg = error.message?.includes('FunctionsFetchError') || error.message?.includes('Failed to send')
        ? 'Staff creation service not deployed yet. Ask your developer to deploy the create-staff-user edge function.'
        : error.message
      toast.error(msg)
      setCreating(false)
      return
    }
    toast.success('Staff member added')
    setShowCreate(false)
    setCredentials({ email: form.email.trim(), password: form.tempPassword })
    load()
    setCreating(false)
  }

  const revokeAccess = async (id) => {
    const { error } = await supabase.from('profiles').update({ status: 'suspended' }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Access removed'); load(); setRevokeTarget(null) }
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Shop Team</h1>
          <p className="text-sm text-text-muted mt-1">
            Add staff who can manage products, orders, and customers
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add team member
        </Button>
      </div>

      <div className="space-y-3">
        {staff.map(member => (
          <Card key={member.id} className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-text">{member.full_name || 'Unnamed'}</p>
                  {member.id === profile?.id && (
                    <Badge className="bg-primary/10 text-primary">You</Badge>
                  )}
                  <Badge status={member.status}>{member.status}</Badge>
                  {member.must_change_password && (
                    <Badge className="bg-amber-100 text-amber-800">Awaiting password change</Badge>
                  )}
                </div>
                <p className="text-sm text-text-muted">{member.email}</p>
                <p className="text-xs text-text-muted mt-1">Added {formatDate(member.created_at)}</p>
              </div>
              {member.id !== profile?.id && member.status === 'approved' && (
                <Button size="sm" variant="outline" onClick={() => setRevokeTarget(member)}>
                  <Ban className="w-4 h-4" /> Remove access
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add shop team member">
        <form onSubmit={handleCreate} className="space-y-4">
          <p className="text-sm text-text-muted leading-relaxed">
            A temporary password will be created. Share it securely — they must choose a new password on first sign-in.
          </p>
          <Input
            label="Full name"
            required
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            label="Email (their login)"
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <div>
            <Input
              label="Temporary password"
              required
              minLength={8}
              value={form.tempPassword}
              onChange={e => setForm({ ...form, tempPassword: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setForm({ ...form, tempPassword: generateTempPassword() })}
              className="text-xs text-primary font-medium mt-2 hover:underline"
            >
              Generate new password
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Add team member</Button>
          </div>
        </form>
      </Modal>

      {credentials && (
        <CredentialsModal
          email={credentials.email}
          password={credentials.password}
          onClose={() => setCredentials(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => revokeAccess(revokeTarget.id)}
        title="Remove shop access"
        message={`Remove dashboard access for ${revokeTarget?.full_name}? They will no longer be able to sign in as admin.`}
        confirmText="Remove access"
      />
    </div>
  )
}
