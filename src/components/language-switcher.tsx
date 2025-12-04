'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = pathname.split('/')[1]
  const newLocale = currentLocale === 'en' ? 'th' : 'en'

  const switchLanguage = () => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <button
      onClick={switchLanguage}
      className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-white/15 rounded-xl hover:bg-white/25 transition-all duration-300 backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 active:scale-95"
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4" strokeWidth={2.5} />
      <span className="tracking-wider">{newLocale.toUpperCase()}</span>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
    </button>
  )
}
