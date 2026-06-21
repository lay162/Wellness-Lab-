/** Stock images per category — used when a post has no uploaded image_url */
const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`

export const BLOG_CATEGORY_IMAGES = {
  Metabolic: [
    unsplash('photo-1571019613454-1cb2f99b2d8b'),
    unsplash('photo-1517836357463-d25dfeac3438'),
    unsplash('photo-1434682881908-98d935435544'),
    unsplash('photo-1518611012118-696072aa579a'),
  ],
  'Hormone & Growth': [
    unsplash('photo-1541781774450-f8714da06626'),
    unsplash('photo-1520206183501-b80df61043b2'),
    unsplash('photo-1507652315927-9752f6d4f168'),
  ],
  'Immune Support': [
    unsplash('photo-1490645935967-10de6ba17061'),
    unsplash('photo-1512621776951-a57141f2eefd'),
    unsplash('photo-1498837167922-ddd27525cd3d'),
  ],
  'Recovery & Repair': [
    unsplash('photo-1574680096145-d05b474e215a'),
    unsplash('photo-1593079831268-3381b7451244'),
    unsplash('photo-1571902943202-507ec2618e8f'),
  ],
  'Anti-Aging & Beauty': [
    unsplash('photo-1515377905703-c4789e51fe15'),
    unsplash('photo-1570172619644-dfd955edae00'),
    unsplash('photo-1522335789203-aabd1fc54bc9'),
  ],
  Cognitive: [
    unsplash('photo-1456513080510-7bf93a544d72'),
    unsplash('photo-1434030216411-0b793f4b4173'),
    unsplash('photo-1481627834876-b7833e8f5570'),
  ],
  'Energy & Vitamins': [
    unsplash('photo-1556228578-0d85b1a4d571'),
    unsplash('photo-1584308666744-24d5c474f2ae'),
    unsplash('photo-1505576399279-585b658594a0'),
  ],
  'Intimacy & Wellness': [
    unsplash('photo-1544025162-d76694265947'),
    unsplash('photo-1516589178581-6cd7833ae3b2'),
  ],
  'Wellness Business': [
    unsplash('photo-1534438327276-14e5300c3a48'),
    unsplash('photo-1556761175-b413da4baf72'),
  ],
  Education: [
    unsplash('photo-1456324504434-12a787672284'),
    unsplash('photo-1523240795612-220785407988'),
  ],
  Compliance: [
    unsplash('photo-1450101499163-c8848c66ca85'),
    unsplash('photo-1589829545855-d10d557cf95f'),
  ],
  'Getting Started': [
    unsplash('photo-1476480862126-209bfaa8edc4'),
    unsplash('photo-1506126613408-eca07ce68773'),
  ],
  Shop: [
    unsplash('photo-1607083206869-9c2748b4e23e'),
    unsplash('photo-1556742049-0cfed4f6a45d'),
  ],
  default: [
    unsplash('photo-1505751172876-fa1923c5c528'),
    unsplash('photo-1544367567-0f2fcb009e0b'),
  ],
}

function slugIndex(slug) {
  if (!slug) return 0
  return [...slug].reduce((sum, c) => sum + c.charCodeAt(0), 0)
}

/** Resolve the best image for a blog post (uploaded URL or category stock photo). */
export function getBlogImageUrl(post, index) {
  if (post?.image_url) return post.image_url
  const pool = BLOG_CATEGORY_IMAGES[post?.category] || BLOG_CATEGORY_IMAGES.default
  const idx = index ?? slugIndex(post?.slug)
  return pool[idx % pool.length]
}
