import { useEffect, useState } from 'react'
import { Plus, Pencil, Download, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { uploadContentImage, CONTENT_BUCKETS } from '../../lib/contentUpload'
import { mergeSeedReviews, mergeSeedStories, toDbPayload, isSeedId, getSeedKey } from '../../lib/websiteContent'
import { mergeSeedBlogPosts, importSeedBlogPosts } from '../../lib/blogContent'
import { getReviewImage, getStoryBeforeAfter, syncStoryImageFields } from '../../lib/contentImages'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import Modal, { ConfirmModal } from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { slugify } from '../../lib/utils'
import { PageLoader } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

function ImageField({ label, value, onChange, onFile }) {
  return (
    <div className="space-y-2">
      <Input label={label} value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder="Image URL or upload below" />
      <input type="file" accept="image/*" onChange={e => onFile(e.target.files?.[0])}
        className="block w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
      {value && (
        <img src={value} alt="" className="h-24 w-24 object-cover rounded-lg border border-gray-100" />
      )}
    </div>
  )
}

function ContentManager({
  table,
  title,
  subtitle,
  fields = ['title', 'content'],
  extraFields = [],
  imageField = null,
  beforeAfter = false,
  mergeSeeds = null,
  showPrivateContent = false,
  importSeed = null,
  importSeedLabel = 'Import starter content',
  allowDelete = false,
  contentRows = 6,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pendingFiles, setPendingFiles] = useState({})
  const [importing, setImporting] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const bucket = CONTENT_BUCKETS[table]

  const load = () => {
    setLoading(true)
    supabase.from(table).select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = data || []
        setItems(mergeSeeds ? mergeSeeds(rows) : rows)
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    const empty = {}
    fields.forEach(f => empty[f] = '')
    extraFields.forEach(f => empty[f.key] = f.default ?? '')
    if (imageField) empty[imageField] = ''
    if (beforeAfter) { empty.before_image = ''; empty.after_image = '' }
    if (showPrivateContent) empty.content_private = ''
    setForm(empty); setEditing(null); setPendingFiles({}); setModal(true)
  }

  const openEdit = (item) => {
    setForm({ ...item })
    setEditing(item.id)
    setPendingFiles({})
    setModal(true)
  }

  const queueFile = (key, file) => {
    if (!file) return
    setPendingFiles(prev => ({ ...prev, [key]: file }))
    setForm(prev => {
      const next = { ...prev, [key]: URL.createObjectURL(file) }
      if (key === 'after_image') next.image_url = next.after_image
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form }
      if (table === 'blog_posts') {
        if (!editing) payload.slug = slugify(form.title)
        else if (form.slug) payload.slug = slugify(form.slug)
      }

      for (const [key, file] of Object.entries(pendingFiles)) {
        if (bucket) payload[key] = await uploadContentImage(file, bucket)
      }

      const seedEdit = editing && isSeedId(editing)
      let dbPayload = toDbPayload(payload, {
        seedKey: seedEdit ? (getSeedKey(form) || editing) : undefined,
      })
      if (beforeAfter) dbPayload = syncStoryImageFields(dbPayload)

      const { error } = seedEdit
        ? await supabase.from(table).insert(dbPayload)
        : editing
          ? await supabase.from(table).update(dbPayload).eq('id', editing)
          : await supabase.from(table).insert(dbPayload)

      if (error) toast.error(error.message)
      else {
        toast.success(seedEdit ? 'Saved to website — you can edit this anytime' : 'Saved')
        setModal(false)
        load()
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    }
    setSaving(false)
  }

  const itemLabel = (item) => item.title || item.author_name || 'Untitled'

  const handleImportSeed = async () => {
    if (!importSeed) return
    setImporting(true)
    try {
      const result = await importSeed(supabase)
      if (result.errors?.length) toast.error(result.errors[0])
      else if (result.inserted === 0) toast.success('All starter content is already in the database')
      else toast.success(`Imported ${result.inserted} item(s) — edit prices, images & publish anytime`)
      load()
    } catch (err) {
      toast.error(err.message || 'Import failed')
    }
    setImporting(false)
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(true)
    try {
      if (isSeedId(deleteItem.id)) {
        const { error } = await supabase.from(table).insert(toDbPayload({
          slug: deleteItem.slug || slugify(deleteItem.title),
          title: deleteItem.title,
          excerpt: deleteItem.excerpt || '',
          content: deleteItem.content || '',
          category: deleteItem.category || '',
          is_published: false,
          featured: false,
        }))
        if (error) throw error
        toast.success('Removed from website')
      } else {
        const { error } = await supabase.from(table).delete().eq('id', deleteItem.id)
        if (error) throw error
        toast.success('Deleted permanently')
      }
      setDeleteItem(null)
      load()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
    setDeleting(false)
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted mt-2 max-w-2xl">{subtitle}</p>}
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mb-6">
        {importSeed && (
          <Button variant="outline" onClick={handleImportSeed} loading={importing}>
            <Download className="w-4 h-4" /> {importSeedLabel}
          </Button>
        )}
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add New</Button>
      </div>
      <div className="space-y-3">
        {items.length === 0 && (
          <Card className="p-8 text-center text-text-muted text-sm">Nothing on the website in this section yet. Add your first entry above.</Card>
        )}
        {items.map(item => (
          <Card key={item.id} className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {beforeAfter ? (() => {
                const { before, after } = getStoryBeforeAfter(item)
                if (!before && !after) return null
                return (
                  <div className="flex gap-1 shrink-0">
                    {before && (
                      <img src={before} alt="Before" className="h-12 w-12 rounded-lg object-cover border border-gray-100" />
                    )}
                    {after && (
                      <img src={after} alt="After" className="h-12 w-12 rounded-lg object-cover border border-gray-100" />
                    )}
                  </div>
                )
              })() : getReviewImage(item) ? (
                <img
                  src={getReviewImage(item)}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover shrink-0 border border-gray-100"
                />
              ) : null}
              <div className="min-w-0">
                <p className="font-medium text-text truncate">{itemLabel(item)}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.is_seed && (
                    <Badge status="pending">Live on website</Badge>
                  )}
                  {item.is_published !== undefined && (
                    <Badge status={item.is_published ? 'approved' : 'pending'}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  )}
                  {item.is_approved !== undefined && (
                    <Badge status={item.is_approved ? 'approved' : 'pending'}>
                      {item.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  )}
                  {item.is_public !== undefined && item.is_public && (
                    <Badge status="approved">Public site</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                <Pencil className="w-3 h-3" /> Edit
              </Button>
              {allowDelete && (
                <Button size="sm" variant="danger" onClick={() => setDeleteItem(item)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? (form.is_seed ? 'Edit live website content' : 'Edit') : 'Create'}
        footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        <div className="space-y-4">
          {fields.includes('title') && (
            <Input label="Title" required value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
          )}
          {fields.includes('slug') && (
            <Input label="Slug" value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} />
          )}
          {fields.includes('excerpt') && (
            <Input label="Excerpt" value={form.excerpt || ''} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
          )}
          {fields.includes('category') && (
            <Input label="Category" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} />
          )}
          {fields.includes('author_name') && (
            <Input label="Author Name" value={form.author_name || ''} onChange={e => setForm({ ...form, author_name: e.target.value })} />
          )}
          {fields.includes('content') && (
            <Textarea label="Public website content (HTML supported)" rows={contentRows} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} />
          )}
          {showPrivateContent && (
            <Textarea label="Private shop version (optional — more detail for registered customers)" rows={4} value={form.content_private || ''} onChange={e => setForm({ ...form, content_private: e.target.value })} />
          )}
          {fields.includes('rating') && (
            <Input label="Rating (1-5)" type="number" min="1" max="5" value={form.rating || ''} onChange={e => setForm({ ...form, rating: parseInt(e.target.value) })} />
          )}
          {imageField && (
            <ImageField
              label="Photo"
              value={form[imageField]}
              onChange={v => setForm({ ...form, [imageField]: v })}
              onFile={f => queueFile(imageField, f)}
            />
          )}
          {beforeAfter && (
            <>
              <ImageField
                label="Before photo"
                value={form.before_image}
                onChange={v => setForm({ ...form, before_image: v })}
                onFile={f => queueFile('before_image', f)}
              />
              <ImageField
                label="After photo"
                value={form.after_image}
                onChange={v => setForm({ ...form, after_image: v })}
                onFile={f => queueFile('after_image', f)}
              />
            </>
          )}
          {extraFields.map(f => (
            <label key={f.key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })} className="rounded" />
              {f.label}
            </label>
          ))}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this item?"
        message={deleteItem?.is_seed
          ? 'This will remove it from the public website. You can restore it later by deleting the hidden copy in this list.'
          : 'This permanently deletes the item from your website. This cannot be undone.'}
        confirmText="Delete"
      />
    </div>
  )
}

export function AdminBlog() {
  return (
    <ContentManager
      table="blog_posts"
      title="Blog"
      subtitle="Edit, replace, publish or delete every blog article one by one — title, excerpt, full content, category, photo and URL slug. Starter articles are live until you change them."
      fields={['title', 'slug', 'excerpt', 'content', 'category']}
      imageField="image_url"
      mergeSeeds={(rows) => mergeSeedBlogPosts(rows)}
      importSeed={importSeedBlogPosts}
      importSeedLabel="Import 6 months of starter blog"
      allowDelete
      contentRows={14}
      extraFields={[
        { key: 'is_published', label: 'Published on website', default: true },
        { key: 'featured', label: 'Featured on homepage', default: false },
      ]}
    />
  )
}

export function AdminReviews() {
  return (
    <ContentManager
      table="reviews"
      title="Reviews"
      subtitle="Everything shown on your public reviews page appears here. Edit any review or add new ones."
      fields={['author_name', 'content', 'rating']}
      imageField="image_url"
      mergeSeeds={(rows) => mergeSeedReviews(rows)}
      showPrivateContent
      extraFields={[
        { key: 'is_approved', label: 'Approved', default: false },
        { key: 'is_public', label: 'Show on public website', default: false },
      ]}
    />
  )
}

export function AdminSuccessStories() {
  return (
    <ContentManager
      table="success_stories"
      title="Success stories & before/after"
      subtitle="Before & after photos and stories from your website. Edit what visitors see or add new transformations."
      fields={['title', 'author_name', 'excerpt', 'content']}
      beforeAfter
      mergeSeeds={(rows) => mergeSeedStories(rows)}
      showPrivateContent
      extraFields={[
        { key: 'is_approved', label: 'Approved', default: false },
        { key: 'is_public', label: 'Show on public website', default: false },
      ]}
    />
  )
}

export function AdminAftercare() {
  return (
    <ContentManager
      table="aftercare_posts"
      title="Aftercare"
      subtitle="Guides for customers. Publish and choose public website or shop-only."
      fields={['title', 'content', 'category']}
      extraFields={[
        { key: 'is_published', label: 'Published', default: false },
        { key: 'is_public', label: 'Show on public website', default: false },
      ]}
    />
  )
}

export function AdminSettings() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-8">Settings</h1>
      <Card className="p-6">
        <p className="text-text-muted text-sm">
          Brand settings (business name, colours, contact details) are managed in{' '}
          <code className="bg-gray-100 px-1 rounded">src/config/brand.js</code>.
          Ask your developer to update those, or use Website management for blog, reviews, and photos.
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
      <h1 className="text-2xl font-bold text-text mb-2">Legal pages</h1>
      <p className="text-sm text-text-muted mb-8 max-w-2xl">
        Privacy policy, terms, and other compliance pages on your public website.
      </p>
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
