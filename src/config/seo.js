import brand from './brand'
import { getBlogImageUrl } from '../lib/blogImages'

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://thewellnesslab.uk').replace(/\/$/, '')

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export const GLOBAL_KEYWORDS = [
  'Wellness Lab UK',
  'peptides UK',
  'research peptides United Kingdom',
  'GLP-1 UK',
  'sermorelin UK',
  'NAD+ peptide',
  'BPC-157',
  'TB-500 recovery',
  'gym wellness UK',
  'bodybuilding recovery peptides',
  'metabolic health peptides',
  'anti-aging peptides UK',
  'wellness shop UK',
  'peptide education',
  'longevity research UK',
  'injectable peptides',
  'sports recovery UK',
  'hormone support peptides',
  'immune support glutathione',
  'cognitive peptides UK',
].join(', ')

export const PAGE_SEO = {
  '/': {
    title: `${brand.name} | Peptides, Wellness & Research Shop UK`,
    description:
      'The Wellness Lab — UK peptide research, wellness education, and shop. GLP-1, sermorelin, NAD+, BPC-157, recovery support for gyms, athletes & wellness journeys nationwide.',
    keywords: 'wellness lab, peptides uk, glp-1 uk, gym wellness, bodybuilding recovery, peptide shop uk',
  },
  '/about': {
    title: `About ${brand.name} | UK Wellness & Peptide Research`,
    description: `Learn about ${brand.name} — trusted UK wellness education, peptide research resources, and compliant customer support nationwide.`,
  },
  '/wellness': {
    title: 'Wellness Education | Peptides, Metabolic & Recovery Research UK',
    description: 'Educational wellness guides on nutrition, recovery, metabolic health, and peptide research — for gyms, athletes and UK wellness journeys.',
  },
  '/shop': {
    title: 'Peptide Shop UK | GLP-1, Sermorelin, NAD+ & More | Wellness Lab',
    description: 'Browse the Wellness Lab shop — metabolic, recovery, cognitive, hormone & immune peptides. UK-wide. Create an account to order.',
  },
  '/blog': {
    title: 'Wellness & Peptide Research Blog UK | Wellness Lab',
    description: 'Expert wellness articles on GLP-1, recovery peptides, gym performance, bodybuilding support, NAD+, sleep, and UK peptide research.',
  },
  '/contact': {
    title: `Contact ${brand.name} | UK Wellness & Peptide Enquiries`,
    description: `Contact ${brand.name} — WhatsApp, email & enquiries. UK-wide wellness and peptide research support for gyms, athletes and individuals.`,
  },
  '/faqs': {
    title: 'FAQs | Wellness Lab UK Peptides & Wellness',
    description: 'Frequently asked questions about Wellness Lab services, peptide research, ordering, and UK-wide wellness support.',
  },
  '/how-it-works': {
    title: 'How It Works | Wellness Lab UK',
    description: 'How to get started with Wellness Lab — consultation, personalised wellness guidance, shop access, and ongoing UK support.',
  },
  '/success-stories': {
    title: 'Success Stories | Wellness Lab UK',
    description: 'Real wellness journeys and transformations from Wellness Lab clients across the United Kingdom.',
  },
  '/reviews': {
    title: 'Client Reviews | Wellness Lab UK',
    description: 'Read verified Wellness Lab client reviews — UK wellness, peptide research, and shop experiences.',
  },
  '/aftercare': {
    title: 'Aftercare Guidance | Wellness Lab UK',
    description: 'Aftercare and educational guidance for Wellness Lab clients — recovery, wellness protocols, and ongoing support.',
  },
  '/get-app': {
    title: `Download the ${brand.name} App | Shop & Account UK`,
    description: `Install the ${brand.name} PWA — shop peptides, manage your account, and access wellness content on any device in the UK.`,
  },
  '/businesscard': {
    title: `${brand.name} | Digital Business Card UK`,
    description: `Connect with ${brand.name} — WhatsApp, peptide shop, wellness research & UK-wide support. Save our digital business card.`,
  },
  '/privacy-policy': {
    title: `Privacy Policy | ${brand.name} UK`,
    description: `Privacy policy for ${brand.name} — how we handle your data for UK wellness and peptide research services.`,
  },
  '/terms-and-conditions': {
    title: `Terms & Conditions | ${brand.name} UK`,
    description: `Terms and conditions for using ${brand.name} website, shop and customer services in the United Kingdom.`,
  },
  '/cookies': {
    title: `Cookie Policy | ${brand.name} UK`,
    description: `How ${brand.name} uses cookies on thewellnesslab.uk and our customer app.`,
  },
  '/legal-disclaimer': {
    title: `Legal Disclaimer | ${brand.name} UK`,
    description: `Educational and research disclaimer for ${brand.name} peptide and wellness content.`,
  },
  '/compliance': {
    title: `Compliance | ${brand.name} UK`,
    description: `Compliance information for ${brand.name} UK wellness and research services.`,
  },
}

export function resolveSeoKey(pathname) {
  const path = pathname.split('?')[0]
  if (PAGE_SEO[path]) return path
  if (path.startsWith('/blog/')) return '/blog'
  if (path.startsWith('/shop')) return '/shop'
  return path
}

export function seoForPath(pathname) {
  const key = resolveSeoKey(pathname)
  const base = PAGE_SEO[key] || {}
  return {
    title: base.title || `${brand.name} | UK Wellness & Peptide Research`,
    description: base.description || brand.fullDescription,
    keywords: base.keywords || GLOBAL_KEYWORDS,
    path: pathname,
  }
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: SITE_URL,
    logo: `${SITE_URL}${brand.logo}`,
    description: brand.fullDescription,
    email: brand.contact.email,
    telephone: brand.contact.phone,
    sameAs: Object.values(brand.social).filter(Boolean),
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
  }
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: brand.name,
    url: SITE_URL,
    image: `${SITE_URL}${brand.logo}`,
    description: brand.fullDescription,
    telephone: brand.contact.phone,
    email: brand.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GB',
      addressLocality: 'United Kingdom',
    },
    areaServed: [
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'AdministrativeArea', name: 'England' },
      { '@type': 'AdministrativeArea', name: 'Scotland' },
      { '@type': 'AdministrativeArea', name: 'Wales' },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    priceRange: '££',
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function articleSchema(post) {
  const imageUrl = getBlogImageUrl(post)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Organization', name: brand.name },
    publisher: {
      '@type': 'Organization',
      name: brand.name,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}${brand.logo}` },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  }
}

export function productSchema(product) {
  const offer = {
    '@type': 'Offer',
    priceCurrency: 'GBP',
    availability: product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url: `${SITE_URL}/shop/product/${product.id}`,
  }
  if (!product.price_on_enquiry && product.price > 0) {
    offer.price = product.price
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url || `${SITE_URL}${brand.logo}`,
    sku: product.sku,
    category: product.category,
    brand: { '@type': 'Brand', name: brand.name },
    offers: offer,
  }
}
