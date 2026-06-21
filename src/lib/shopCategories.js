import { SEED_PRODUCTS } from '../data/seedProducts'

/** Categories from the Wellness Lab peptide cheat sheet only */
export const SHOP_CATEGORIES = [...new Set(
  SEED_PRODUCTS.map(p => p.category).filter(Boolean),
)].sort((a, b) => a.localeCompare(b))

/** Category chips on the shop — only categories that have products */
export function collectProductCategories(products) {
  return [...new Set((products || []).map(p => p.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
}

/** Admin dropdown: cheat sheet categories + any custom ones already saved */
export function adminCategoryOptions(products = []) {
  const saved = (products || []).map(p => p.category).filter(Boolean)
  return [...new Set([...SHOP_CATEGORIES, ...saved])].sort((a, b) => a.localeCompare(b))
}

export function productMatchesCategory(product, category) {
  if (!category || category === 'all') return true
  return product.category?.toLowerCase() === category.toLowerCase()
}
