'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'
import { Search } from 'lucide-react'

type Transaction = Tables<'transactions'> & {
  accounts: { name: string; color: string } | null
  categories: { name: string } | null
}

interface TransactionListProps {
  locale: string
  translations: {
    search: string
    filterByDate: string
    from: string
    to: string
    noTransactions: string
  }
}

export function TransactionList({ locale, translations: t }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchText, setSearchText] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
    return date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', options)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchText, dateFrom, dateTo])

  const fetchTransactions = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('transactions')
      .select('*, accounts(name, color), categories(name)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (data) setTransactions(data as Transaction[])
    setLoading(false)
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (searchText) {
      filtered = filtered.filter(t => 
        t.note?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.accounts?.name.toLowerCase().includes(searchText.toLowerCase()) ||
        t.categories?.name.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    if (dateFrom) {
      filtered = filtered.filter(t => t.date >= dateFrom)
    }

    if (dateTo) {
      filtered = filtered.filter(t => t.date <= dateTo)
    }

    setFilteredTransactions(filtered)
  }

  const deleteTransaction = async (id: string) => {
    const supabase = createClient()
    await supabase.from('transactions').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchTransactions()
  }

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={t.search}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1">{t.from}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t.to}</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-100 rounded-lg p-3">
          <p className="text-xs text-green-700">Income</p>
          <p className="text-lg font-bold text-green-800">฿{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-orange-100 rounded-lg p-3">
          <p className="text-xs text-orange-700">Expense</p>
          <p className="text-lg font-bold text-orange-800">฿{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-700">Balance</p>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>฿{balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white border rounded-lg p-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-20" />
            </div>
          ))
        ) : filteredTransactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{t.noTransactions}</p>
        ) : (
          filteredTransactions.map(transaction => (
            <div key={transaction.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: transaction.accounts?.color || '#6366F1' }}
                >
                  {transaction.accounts?.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.note || transaction.categories?.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
                </div>
                <button onClick={() => setDeleteConfirm(transaction.id)} className="text-red-500 hover:text-orange-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">ยืนยันการลบ</h3>
            <p className="text-gray-600 mb-4">ต้องการลบรายการนี้หรือไม่?</p>
            <div className="flex gap-2">
              <button onClick={() => deleteTransaction(deleteConfirm)} className="flex-1 bg-orange-200 text-orange-800 py-2 rounded-lg font-medium hover:bg-orange-300">
                ลบ
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
