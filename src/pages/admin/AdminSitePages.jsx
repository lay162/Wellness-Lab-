import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
  PAGE_EDITOR_CONFIG,
  CARD_GROUP_LABELS,
  mergeSeedCards,
  mergeSeedFaqs,
  getSeedPage,
  resolvePageMeta,
  cardToDbPayload,
  faqToDbPayload,
  getLucideIcon,
} from '../../lib/siteContent'
import { getSeedKey, isSeedId } from '../../lib/websiteContent'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const FIELD_LABELS = {
  hero_title: 'Page title (hero)',
  hero_subtitle: 'Page subtitle (hero)',
  section_title: 'Section heading',
  section_subtitle: 'Section intro text',
  body_html: 'Main body content (HTML supported)',
  note_html: 'Footer note / disclaimer (HTML supported)',
  badge_text: 'Hero badge text',
  extra_title: 'Download section title',
  extra_subtitle: 'Download section text',
  cta_title: 'Bottom call-to-action title',
  cta_subtitle: 'Bottom call-to-action text',
}

function PageMetaEditor({ pageKey, config }) {
  const [form, setForm] = useState(getSeedPage(pageKey))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    supabase.from('site_pages').select('*').eq('page_key', pageKey).maybeSingle()
      .then(({ data }) => {
        setForm(resolvePageMeta(data, pageKey))
        setLoading(false)
      })
  }, [pageKey])

  const save = async () => {
    setSaving(true)
    const payload = { page_key: pageKey }
    config.fields.forEach(f => { payload[f] = form[f] || null })
    const { error } = await supabase.from('site_pages').upsert(payload, { onConflict: 'page_key' })
    if (error) toast.error(error.message)
    else toast.success('Page content saved')
    setSaving(false)
  }

  if (loading) return <PageLoader />

  return (
    <Card className="p-6 mb-8">
      <h2 className="font-semibold text-text mb-1">Page text</h2>
      {config.hint && <p className="text-xs text-text-muted mb-4">{config.hint}</p>}
      <div className="space-y-4">
        {config.fields.map(field => (
          field.includes('html') ? (
            <Textarea
              key={field}
              label={FIELD_LABELS[field]}
              rows={field === 'body_html' ? 8 : 4}
              value={form[field] || ''}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
            />
          ) : (
            <Input
              key={field}
              label={FIELD_LABELS[field]}
              value={form[field] || ''}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
            />
          )
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={save} loading={saving}>Save page text</Button>
      </div>
    </Card>
  )
}

function CardsEditor({ pageKey, cardGroup }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    supabase.from('site_cards').select('*').eq('page_key', pageKey).order('sort_order')
      .then(({ data }) => {
        setItems(mergeSeedCards(data || [], pageKey, cardGroup))
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [pageKey, cardGroup])

  const openCreate = () => {
    setForm({
      page_key: pageKey,
      card_group: cardGroup,
      title: '',
      description: '',
      icon: 'Leaf',
      step_label: '',
      sort_order: items.length + 1,
      is_published: true,
    })
    setEditing(null)
    setModal(true)
  }

  const openEdit = (item) => {
    setForm({ ...item })
    setEditing(item.id)
    setModal(true)
  }

  const save = async () => {
    setSaving(true)
    const seedEdit = editing && isSeedId(editing)
    const dbPayload = cardToDbPayload(
      { ...form, page_key: pageKey, card_group: cardGroup },
      { seedKey: seedEdit ? (getSeedKey(form) || editing) : undefined }
    )

    const { error } = seedEdit
      ? await supabase.from('site_cards').insert(dbPayload)
      : editing
        ? await supabase.from('site_cards').update(dbPayload).eq('id', editing)
        : await supabase.from('site_cards').insert(dbPayload)

    if (error) toast.error(error.message)
    else {
      toast.success('Card saved')
      setModal(false)
      load()
    }
    setSaving(false)
  }

  if (loading) return <PageLoader />

  const Icon = getLucideIcon(form.icon)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text">{CARD_GROUP_LABELS[cardGroup] || cardGroup}</h2>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /> Add card</Button>
      </div>
      <div className="space-y-3">
        {items.map(item => {
          const ItemIcon = getLucideIcon(item.icon)
          return (
            <Card key={item.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <ItemIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{item.title}</p>
                {item.description && <p className="text-xs text-text-muted truncate">{item.description}</p>}
                <div className="flex gap-2 mt-1">
                  {item.is_seed && <Badge status="pending">Live on website</Badge>}
                  {item.step_label && <Badge status="approved">Step {item.step_label}</Badge>}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                <Pencil className="w-3 h-3" />
              </Button>
            </Card>
          )
        })}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit card' : 'Add card'}
        footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Title" required value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Input label="Icon (Lucide name, e.g. Leaf, Shield)" value={form.icon || ''} onChange={e => setForm({ ...form, icon: e.target.value })} />
          {cardGroup === 'steps' && (
            <Input label="Step number" value={form.step_label || ''} onChange={e => setForm({ ...form, step_label: e.target.value })} placeholder="01" />
          )}
          <Input label="Sort order" type="number" value={form.sort_order ?? 0} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
            Show on website
          </label>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-text-muted">Preview matches site card style</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export function AdminPageContent() {
  const [activePage, setActivePage] = useState(PAGE_EDITOR_CONFIG[0].key)
  const config = PAGE_EDITOR_CONFIG.find(p => p.key === activePage)

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-2">Page content</h1>
      <p className="text-sm text-text-muted mb-6 max-w-2xl">
        Edit homepage, about, wellness, how it works, contact, and page headers for blog &amp; aftercare.
        Cards you add here use the same styles visitors see on the website.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {PAGE_EDITOR_CONFIG.map(p => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActivePage(p.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activePage === p.key ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {config && (
        <>
          <PageMetaEditor pageKey={config.key} config={config} />
          {config.hasCards && config.cardGroups.map(group => (
            <CardsEditor key={group} pageKey={config.key} cardGroup={group} />
          ))}
        </>
      )}
    </div>
  )
}

export function AdminFAQs() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [hero, setHero] = useState({ hero_title: '', hero_subtitle: '' })

  const load = () => {
    setLoading(true)
    Promise.all([
      supabase.from('faqs').select('*').order('sort_order'),
      supabase.from('site_pages').select('*').eq('page_key', 'faqs').maybeSingle(),
    ]).then(([faqsRes, pageRes]) => {
      setItems(mergeSeedFaqs(faqsRes.data || []))
      setHero(resolvePageMeta(pageRes.data, 'faqs'))
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const saveHero = async () => {
    const { error } = await supabase.from('site_pages').upsert({
      page_key: 'faqs',
      hero_title: hero.hero_title,
      hero_subtitle: hero.hero_subtitle,
    }, { onConflict: 'page_key' })
    if (error) toast.error(error.message)
    else toast.success('FAQ page header saved')
  }

  const openCreate = () => {
    setForm({ question: '', answer: '', sort_order: items.length + 1, is_published: true })
    setEditing(null)
    setModal(true)
  }

  const openEdit = (item) => {
    setForm({ ...item })
    setEditing(item.id)
    setModal(true)
  }

  const save = async () => {
    setSaving(true)
    const seedEdit = editing && isSeedId(editing)
    const dbPayload = faqToDbPayload(form, { seedKey: seedEdit ? (getSeedKey(form) || editing) : undefined })

    const { error } = seedEdit
      ? await supabase.from('faqs').insert(dbPayload)
      : editing
        ? await supabase.from('faqs').update(dbPayload).eq('id', editing)
        : await supabase.from('faqs').insert(dbPayload)

    if (error) toast.error(error.message)
    else {
      toast.success('FAQ saved')
      setModal(false)
      load()
    }
    setSaving(false)
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-2">FAQs</h1>
      <p className="text-sm text-text-muted mb-6 max-w-2xl">
        Questions and answers on your public FAQs page. Matches the accordion style on the website.
      </p>

      <Card className="p-6 mb-8">
        <h2 className="font-semibold text-text mb-4">Page header</h2>
        <div className="space-y-4">
          <Input label="Page title" value={hero.hero_title || ''} onChange={e => setHero({ ...hero, hero_title: e.target.value })} />
          <Input label="Page subtitle" value={hero.hero_subtitle || ''} onChange={e => setHero({ ...hero, hero_subtitle: e.target.value })} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={saveHero}>Save header</Button>
        </div>
      </Card>

      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add FAQ</Button>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-text">{item.question}</p>
                <p className="text-sm text-text-muted mt-2 line-clamp-2">{item.answer}</p>
                {item.is_seed && <Badge status="pending" className="mt-2">Live on website</Badge>}
              </div>
              <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                <Pencil className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit FAQ' : 'Add FAQ'}
        footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Question" required value={form.question || ''} onChange={e => setForm({ ...form, question: e.target.value })} />
          <Textarea label="Answer" rows={4} required value={form.answer || ''} onChange={e => setForm({ ...form, answer: e.target.value })} />
          <Input label="Sort order" type="number" value={form.sort_order ?? 0} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
            Show on website
          </label>
        </div>
      </Modal>
    </div>
  )
}

export function AdminWellnessAdvice() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    supabase.from('wellness_advice').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ title: '', content: '', category: '', is_published: false })
    setEditing(null)
    setModal(true)
  }

  const openEdit = (item) => { setForm({ ...item }); setEditing(item.id); setModal(true) }

  const save = async () => {
    setSaving(true)
    const payload = { ...form }
    delete payload.id
    delete payload.created_at
    delete payload.updated_at
    const { error } = editing
      ? await supabase.from('wellness_advice').update(payload).eq('id', editing)
      : await supabase.from('wellness_advice').insert(payload)
    if (error) toast.error(error.message)
    else { toast.success('Saved'); setModal(false); load() }
    setSaving(false)
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-2">Wellness advice (app)</h1>
      <p className="text-sm text-text-muted mb-6 max-w-2xl">
        Educational articles shown to registered customers in the private app portal.
      </p>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add New</Button>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-text">{item.title}</p>
              <Badge status={item.is_published ? 'approved' : 'pending'} className="mt-1">
                {item.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="w-3 h-3" /></Button>
          </Card>
        ))}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit' : 'Create'}
        footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Title" required value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label="Category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
          <Textarea label="Content (HTML supported)" rows={6} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded" />
            Published in app
          </label>
        </div>
      </Modal>
    </div>
  )
}
