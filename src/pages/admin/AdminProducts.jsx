import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import Modal, { ConfirmModal } from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { formatCurrency } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const empty = { name: '', description: '', price: '', stock: '', category: '', sku: '', is_active: true }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)

  const load = () => {
    supabase.from('products').select('*').order('name')
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(empty); setEditing(null); setImageFile(null); setModal(true) }
  const openEdit = (p) => {
    setForm({ ...p, price: String(p.price), stock: String(p.stock) })
    setEditing(p.id); setImageFile(null); setModal(true)
  }

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let image_url = editing ? products.find(p => p.id === editing)?.image_url : null
      if (imageFile) image_url = await uploadImage(imageFile)

      const payload = {
        name: form.name, description: form.description,
        price: parseFloat(form.price), stock: parseInt(form.stock) || 0,
        category: form.category, sku: form.sku, is_active: form.is_active,
        ...(image_url && { image_url }),
      }

      const { error } = editing
        ? await supabase.from('products').update(payload).eq('id', editing)
        : await supabase.from('products').insert(payload)

      if (error) throw error
      toast.success(editing ? 'Product updated' : 'Product created')
      setModal(false); load()
    } catch (e) { toast.error(e.message) }
    setSaving(false)
  }

  const deactivate = async (id) => {
    await supabase.from('products').update({ is_active: false }).eq('id', id)
    toast.success('Product deactivated'); load(); setDeleteId(null)
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text">Products</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Product</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <Card key={p.id} className="overflow-hidden">
            {p.image_url && <img src={p.image_url} alt="" className="w-full h-36 object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-text">{p.name}</p>
                  <p className="text-primary font-bold">{formatCurrency(p.price)}</p>
                  <p className="text-xs text-text-muted">Stock: {p.stock}</p>
                </div>
                <Badge status={p.is_active ? 'approved' : 'rejected'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="w-3 h-3" /></Button>
                {p.is_active && <Button size="sm" variant="danger" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3 h-3" /></Button>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Product' : 'New Product'}
        footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (£)" type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <Input label="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <Input label="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Image</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="text-sm" />
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deactivate(deleteId)}
        title="Deactivate Product" message="This product will be hidden from the catalogue." confirmText="Deactivate" />
    </div>
  )
}
