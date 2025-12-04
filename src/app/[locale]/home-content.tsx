'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'
import { ArrowUpRight, ArrowDownRight, Receipt, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Transaction = Tables<'transactions'> & {
  categories: { name: string; type: string } | null
  accounts: { name: string; color: string } | null
}

type CategoryExpense = {
  name: string
  amount: number
  percentage: number
  color: string
}

interface HomeContentProps {
  locale: string
  translations: {
    title: string
    recentTransactions: string
    noTransactions: string
    viewAll: string
    income: string
    expense: string
  }
}

export function HomeContent({ locale, translations: t }: HomeContentProps) {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ income: 0, expense: 0 })
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([])

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedYear])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const firstDay = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]

    const [recentData, monthData] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, categories(name, type), accounts(name, color)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('transactions')
        .select('*, categories(name, type)')
        .eq('user_id', user.id)
        .gte('date', firstDay)
        .lte('date', lastDay)
    ])

    if (recentData.data) {
      setTransactions(recentData.data as Transaction[])
      const income = recentData.data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const expense = recentData.data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      setSummary({ income, expense })
    }

    if (monthData.data) {
      const expenses = monthData.data.filter(t => t.type === 'expense')
      const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0)
      const categoryMap = new Map<string, number>()
      
      expenses.forEach(t => {
        const name = t.categories?.name || 'อื่นๆ'
        categoryMap.set(name, (categoryMap.get(name) || 0) + t.amount)
      })

      const colors = ['#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6']
      const categoryData = Array.from(categoryMap.entries())
        .map(([name, amount], i) => ({
          name,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
          color: colors[i % colors.length]
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      setCategoryExpenses(categoryData)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200 animate-pulse">
            <div className="flex items-center gap-1 text-green-700 mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs font-medium">{t.income}</span>
            </div>
            <div className="h-6 bg-green-200 rounded w-20" />
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 animate-pulse">
            <div className="flex items-center gap-1 text-orange-700 mb-1">
              <ArrowDownRight className="w-4 h-4" />
              <span className="text-xs font-medium">{t.expense}</span>
            </div>
            <div className="h-6 bg-orange-200 rounded w-20" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">{t.recentTransactions}</h2>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>

        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {categoryExpenses.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">รายจ่าย</h3>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-xs border rounded px-2 py-1 bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2024, i).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { month: 'short' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-xs border rounded px-2 py-1 bg-white"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return <option key={year} value={year}>{year}</option>
                })}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {categoryExpenses.reduce((acc, cat, i) => {
                  const prevPercentage = categoryExpenses.slice(0, i).reduce((sum, c) => sum + c.percentage, 0)
                  const strokeDasharray = `${cat.percentage} ${100 - cat.percentage}`
                  const strokeDashoffset = -prevPercentage
                  acc.push(
                    <circle
                      key={cat.name}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={cat.color}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  )
                  return acc
                }, [] as React.ReactElement[])}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-500">รวม</p>
                  <p className="text-sm font-bold text-gray-800">
                    {categoryExpenses.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              {categoryExpenses.map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-700">{cat.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">{cat.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-1 text-green-700 mb-1">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-xs font-medium">{t.income}</span>
          </div>
          <p className="text-lg font-bold text-green-800">
            {summary.income.toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center gap-1 text-orange-700 mb-1">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-xs font-medium">{t.expense}</span>
          </div>
          <p className="text-lg font-bold text-orange-800">
            {summary.expense.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">{t.recentTransactions}</h2>
        <Link href={`/${locale}/transactions`} className="text-xs text-blue-600 hover:text-blue-800">
          {t.viewAll}
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">{t.noTransactions}</div>
      ) : (
        <div className="space-y-2">
          {transactions.map(transaction => (
            <div key={transaction.id} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-orange-100'}`}>
                {transaction.image_url ? (
                  <Receipt className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-orange-600'}`} />
                ) : (
                  transaction.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-orange-600" />
                  )
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {transaction.categories?.name || transaction.note || '-'}
                  </p>
                  <p className={`text-sm font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amount.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {transaction.accounts && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: transaction.accounts.color }} />
                      <span className="text-xs text-gray-500">{transaction.accounts.name}</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(transaction.date).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
