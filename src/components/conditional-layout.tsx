'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/bottom-nav/bottom-nav'
import { PageTransitionWrapper } from '@/components/page-transition-wrapper'
import { LanguageSwitcher } from '@/components/language-switcher'
import { APP_NAME } from '@/lib/config'
import { Sparkles } from 'lucide-react'

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg w-full sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-white/80">{APP_NAME}</h1>
              <p className="text-base font-bold text-white">{getPageTitle()}</p>
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
