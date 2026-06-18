// Portal catalogue seed — from Wellness Lab peptide cheat sheet.
// Shown when Supabase has no products. Replace via admin once live inventory is set.
import productImage from '../assets/portal/retatrutide-30mg.png'

function product({ id, name, category, benefits, delivery, sku, image_url = null }) {
  const benefitText = benefits.join(', ')
  return {
    id,
    name,
    category,
    benefits,
    delivery,
    sku,
    description: `${benefitText}. Available formats: ${delivery.join(', ')}. For research and educational purposes only.`,
    price: 0,
    price_on_enquiry: true,
    stock: 50,
    is_active: true,
    is_seed: true,
    image_url,
  }
}

export const SEED_PRODUCTS = [
  product({
    id: 'seed-glp1-glp1-gip',
    name: 'GLP-1 & GLP-1/GIP',
    category: 'Metabolic',
    benefits: ['Weight Loss', 'Inflammation', 'Longevity', 'Blood Sugar Control'],
    delivery: ['Injectable', 'Spray'],
    sku: 'WL-GLP1',
    image_url: productImage,
  }),
  product({
    id: 'seed-sermorelin',
    name: 'Sermorelin',
    category: 'Hormone & Growth',
    benefits: ['Sleep Improvement', 'Muscle Support', 'Hormone Balance', 'Energy Boost'],
    delivery: ['Injectable', 'Oral (Capsules)'],
    sku: 'WL-SER',
  }),
  product({
    id: 'seed-glutathione',
    name: 'Glutathione',
    category: 'Immune Support',
    benefits: ['Reduced Inflammation', 'Skin, Nails & Hair Health', 'Cellular Repair', 'Immune Support'],
    delivery: ['Injectable'],
    sku: 'WL-GLU',
  }),
  product({
    id: 'seed-bpc157-tb500',
    name: 'BPC157 / TB500',
    category: 'Recovery & Repair',
    benefits: ['Repair and Recovery', 'Gut Health', 'Performance Optimisation', 'Joint Health'],
    delivery: ['Injectable', 'Oral (Capsules)'],
    sku: 'WL-BPC-TB',
  }),
  product({
    id: 'seed-ghk-cu',
    name: 'GHK-CU',
    category: 'Anti-Aging & Beauty',
    benefits: ['Skin, Nails & Hair Health', 'Reduced Inflammation', 'Anti-Aging'],
    delivery: ['Injectable'],
    sku: 'WL-GHK',
  }),
  product({
    id: 'seed-methylene-blue',
    name: 'Methylene Blue',
    category: 'Cognitive',
    benefits: ['Cognitive Health', 'Oxidative Stress', 'Mitochondrial Function'],
    delivery: ['Oral (Capsules)'],
    sku: 'WL-MB',
  }),
  product({
    id: 'seed-mots-c',
    name: 'MOTS-C',
    category: 'Metabolic',
    benefits: ['Fat Loss', 'Mental Clarity', 'Mitochondrial Function', 'Blood Sugar Balance', 'Inflammation'],
    delivery: ['Injectable'],
    sku: 'WL-MOTS',
  }),
  product({
    id: 'seed-dsip',
    name: 'DSIP',
    category: 'Recovery & Repair',
    benefits: ['Sleep Quality', 'Reduce Stress & Cortisol', 'Recovery and Healing', 'Brain Health'],
    delivery: ['Injectable'],
    sku: 'WL-DSIP',
  }),
  product({
    id: 'seed-nad-plus',
    name: 'NAD+',
    category: 'Energy & Vitamins',
    benefits: ['Energy Boost', 'Cellular Repair', 'Anti-Aging', 'Brain Health'],
    delivery: ['Injectable', 'Spray'],
    sku: 'WL-NAD',
  }),
  product({
    id: 'seed-tesamorelin-ipamorelin',
    name: 'Tesamorelin / Ipamorelin',
    category: 'Hormone & Growth',
    benefits: ['Fat Burning', 'Muscle Growth', 'Energy'],
    delivery: ['Injectable'],
    sku: 'WL-TESA-IPA',
  }),
  product({
    id: 'seed-synapsin',
    name: 'Synapsin',
    category: 'Cognitive',
    benefits: ['Cognitive Support', 'Mental Clarity', 'Memory Boost'],
    delivery: ['Spray'],
    sku: 'WL-SYN',
  }),
  product({
    id: 'seed-b12',
    name: 'B12',
    category: 'Energy & Vitamins',
    benefits: ['Energy Boost', 'Brain Health', 'Skin, Nails & Hair Health'],
    delivery: ['Injectable'],
    sku: 'WL-B12',
  }),
  product({
    id: 'seed-pt-141',
    name: 'PT-141 (Thrill Pill / Elate Spray)',
    category: 'Intimacy & Wellness',
    benefits: ['Enhanced Libido', 'Improved Intimacy', 'Improved Blood Flow'],
    delivery: ['Spray', 'Oral (Thrill Pill)'],
    sku: 'WL-PT141',
  }),
  product({
    id: 'seed-thymosin-alpha-1',
    name: 'Thymosin Alpha 1',
    category: 'Immune Support',
    benefits: ['Immune System', 'Cellular Recovery', 'Inflammatory Balance'],
    delivery: ['Injectable'],
    sku: 'WL-TA1',
  }),
  product({
    id: 'seed-luminate-skin',
    name: 'Luminate Skin (Serum)',
    category: 'Anti-Aging & Beauty',
    benefits: ['Biotin', 'GHK-Cu', 'NAD', 'Anti-Aging', 'Brightening / Discolouration'],
    delivery: ['Topical (Serum)'],
    sku: 'WL-LUM',
  }),
  product({
    id: 'seed-liporelin-kpv',
    name: 'Liporelin / KPV',
    category: 'Metabolic',
    benefits: ['Burn Visceral Fat', 'Body Composition', 'Inflammation', 'Gut Health', 'Cognitive Function'],
    delivery: ['Injectable'],
    sku: 'WL-LIPO-KPV',
  }),
]

export function mergeSeedProducts(products) {
  if (products.length > 0) return products
  return SEED_PRODUCTS
}

export function getSeedProduct(id) {
  return SEED_PRODUCTS.find(p => p.id === id) ?? null
}

export function isSeedProduct(id) {
  return SEED_PRODUCTS.some(p => p.id === id)
}
