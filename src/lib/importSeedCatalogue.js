import { SEED_PRODUCTS } from '../data/seedProducts'
import { saveShopProduct } from './products'

/** One-click: copy starter catalogue into admin so Chan/Jordan can add prices & images — no SQL */
export async function importSeedCatalogueToShop(supabase) {
  const { data: existing } = await supabase.from('products').select('sku, name')
  const existingSkus = new Set((existing || []).map(r => r.sku).filter(Boolean))
  const existingNames = new Set((existing || []).map(r => r.name?.trim().toLowerCase()))

  let inserted = 0
  const errors = []

  for (const seed of SEED_PRODUCTS) {
    if (existingSkus.has(seed.sku) || existingNames.has(seed.name.trim().toLowerCase())) {
      continue
    }

    const payload = {
      name: seed.name,
      description: seed.description,
      price: 0,
      price_on_enquiry: true,
      stock: seed.stock ?? 50,
      category: seed.category,
      sku: seed.sku,
      is_active: true,
      ...(seed.image_url && { image_url: seed.image_url }),
    }

    const { error } = await saveShopProduct(supabase, payload)
    if (error) errors.push(`${seed.name}: ${error.message}`)
    else inserted += 1
  }

  return { inserted, errors }
}
