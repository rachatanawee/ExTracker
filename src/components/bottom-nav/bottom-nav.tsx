'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Plus, List, PieChart } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function BottomNav() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1];
  const t = useTranslations('BottomNav');

  const navItems = [
    { href: `/${locale}`, icon: Home, labelKey: 'Home', color: 'text-blue-500' },
    
    { href: `/${locale}/transactions`, icon: List, labelKey: 'Transactions', color: 'text-orange-500' },
    { href: `/${locale}/add`, icon: Plus, labelKey: 'Add', color: 'text-green-500' },
    { href: `/${locale}/summary`, icon: PieChart, labelKey: 'Summary', color: 'text-indigo-500' },
    { href: `/${locale}/profile`, icon: User, labelKey: 'Profile', color: 'text-purple-500' },
  ]

  return (
    <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.12)] border-t border-gray-100">
      <div className="flex justify-around py-1 max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, labelKey, color }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} className={`relative flex flex-col items-center px-4 py-2 transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
              )}
              <div className={`relative ${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>{t(labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
