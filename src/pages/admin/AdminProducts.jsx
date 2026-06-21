import { useEffect, useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { Textarea } from '../../components/ui/Input'
import Modal, { ConfirmModal } from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatProductPrice } from '../../lib/utils'
import { SHOP_CATEGORIES } from '../../lib/shopCategories'
import { saveShopProduct, mergeSeedProducts, isSeedProduct } from '../../lib/products'
import { SEED_PRODUCTS } from '../../data/seedProducts'
import { importSeedCatalogueToShop } from '../../lib/importSeedCatalogue'
import { PageLoader } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const empty = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  category: '',
  sku: '',
  is_active: true,
  price_on_enquiry: false,
}

export default function AdminProducts() {
  const [products, setProducts] = useState(() => mergeSeedProducts([], { forAdmin: true }))
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [customCategory, setCustomCategory] = useState('')
  const [importing, setImporting] = useState(false)

  const load = () => {
    setLoading(true)
    supabase.from('products').select('*').order('name')
      .then(({ data }) => {
        setProducts(mergeSeedProducts(data || [], { forAdmin: true }))
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  const categoriesInUse = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [products])

  const filteredProducts = filterCategory === 'all'
    ? products
    : products.filter(p => p.category === filterCategory)

  const openCreate = () => {
    setForm(empty)
    setEditing(null)
    setImageFile(null)
    setCustomCategory('')
    setModal(true)
  }

  const openEdit = (p) => {
    const isCustom = p.category && !SHOP_CATEGORIES.includes(p.category)
    setForm({
      ...p,
      price: p.price_on_enquiry ? '' : String(p.price ?? ''),
      stock: String(p.stock ?? 0),
      price_on_enquiry: !!p.price_on_enquiry,
      category: isCustom ? '' : (p.category || ''),
    })
    setCustomCategory(isCustom ? p.category : '')
    setEditing(p.id)
    setImageFile(null)
    setModal(true)
  }

  const previewImage = imageFile
    ? URL.createObjectURL(imageFile)
    : form.image_url || null

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Product name is required')
      return
    }
    if (!form.price_on_enquiry && (!form.price || parseFloat(form.price) <= 0)) {
      toast.error('Enter a price or tick “Price on enquiry”')
      return
    }

    setSaving(true)
    try {
      let image_url = form.image_url || null
      if (imageFile) image_url = await uploadImage(imageFile)

      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        price: form.price_on_enquiry ? 0 : parseFloat(form.price),
        price_on_enquiry: !!form.price_on_enquiry,
        stock: parseInt(form.stock, 10) || 0,
        category: (customCategory.trim() || form.category?.trim()) || null,
        sku: form.sku?.trim() || null,
        is_active: !!form.is_active,
        ...(image_url && { image_url }),
      }

      const seedEdit = editing && isSeedProduct(editing)
      const { error } = await saveShopProduct(supabase, payload, seedEdit ? null : editing)

      if (error) throw error
      toast.success(seedEdit ? 'Saved — price & image now live in shop' : editing ? 'Product updated' : 'Product added to shop')
      setModal(false)
      load()
    } catch (e) {
      toast.error(e.message)
    }
    setSaving(false)
  }

  const deactivate = async (product) => {
    if (isSeedProduct(product.id)) {
      const { error } = await saveShopProduct(supabase, {
        name: product.name,
        description: product.description || null,
        sku: product.sku || null,
        category: product.category || null,
        price: 0,
        price_on_enquiry: true,
        stock: 0,
        is_active: false,
        ...(product.image_url && { image_url: product.image_url }),
      })
      if (error) {
        toast.error(error.message)
        return
      }
    } else {
      await supabase.from('products').update({ is_active: false }).eq('id', product.id)
    }
    toast.success('Product removed from shop')
    load()
    setDeleteId(null)
  }

  const handleImportCatalogue = async () => {
    setImporting(true)
    try {
      const result = await importSeedCatalogueToShop(supabase)
      if (result.errors.length) toast.error(result.errors[0])
      else if (result.inserted === 0) toast.success('Starter catalogue already in shop — edit any item to add prices & images')
      else toast.success(`Added ${result.inserted} starter product(s) — set prices and upload images when ready`)
      load()
    } catch (e) {
      toast.error(e.message)
    }
    setImporting(false)
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Shop products</h1>
          <p className="text-sm text-text-muted mt-2 max-w-2xl">
            All {SEED_PRODUCTS.length} cheat-sheet products are listed below — same as the shop. Tap <strong>Edit</strong> on any item to add your price and image.
            Add extra products anytime, or use import to copy everything into the database in one go.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button variant="outline" onClick={handleImportCatalogue} loading={importing}>
            <Download className="w-4 h-4" /> Add starter catalogue
          </Button>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add product</Button>
        </div>
      </div>

      {categoriesInUse.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterCategory === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'
            }`}
          >
            All ({products.length})
          </button>
          {categoriesInUse.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCategory(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterCategory === c ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:bg-gray-200'
              }`}
            >
              {c} ({products.filter(p => p.category === c).length})
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-text-muted mb-4">No products match this filter.</p>
          <Button variant="outline" onClick={() => setFilterCategory('all')}>Show all</Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(p => (
            <Card key={p.id} className="overflow-hidden">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="w-full h-36 object-contain bg-white p-2" />
              ) : (
                <div className="w-full h-36 bg-accent flex items-center justify-center text-primary text-3xl font-bold">
                  {p.name.charAt(0)}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {p.category && (
                      <span className="text-xs font-medium text-primary uppercase">{p.category}</span>
                    )}
                    <p className="font-medium text-text truncate">{p.name}</p>
                    <p className="text-primary font-bold mt-1">{formatProductPrice(p)}</p>
                    <p className="text-xs text-text-muted mt-1">Stock: {p.stock}</p>
                    {p.sku && <p className="text-xs text-text-muted">SKU: {p.sku}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {p.is_seed && (
                      <Badge status="pending">Set price</Badge>
                    )}
                    <Badge status={p.is_active ? 'approved' : 'rejected'}>
                      {p.is_active ? 'Live' : 'Hidden'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  {p.is_active && (
                    <Button size="sm" variant="danger" onClick={() => setDeleteId(p)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? (isSeedProduct(editing) ? 'Add price & details' : 'Edit product') : 'Add product'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Product name"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Description"
            rows={3}
            value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Category</label>
            <select
              value={form.category || ''}
              onChange={e => {
                setForm({ ...form, category: e.target.value })
                if (e.target.value) setCustomCategory('')
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm bg-white"
            >
              <option value="">Select from cheat sheet…</option>
              {SHOP_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Input
              label="Or add a custom category"
              className="mt-3"
              placeholder="Only if not listed above"
              value={customCategory}
              onChange={e => {
                setCustomCategory(e.target.value)
                if (e.target.value) setForm({ ...form, category: '' })
              }}
            />
            <p className="text-xs text-text-muted mt-1.5">
              Default categories come from your peptide cheat sheet. Custom categories appear in the shop once a product uses them.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (£)"
              type="number"
              step="0.01"
              min="0"
              disabled={form.price_on_enquiry}
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.price_on_enquiry}
              onChange={e => setForm({ ...form, price_on_enquiry: e.target.checked, price: e.target.checked ? '' : form.price })}
              className="rounded"
            />
            Price on enquiry (hide fixed price on shop)
          </label>

          {!form.price_on_enquiry && form.price && (
            <p className="text-xs text-text-muted">
              Customers will see: <strong className="text-primary">{formatCurrency(parseFloat(form.price))}</strong>
            </p>
          )}

          <Input
            label="SKU (optional)"
            value={form.sku || ''}
            onChange={e => setForm({ ...form, sku: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Product image</label>
            {previewImage && (
              <img src={previewImage} alt="" className="h-28 w-full max-w-xs object-contain rounded-xl border border-gray-100 bg-white mb-3 p-2" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={e => setImageFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
              className="rounded"
            />
            Show in shop (active)
          </label>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deactivate(deleteId)}
        title="Remove from shop"
        message="This product will be hidden from the shop. You can re-activate it by editing the product."
        confirmText="Hide product"
      />
    </div>
  )
}
