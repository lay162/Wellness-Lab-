import { useEffect, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { Leaf } from 'lucide-react'
import { supabase, isSupabaseConfigured } from './supabase'
import { SEED_SITE_PAGES, SEED_SITE_CARDS, SEED_FAQS } from '../data/seedSiteContent'
import { getSeedKey, toDbPayload, isSeedId } from './websiteContent'

export function getLucideIcon(name, fallback = Leaf) {
  if (!name) return fallback
  return LucideIcons[name] || fallback
}

export function mergeSeedCards(dbCards, pageKey, cardGroup = null) {
  const db = (dbCards || []).filter(c => c.page_key === pageKey)
  let seeds = SEED_SITE_CARDS.filter(c => c.page_key === pageKey)
  if (cardGroup) seeds = seeds.filter(c => c.card_group === cardGroup)

  const imported = new Set(db.map(getSeedKey).filter(Boolean))
  const fromSeeds = seeds
    .filter(s => !imported.has(s.id))
    .map(s => ({ ...s, seed_key: s.id, is_seed: true }))

  const merged = [...db.map(c => ({ ...c, is_seed: false })), ...fromSeeds]
    .filter(c => !cardGroup || c.card_group === cardGroup)
    .filter(c => c.is_published !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  return merged
}

export function mergeSeedFaqs(dbFaqs) {
  const db = dbFaqs || []
  const imported = new Set(db.map(getSeedKey).filter(Boolean))
  const fromSeeds = SEED_FAQS
    .filter(s => !imported.has(s.id))
    .map(s => ({ ...s, seed_key: s.id, is_seed: true }))

  return [...db.map(f => ({ ...f, is_seed: false })), ...fromSeeds]
    .filter(f => f.is_published !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
}

export function getSeedPage(pageKey) {
  return SEED_SITE_PAGES[pageKey] || { page_key: pageKey }
}

export function resolvePageMeta(dbRow, pageKey) {
  const seed = getSeedPage(pageKey)
  if (!dbRow) return seed
  return {
    ...seed,
    ...Object.fromEntries(
      Object.entries(dbRow).filter(([, v]) => v != null && v !== '')
    ),
  }
}

export function usePageContent(pageKey, { cardGroup = null } = {}) {
  const seed = getSeedPage(pageKey)
  const [meta, setMeta] = useState(seed)
  const [cards, setCards] = useState(() => mergeSeedCards([], pageKey, cardGroup))
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCards(mergeSeedCards([], pageKey, cardGroup))
      setLoading(false)
      return
    }

    async function load() {
      const [pageRes, cardsRes] = await Promise.all([
        supabase.from('site_pages').select('*').eq('page_key', pageKey).maybeSingle(),
        supabase.from('site_cards').select('*').eq('page_key', pageKey).order('sort_order'),
      ])
      setMeta(resolvePageMeta(pageRes.data, pageKey))
      setCards(mergeSeedCards(cardsRes.data || [], pageKey, cardGroup))
      setLoading(false)
    }
    load()
  }, [pageKey, cardGroup])

  return { meta, cards, loading }
}

export function useAllPageCards(pageKey) {
  const [groups, setGroups] = useState({})
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const merged = mergeSeedCards([], pageKey)
      setGroups(merged.reduce((acc, c) => {
        if (!acc[c.card_group]) acc[c.card_group] = []
        acc[c.card_group].push(c)
        return acc
      }, {}))
      setLoading(false)
      return
    }

    supabase.from('site_cards').select('*').eq('page_key', pageKey).order('sort_order')
      .then(({ data }) => {
        const merged = mergeSeedCards(data || [], pageKey)
        setGroups(merged.reduce((acc, c) => {
          if (!acc[c.card_group]) acc[c.card_group] = []
          acc[c.card_group].push(c)
          return acc
        }, {}))
        setLoading(false)
      })
  }, [pageKey])

  return { groups, loading }
}

export function useFaqs() {
  const [faqs, setFaqs] = useState(() => mergeSeedFaqs([]))
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setFaqs(mergeSeedFaqs([]))
      setLoading(false)
      return
    }
    supabase.from('faqs').select('*').order('sort_order')
      .then(({ data }) => { setFaqs(mergeSeedFaqs(data || [])); setLoading(false) })
  }, [])

  return { faqs, loading }
}

export function cardToDbPayload(form, { seedKey } = {}) {
  const payload = toDbPayload(form, { seedKey })
  if (!payload.page_key) delete payload.page_key
  return payload
}

export function faqToDbPayload(form, { seedKey } = {}) {
  return toDbPayload(form, { seedKey })
}

export const PAGE_EDITOR_CONFIG = [
  { key: 'home', label: 'Homepage', hasCards: true, cardGroups: ['features', 'trust'], fields: ['badge_text', 'hero_title', 'hero_subtitle', 'section_title', 'section_subtitle', 'extra_title', 'extra_subtitle', 'cta_title', 'cta_subtitle'] },
  { key: 'about', label: 'About', hasCards: true, cardGroups: ['values'], fields: ['hero_title', 'hero_subtitle', 'section_title', 'body_html'] },
  { key: 'wellness', label: 'Wellness', hasCards: true, cardGroups: ['topics'], fields: ['hero_title', 'hero_subtitle', 'note_html'] },
  { key: 'how-it-works', label: 'How It Works', hasCards: true, cardGroups: ['steps'], fields: ['hero_title', 'hero_subtitle'] },
  { key: 'contact', label: 'Contact', hasCards: false, fields: ['hero_title', 'hero_subtitle'] },
  { key: 'blog', label: 'Blog page', hasCards: false, fields: ['hero_title', 'hero_subtitle'], hint: 'Blog articles are managed under Blog.' },
  { key: 'aftercare', label: 'Aftercare page', hasCards: false, fields: ['hero_title', 'hero_subtitle', 'note_html'], hint: 'Aftercare guides are managed under Aftercare.' },
]

export const CARD_GROUP_LABELS = {
  features: 'Feature cards',
  trust: 'Trust badges',
  values: 'Mission / vision / values',
  steps: 'Process steps',
  topics: 'Topic cards',
}
