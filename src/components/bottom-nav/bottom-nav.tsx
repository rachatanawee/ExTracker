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
    <nav className="fixed bottom-0 w-full bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200">
      <div className="flex justify-around py-2">
        {navItems.map(({ href, icon: Icon, labelKey, color }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} className={`flex flex-col items-center px-3 py-1 transition-all ${isActive ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{t(labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
