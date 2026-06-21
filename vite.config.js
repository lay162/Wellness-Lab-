import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/** Serve standalone business card at /businesscard (not the React app) */
function businessCardStaticPlugin() {
  const legacyPaths = new Set([
    '/BusinessCard',
    '/BusinessCard/',
    '/BusinessCard/index.html',
    '/card',
    '/card/',
  ])

  const cardPaths = new Set(['/businesscard', '/businesscard/'])

  const middleware = (req, res, next) => {
    const raw = req.url || ''
    const path = raw.split('?')[0]
    const qs = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''

    if (legacyPaths.has(path)) {
      res.statusCode = 301
      res.setHeader('Location', '/businesscard' + qs)
      res.end()
      return
    }

    if (path === '/businesscard/index.html') {
      res.statusCode = 301
      res.setHeader('Location', '/businesscard' + qs)
      res.end()
      return
    }

    if (cardPaths.has(path)) {
      req.url = '/businesscard/index.html' + qs
    }

    next()
  }

  return {
    name: 'wellness-business-card-static',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [
    businessCardStaticPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [
        'favicon.png', 'apple-touch-icon.png',
        'app-icon-192.png', 'app-icon-512.png', 'app-icon-maskable-512.png',
        'logo.png', 'og-image.png', 'robots.txt', 'sitemap.xml',
        'splash/apple-1170x2532.png', 'splash/apple-1284x2778.png',
        'splash/apple-1290x2796.png', 'splash/apple-828x1792.png',
      ],
      manifest: {
        name: 'Wellness Lab',
        short_name: 'Wellness Lab',
        description: 'UK peptide research, wellness education & shop — browse, learn & order nationwide.',
        theme_color: '#1E6B5C',
        background_color: '#F8FAF9',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['health', 'lifestyle', 'shopping'],
        icons: [
          {
            src: '/app-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/app-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/app-icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/private-admin/, /^\/businesscard/, /^\/BusinessCard/, /^\/card/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
})
