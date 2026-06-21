import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { usePWA } from '../../hooks/usePWA'
import { isAppInstalled, isIOS } from '../../lib/pwaInstall'
import brand from '../../config/brand'
import Button from './Button'
import Card from './Card'
import toast from 'react-hot-toast'

export default function InstallAppPanel({ compact = false, className = '' }) {
  const { canInstall, installApp, registerServiceWorker } = usePWA()
  const [installed, setInstalled] = useState(isAppInstalled())

  useEffect(() => {
    registerServiceWorker()
    setInstalled(isAppInstalled())
  }, [registerServiceWorker])

  const handleInstall = async () => {
    if (canInstall) {
      const ok = await installApp()
      if (ok) {
        setInstalled(true)
        toast.success('App installed!')
      }
    } else if (isIOS()) {
      toast('Use Share → Add to Home Screen in Safari', { icon: '📱' })
    } else {
      toast('Use your browser menu to install the app', { icon: '📱' })
    }
  }

  if (installed) {
    return (
      <Card className={`p-5 bg-accent/50 border-primary/10 ${className}`}>
        <div className="flex items-center gap-3">
          <img src={brand.logo} alt="" className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-primary/15 shrink-0" />
          <div>
            <p className="font-medium text-text text-sm">{brand.name} app is installed</p>
            <p className="text-xs text-text-muted mt-0.5">Open it from your home screen — your logo appears on the app icon.</p>
          </div>
        </div>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <Button onClick={handleInstall} size="lg" className="flex-1">
          <Download className="w-5 h-5" /> Download our app
        </Button>
        <Link to="/private-portal/register" className="flex-1">
          <Button variant="secondary" size="lg" className="w-full">Create account</Button>
        </Link>
      </div>
    )
  }

  return (
    <Card className={`p-6 sm:p-8 ${className}`}>
      <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-5 shadow-lg shadow-primary/20 ring-2 ring-primary/10">
        <img src={brand.logo} alt="" className="w-full h-full object-cover" />
      </div>
      <h2 className="text-xl font-bold text-text text-center">Get the {brand.name} app</h2>
      <p className="text-sm text-text-muted text-center mt-2 leading-relaxed max-w-md mx-auto">
        Install on your phone for the best experience — browse products, place orders, and get updates.
      </p>

      {isIOS() ? (
        <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-text-muted space-y-2">
          <p className="font-medium text-text">On iPhone / iPad:</p>
          <ol className="list-decimal list-inside space-y-1 text-left">
            <li>Tap <strong>Share</strong> in Safari</li>
            <li>Tap <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Add</strong></li>
          </ol>
        </div>
      ) : (
        <Button onClick={handleInstall} className="w-full mt-6" size="lg">
          <Download className="w-5 h-5" /> Install app
        </Button>
      )}

      <p className="text-xs text-text-muted text-center mt-4">
        Already have an account?{' '}
        <Link to="/private-portal/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </Card>
  )
}
