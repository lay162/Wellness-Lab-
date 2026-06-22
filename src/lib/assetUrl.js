/** Prefix public-folder paths with Vite base (e.g. /Wellness-Lab-/ on GitHub Pages, / on custom domain). */
export function assetUrl(path) {
  if (!path) return path
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  const clean = path.startsWith('/') ? path.slice(1) : path
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${clean}`
}

export function resolveImageUrl(src) {
  if (!src) return null
  if (/^https?:\/\//i.test(src)) return src
  return assetUrl(src)
}
