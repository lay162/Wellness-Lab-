import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input, { Select, Textarea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import {
  formatCurrency, formatDate, ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS,
} from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [items, setItems] = useState([])
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    supabase.from('orders').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const openOrder = async (order) => {
    setSelected(order)
    setForm({
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method || '',
      payment_link: order.payment_link || '',
      shipping_notes: order.shipping_notes || '',
      admin_notes: order.admin_notes || '',
    })
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id)
    setItems(data || [])
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('orders').update(form).eq('id', selected.id)
    if (error) toast.error(error.message)
    else { toast.success('Order updated'); setSelected(null); load() }
    setSaving(false)
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-8">Order Management</h1>
      <div className="space-y-3">
        {orders.map(o => (
          <Card key={o.id} hover className="p-5 cursor-pointer" onClick={() => openOrder(o)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-text">{o.profiles?.full_name}</p>
                <p className="text-xs text-text-muted">{o.profiles?.email} · {formatDate(o.created_at)}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-semibold">{formatCurrency(o.total_amount)}</span>
                <Badge status={o.status}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                <Badge status={o.payment_status}>{PAYMENT_STATUS_LABELS[o.payment_status]}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Order #${selected?.id?.slice(0, 8)}`}
        footer={<><Button variant="outline" onClick={() => setSelected(null)}>Close</Button><Button onClick={handleSave} loading={saving}>Save Changes</Button></>}>
        {selected && (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              {items.map(i => (
                <div key={i.id} className="flex justify-between">
                  <span>{i.product_name} × {i.quantity}</span>
                  <span>{formatCurrency(i.unit_price * i.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span><span>{formatCurrency(selected.total_amount)}</span>
              </div>
            </div>
            <Select label="Order Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select label="Payment Status" value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value })}>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select label="Payment Method" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
              <option value="">Select method</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Input label="Payment Link (SumUp etc.)" value={form.payment_link} onChange={e => setForm({ ...form, payment_link: e.target.value })} />
            <Textarea label="Shipping Notes" value={form.shipping_notes} onChange={e => setForm({ ...form, shipping_notes: e.target.value })} />
            <Textarea label="Admin Notes" value={form.admin_notes} onChange={e => setForm({ ...form, admin_notes: e.target.value })} />
          </div>
        )}
      </Modal>
    </div>
  )
}
