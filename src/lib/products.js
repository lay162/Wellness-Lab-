import { SEED_PRODUCTS, getSeedProduct, isSeedProduct } from '../data/seedProducts'

export { getSeedProduct, isSeedProduct }

/** Coerce Supabase DECIMAL / form values into a consistent product shape */
export function normalizeProduct(product) {
  if (!product) return product
  const price = Number(product.price)
  const hasPrice = Number.isFinite(price) && price > 0
  // Works even if price_on_enquiry column was never added in Supabase
  const priceOnEnquiry = product.price_on_enquiry === true
    || (product.price_on_enquiry == null && !hasPrice && !product.is_seed)

  return {
    ...product,
    price: Number.isFinite(price) ? price : 0,
    price_on_enquiry: priceOnEnquiry,
  }
}

function productsMatch(seed, db) {
  if (seed.sku && db.sku && seed.sku === db.sku) return true
  return seed.name?.trim().toLowerCase() === db.name?.trim().toLowerCase()
}

/**
 * Cheat-sheet seeds stay visible until replaced.
 * When Chan/Jordan add a product in admin (same name or SKU), that live row wins — including price.
 */
export function mergeSeedProducts(dbProducts, { forAdmin = false } = {}) {
  const allDb = (dbProducts || []).map(normalizeProduct)

  const usedDbIds = new Set()
  const merged = SEED_PRODUCTS.map(seed => {
    const dbMatch = allDb.find(p => productsMatch(seed, p))
    if (dbMatch) {
      usedDbIds.add(dbMatch.id)
      if (!forAdmin && !dbMatch.is_active) return null
      return normalizeProduct({ ...seed, ...dbMatch, is_seed: false })
    }
    return normalizeProduct({ ...seed, is_seed: true })
  }).filter(Boolean)

  const extrasSource = forAdmin ? allDb : allDb.filter(p => p.is_active !== false)
  const extras = extrasSource
    .filter(p => !usedDbIds.has(p.id))
    .map(p => normalizeProduct({ ...p, is_seed: false }))

  return [...merged, ...extras]
}

/** If a seed item has been priced in admin, return that live row */
export async function resolveProduct(supabase, id) {
  if (!isSeedProduct(id)) {
    const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
    return data ? normalizeProduct(data) : null
  }

  const seed = getSeedProduct(id)
  if (!seed) return null

  if (seed.sku) {
    const { data: bySku } = await supabase.from('products').select('*').eq('is_active', true).eq('sku', seed.sku).maybeSingle()
    if (bySku) return normalizeProduct({ ...seed, ...bySku, is_seed: false })
  }

  const { data: rows } = await supabase.from('products').select('*').eq('is_active', true).ilike('name', seed.name)
  const byName = rows?.find(p => p.name?.trim().toLowerCase() === seed.name.trim().toLowerCase())
  if (byName) return normalizeProduct({ ...seed, ...byName, is_seed: false })

  return normalizeProduct(seed)
}

/** Save product from admin — retries without price_on_enquiry if column not in DB yet */
export async function saveShopProduct(supabase, payload, editingId = null) {
  const withFlag = { ...payload }
  if (payload.price_on_enquiry !== undefined) {
    withFlag.price_on_enquiry = !!payload.price_on_enquiry
  }

  let result = editingId
    ? await supabase.from('products').update(withFlag).eq('id', editingId)
    : await supabase.from('products').insert(withFlag)

  if (result.error && /price_on_enquiry/i.test(result.error.message)) {
    const { price_on_enquiry, ...fallback } = withFlag
    result = editingId
      ? await supabase.from('products').update(fallback).eq('id', editingId)
      : await supabase.from('products').insert(fallback)
  }

  return result
}
