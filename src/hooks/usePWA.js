import { useState, useEffect, useCallback, useRef } from 'react'
import { registerSW } from 'virtual:pwa-register'

export function usePWA() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const registered = useRef(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const registerServiceWorker = useCallback(() => {
    if (registered.current) return
    registered.current = true
    registerSW({
      immediate: true,
      onNeedRefresh() { setNeedRefresh(true) },
      onOfflineReady() { setOfflineReady(true) },
    })
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setCanInstall(false)
    return outcome === 'accepted'
  }

  const closePrompt = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }

  return {
    needRefresh, offlineReady, canInstall,
    registerServiceWorker, installApp, closePrompt,
  }
}
