import { useAuth } from '../../context/AuthContext'
import { isDevBypass } from '../../lib/devAuth'

export default function DevModeBanner() {
  const { isDevSession } = useAuth()

  if (!isDevBypass() || !isDevSession) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] bg-amber-500 text-amber-950 text-center text-xs font-medium py-2 px-4 shadow-lg">
      Development mode — no login required. Turn off with{' '}
      <code className="bg-amber-600/20 px-1 rounded">VITE_DEV_BYPASS_AUTH=false</code>{' '}
      before production.
    </div>
  )
}
