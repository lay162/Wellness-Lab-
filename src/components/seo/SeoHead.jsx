import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import brand from '../../config/brand'
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  GLOBAL_KEYWORDS,
  seoForPath,
  resolveSeoKey,
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
} from '../../config/seo'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(id, data) {
  if (!data) return
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export default function SeoHead({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  keywords,
  noindex = false,
  jsonLd,
}) {
  const location = useLocation()
  const pathname = path ?? location.pathname
  const defaults = seoForPath(resolveSeoKey(pathname))

  const pageTitle = title || defaults.title
  const pageDesc = description || defaults.description
  const pageKeywords = keywords || defaults.keywords || GLOBAL_KEYWORDS
  const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`
  const ogImage = image?.startsWith('http') ? image : `${SITE_URL}${image || brand.logo}`

  useEffect(() => {
    document.title = pageTitle

    upsertMeta('name', 'description', pageDesc)
    upsertMeta('name', 'keywords', pageKeywords)
    upsertMeta('name', 'author', brand.name)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    upsertMeta('name', 'geo.region', 'GB')
    upsertMeta('name', 'geo.placename', 'United Kingdom')
    upsertMeta('name', 'language', 'English')

    upsertLink('canonical', canonical)

    upsertMeta('property', 'og:site_name', brand.name)
    upsertMeta('property', 'og:title', pageTitle)
    upsertMeta('property', 'og:description', pageDesc)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:image:width', '1200')
    upsertMeta('property', 'og:image:height', '630')
    upsertMeta('property', 'og:locale', 'en_GB')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', pageTitle)
    upsertMeta('name', 'twitter:description', pageDesc)
    upsertMeta('name', 'twitter:image', ogImage)

    upsertMeta('name', 'apple-mobile-web-app-title', brand.name)
    upsertLink('apple-touch-icon', `${SITE_URL}${brand.appleTouchIcon || brand.appIcon192}`)

    upsertJsonLd('seo-jsonld-page', jsonLd)
  }, [pageTitle, pageDesc, pageKeywords, canonical, ogImage, type, noindex, jsonLd])

  return null
}

export function GlobalStructuredData() {
  useEffect(() => {
    upsertJsonLd('seo-jsonld-org', organizationSchema())
    upsertJsonLd('seo-jsonld-local', localBusinessSchema())
    upsertJsonLd('seo-jsonld-site', websiteSchema())
  }, [])
  return null
}
