import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { slugify } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

function ContentManager({ table, title, fields = ['title', 'content'], extraFields = [] }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    supabase.from(table).select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    const empty = {}
    fields.forEach(f => empty[f] = '')
    extraFields.forEach(f => empty[f.key] = f.default ?? '')
    setForm(empty); setEditing(null); setModal(true)
  }

  const openEdit = (item) => { setForm({ ...item }); setEditing(item.id); setModal(true) }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form }
    if (table === 'blog_posts' && !editing) payload.slug = slugify(form.title)

    const { error } = editing
      ? await supabase.from(table).update(payload).eq('id', editing)
      : await supabase.from(table).insert(payload)

    if (error) toast.error(error.message)
    else { toast.success('Saved'); setModal(false); load() }
    setSaving(false)
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add New</Button>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-text">{item.title}</p>
              <div className="flex gap-2 mt-1">
                {item.is_published !== undefined && <Badge status={item.is_published ? 'approved' : 'pending'}>{item.is_published ? 'Published' : 'Draft'}</Badge>}
                {item.is_approved !== undefined && <Badge status={item.is_approved ? 'approved' : 'pending'}>{item.is_approved ? 'Approved' : 'Pending'}</Badge>}
                {item.is_public !== undefined && item.is_public && <Badge status="approved">Public</Badge>}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="w-3 h-3" /></Button>
          </Card>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit' : 'Create'}
        footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          {fields.includes('title') && <Input label="Title" required value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />}
          {fields.includes('slug') && <Input label="Slug" value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} />}
          {fields.includes('excerpt') && <Input label="Excerpt" value={form.excerpt || ''} onChange={e => setForm({ ...form, excerpt: e.target.value })} />}
          {fields.includes('category') && <Input label="Category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />}
          {fields.includes('author_name') && <Input label="Author Name" value={form.author_name || ''} onChange={e => setForm({ ...form, author_name: e.target.value })} />}
          {fields.includes('content') && <Textarea label="Content (HTML supported)" rows={6} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} />}
          {fields.includes('rating') && <Input label="Rating (1-5)" type="number" min="1" max="5" value={form.rating || ''} onChange={e => setForm({ ...form, rating: parseInt(e.target.value) })} />}
          {extraFields.map(f => (
            <label key={f.key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })} className="rounded" />
              {f.label}
            </label>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export function AdminBlog() {
  return <ContentManager table="blog_posts" title="Blog Management"
    fields={['title', 'excerpt', 'content', 'category']}
    extraFields={[
      { key: 'is_published', label: 'Published', default: false },
      { key: 'featured', label: 'Featured', default: false },
    ]} />
}

export function AdminReviews() {
  return <ContentManager table="reviews" title="Reviews Management"
    fields={['author_name', 'content', 'rating']}
    extraFields={[
      { key: 'is_approved', label: 'Approved', default: false },
      { key: 'is_public', label: 'Show on public site', default: false },
    ]} />
}

export function AdminSuccessStories() {
  return <ContentManager table="success_stories" title="Success Stories Management"
    fields={['title', 'author_name', 'content']}
    extraFields={[
      { key: 'is_approved', label: 'Approved', default: false },
      { key: 'is_public', label: 'Show on public site', default: false },
    ]} />
}

export function AdminAftercare() {
  return <ContentManager table="aftercare_posts" title="Aftercare Management"
    fields={['title', 'content', 'category']}
    extraFields={[
      { key: 'is_published', label: 'Published', default: false },
      { key: 'is_public', label: 'Show on public site', default: false },
    ]} />
}

export function AdminSettings() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-8">Settings</h1>
      <Card className="p-6">
        <p className="text-text-muted text-sm">
          Brand settings are managed in <code className="bg-gray-100 px-1 rounded">src/config/brand.js</code>.
          Update business name, colours, contact details, and social links there.
        </p>
      </Card>
    </div>
  )
}

export function AdminLegal() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('legal_pages').select('*').order('title')
      .then(({ data }) => { setPages(data || []); setLoading(false) })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('legal_pages').update({ content }).eq('id', editing.id)
    if (error) toast.error(error.message)
    else { toast.success('Legal page updated'); setEditing(null) }
    setSaving(false)
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-8">Legal Pages</h1>
      <div className="space-y-3">
        {pages.map(p => (
          <Card key={p.id} className="p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-text">{p.title}</p>
              <p className="text-xs text-text-muted">/{p.slug}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setEditing(p); setContent(p.content || '') }}>
              <Pencil className="w-3 h-3" /> Edit
            </Button>
          </Card>
        ))}
      </div>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={editing?.title}
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <Textarea label="Content (HTML supported)" rows={12} value={content} onChange={e => setContent(e.target.value)} />
      </Modal>
    </div>
  )
}
