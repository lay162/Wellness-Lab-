import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ConfirmModal } from '../../components/ui/Modal'
import { USER_STATUS_LABELS, formatDate } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)

  const load = () => {
    supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })
      .then(({ data }) => { setCustomers(data || []); setFiltered(data || []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search) { setFiltered(customers); return }
    const q = search.toLowerCase()
    setFiltered(customers.filter(c =>
      c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company_name?.toLowerCase().includes(q)
    ))
  }, [search, customers])

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success(`Customer ${status}`); load(); setConfirm(null) }
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-text">Customer Management</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <Card key={c.id} className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-text">{c.full_name}</p>
                <p className="text-sm text-text-muted">{c.email} · {c.phone}</p>
                {c.company_name && <p className="text-xs text-text-muted">{c.company_name}</p>}
                {c.reason_for_access && <p className="text-xs text-text-muted mt-1 italic">"{c.reason_for_access}"</p>}
                <p className="text-xs text-text-muted mt-1">Registered {formatDate(c.created_at)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge status={c.status}>{USER_STATUS_LABELS[c.status]}</Badge>
                {c.status === 'pending' && (
                  <>
                    <Button size="sm" onClick={() => setConfirm({ id: c.id, action: 'approved', name: c.full_name })}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirm({ id: c.id, action: 'rejected', name: c.full_name })}>Reject</Button>
                  </>
                )}
                {c.status === 'approved' && (
                  <Button size="sm" variant="outline" onClick={() => setConfirm({ id: c.id, action: 'suspended', name: c.full_name })}>Suspend</Button>
                )}
                {c.status === 'suspended' && (
                  <Button size="sm" onClick={() => updateStatus(c.id, 'approved')}>Reinstate</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => updateStatus(confirm.id, confirm.action)}
        title={`${confirm?.action === 'approved' ? 'Approve' : confirm?.action === 'rejected' ? 'Reject' : 'Suspend'} Customer`}
        message={`Are you sure you want to ${confirm?.action} ${confirm?.name}?`}
        confirmText={confirm?.action === 'approved' ? 'Approve' : confirm?.action === 'rejected' ? 'Reject' : 'Suspend'}
      />
    </div>
  )
}
