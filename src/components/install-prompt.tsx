'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-purple-600 text-white rounded-lg p-4 shadow-lg z-50 max-w-md mx-auto">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        <Download className="w-8 h-8 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">Install ExTracker</p>
          <p className="text-sm text-white/80">Add to home screen for quick access</p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          Install
        </button>
      </div>
    </div>
  )
}
