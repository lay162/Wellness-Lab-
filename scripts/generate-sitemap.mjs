import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SEED_BLOG_POSTS } from '../src/data/seedBlogPosts.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const SITE = 'https://thewellnesslab.uk'

const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/about', priority: '0.8', changefreq: 'monthly' },
  { loc: '/wellness', priority: '0.8', changefreq: 'monthly' },
  { loc: '/shop', priority: '0.9', changefreq: 'daily' },
  { loc: '/blog', priority: '0.9', changefreq: 'weekly' },
  { loc: '/how-it-works', priority: '0.7', changefreq: 'monthly' },
  { loc: '/success-stories', priority: '0.7', changefreq: 'weekly' },
  { loc: '/reviews', priority: '0.7', changefreq: 'weekly' },
  { loc: '/aftercare', priority: '0.7', changefreq: 'monthly' },
  { loc: '/faqs', priority: '0.7', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.8', changefreq: 'monthly' },
  { loc: '/get-app', priority: '0.6', changefreq: 'monthly' },
  { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { loc: '/terms-and-conditions', priority: '0.3', changefreq: 'yearly' },
  { loc: '/cookies', priority: '0.3', changefreq: 'yearly' },
  { loc: '/legal-disclaimer', priority: '0.3', changefreq: 'yearly' },
  { loc: '/compliance', priority: '0.3', changefreq: 'yearly' },
]

const blogPages = SEED_BLOG_POSTS.map(p => ({
  loc: `/blog/${p.slug}`,
  priority: '0.7',
  changefreq: 'monthly',
  lastmod: p.updated_at?.slice(0, 10),
}))

const urls = [...staticPages, ...blogPages]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE}${u.loc === '/' ? '' : u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

writeFileSync(join(root, 'public', 'sitemap.xml'), xml)
console.log(`Sitemap written with ${urls.length} URLs`)
