import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isAppInstalled } from './lib/pwaInstall'

function hideAppSplash() {
  const el = document.getElementById('app-splash')
  if (!el || el.classList.contains('hide')) return
  el.classList.add('hide')
  window.setTimeout(() => el.remove(), 400)
}

const path = window.location.pathname
if (
  path === '/BusinessCard' || path === '/BusinessCard/' || path === '/BusinessCard/index.html' ||
  path === '/card' || path === '/card/' || path === '/businesscard/index.html' ||
  path === '/businesscard'
) {
  window.location.replace('/businesscard/')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (isAppInstalled()) {
  requestAnimationFrame(() => {
    requestAnimationFrame(hideAppSplash)
  })
  window.addEventListener('load', hideAppSplash, { once: true })
}
