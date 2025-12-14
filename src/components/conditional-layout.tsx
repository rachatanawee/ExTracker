'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/bottom-nav/bottom-nav'
import { PageTransitionWrapper } from '@/components/page-transition-wrapper'
import { LanguageSwitcher } from '@/components/language-switcher'
import { APP_NAME } from '@/lib/config'
import { APP_VERSION } from '@/lib/version'
import { Wallet } from 'lucide-react'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.includes('/login')

  const getPageTitle = () => {
    if (pathname.includes('/profile')) return 'Profile'
    if (pathname.includes('/transactions')) return 'Transactions'
    if (pathname.includes('/summary')) return 'Summary'
    if (pathname.includes('/add')) return 'Add Transaction'
    return 'Dashboard'
  }

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/img/bg.png')" }}
    >
      <header className="px-4 py-3 bg-purple-600 shadow-xl w-full sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
                <Wallet className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-purple-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-white/80 tracking-wide">{APP_NAME}</h1>
                <span className="text-[10px] text-white/50 font-medium">v{APP_VERSION}</span>
              </div>
              <p className="text-xl font-bold text-white tracking-tight">{getPageTitle()}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-grow pb-16 max-w-md mx-auto w-full px-4 py-4">
        <PageTransitionWrapper>
          {children}
        </PageTransitionWrapper>
      </main>
      <BottomNav />
    </div>
  )
}
