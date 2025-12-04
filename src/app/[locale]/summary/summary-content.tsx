'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react'

type Transaction = Tables<'transactions'>
type Account = Tables<'accounts'>
type Category = Tables<'categories'>

interface SummaryData {
  totalIncome: number
  totalExpense: number
  balance: number
  accountBalances: Account[]
  categoryExpenses: { category: Category; total: number }[]
  recentTransactions: (Transaction & { account: Account; category: Category | null })[]
}

export function SummaryContent() {
  const t = useTranslations('SummaryPage')
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSummaryData() {
      const supabase = createClient()
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch accounts
        const { data: accounts } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)

        // Fetch categories
        const { data: categories } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)

        // Fetch transactions with related data
        const { data: transactions } = await supabase
          .from('transactions')
          .select(`
            *,
            accounts!inner(*),
            categories(*)
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(10)

        if (!accounts || !categories || !transactions) return

        // Calculate totals
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const totalExpense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        // Calculate category expenses
        const categoryExpenses = categories
          .map(category => ({
            category,
            total: transactions
              .filter(t => t.category_id === category.id && t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0)
          }))
          .filter(item => item.total > 0)
          .sort((a, b) => b.total - a.total)

        setData({
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          accountBalances: accounts,
          categoryExpenses,
          recentTransactions: transactions.map(t => ({
            ...t,
            account: t.accounts,
            category: t.categories
          }))
        })
      } catch (error) {
        console.error('Error fetching summary data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummaryData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return <div>{t('noData')}</div>

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700">{t('income')}</p>
              <p className="text-xl font-bold text-emerald-800">
                ฿{data.totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-500 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-xl border border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-rose-700">{t('expense')}</p>
              <p className="text-xl font-bold text-rose-800">
                ฿{data.totalExpense.toLocaleString()}
              </p>
            </div>
            <div className="bg-rose-500 p-2 rounded-full">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${data.balance >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'} p-4 rounded-xl border col-span-2`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${data.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{t('balance')}</p>
              <p className={`text-2xl font-bold ${data.balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                ฿{data.balance.toLocaleString()}
              </p>
            </div>
            <div className={`${data.balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'} p-2 rounded-full`}>
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Account Balances */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
          <div className="bg-indigo-100 p-1.5 rounded-lg mr-3">
            <Wallet className="h-4 w-4 text-indigo-600" />
          </div>
          {t('accounts')}
        </h3>
        <div className="space-y-3">
          {data.accountBalances.map(account => (
            <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3 shadow-sm"
                  style={{ backgroundColor: account.color || '#6366F1' }}
                />
                <span className="font-medium text-gray-700">{account.name}</span>
              </div>
              <span className="font-semibold text-gray-900">฿{(account.balance || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Expenses */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
          <div className="bg-purple-100 p-1.5 rounded-lg mr-3">
            <PieChart className="h-4 w-4 text-purple-600" />
          </div>
          {t('categoryExpenses')}
        </h3>
        <div className="space-y-3">
          {data.categoryExpenses.slice(0, 5).map(({ category, total }) => (
            <div key={category.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3 shadow-sm"
                  style={{ backgroundColor: category.color || '#EC4899' }}
                />
                <span className="text-gray-700">{category.name}</span>
              </div>
              <span className="font-semibold text-rose-600">฿{total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('recentTransactions')}</h3>
        <div className="space-y-3">
          {data.recentTransactions.slice(0, 5).map(transaction => (
            <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{transaction.category?.name || t('noCategory')}</p>
                <p className="text-sm text-gray-600">{transaction.account.name}</p>
                <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('th-TH')}</p>
              </div>
              <span className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}