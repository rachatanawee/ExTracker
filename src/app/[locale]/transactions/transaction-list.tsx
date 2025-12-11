'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'
import { Search, X, Image as ImageIcon, ChevronRight } from 'lucide-react'
import { formatDateTime, formatDate } from '@/lib/format-date'

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
  const getWeekRange = () => {
    const today = new Date()
    const day = today.getDay()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - day)
    const saturday = new Date(sunday)
    saturday.setDate(sunday.getDate() + 6)
    return {
      from: sunday.toISOString().split('T')[0],
      to: saturday.toISOString().split('T')[0]
    }
  }

  const weekRange = getWeekRange()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loaded, setLoaded] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [dateFrom, setDateFrom] = useState(weekRange.from)
  const [dateTo, setDateTo] = useState(weekRange.to)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [imageModal, setImageModal] = useState<string | null>(null)
  const [detailModal, setDetailModal] = useState<Transaction | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchText, dateFrom, dateTo])

  const fetchTransactions = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('transactions')
      .select('*, accounts(name, color), categories(name)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (data) {
      const transactionsWithProxyUrls = data.map(t => {
        if (t.image_url && t.image_url.includes('/receipts/')) {
          const path = t.image_url.split('/receipts/')[1]
          return { ...t, image_url: `/api/image?path=${encodeURIComponent(path)}` }
        }
        return t
      })
      setTransactions(transactionsWithProxyUrls as Transaction[])
    }
    setLoaded(true)
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
        <div className="bg-purple-100 rounded-lg p-3">
          <p className="text-xs text-purple-700">Balance</p>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-purple-800' : 'text-orange-800'}`}>฿{balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        {!loaded ? null : filteredTransactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{t.noTransactions}</p>
        ) : (
          filteredTransactions.map(transaction => (
            <div key={transaction.id} className="bg-white border rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: transaction.accounts?.color || '#6366F1' }}
                >
                  {transaction.accounts?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{transaction.note || transaction.categories?.name}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(transaction.date, locale)}</p>
                </div>
                <div className={`font-bold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                {transaction.image_url && (
                  <button 
                    onClick={() => setImageModal(transaction.image_url)} 
                    className="flex-1 flex items-center justify-center gap-1 bg-purple-100 text-purple-700 py-2 rounded-lg text-xs font-medium hover:bg-purple-200"
                  >
                    <ImageIcon className="w-4 h-4" />
                    ดูรูป
                  </button>
                )}
                <button 
                  onClick={() => setDetailModal(transaction)} 
                  className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-medium hover:bg-gray-200"
                >
                  <ChevronRight className="w-4 h-4" />
                  รายละเอียด
                </button>
                <button 
                  onClick={() => setDeleteConfirm(transaction.id)} 
                  className="px-3 bg-orange-100 text-orange-700 py-2 rounded-lg text-xs font-medium hover:bg-orange-200"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {detailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-white">รายละเอียด</h3>
              <button 
                onClick={() => setDetailModal(null)} 
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ประเภท</span>
                <span className={`font-semibold ${detailModal.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                  {detailModal.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">จำนวนเงิน</span>
                <span className={`text-xl font-bold ${detailModal.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                  {detailModal.type === 'income' ? '+' : '-'}฿{detailModal.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">บัญชี</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: detailModal.accounts?.color }} />
                  <span className="font-medium">{detailModal.accounts?.name}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">หมวดหมู่</span>
                <span className="font-medium">{detailModal.categories?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">วันที่</span>
                <span className="font-medium">{formatDateTime(detailModal.date, locale)}</span>
              </div>
              {detailModal.note && (
                <div>
                  <span className="text-gray-600 block mb-1">หมายเหตุ</span>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{detailModal.note}</p>
                </div>
              )}
              {detailModal.image_url && (
                <button 
                  onClick={() => { setImageModal(detailModal.image_url); setDetailModal(null) }} 
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700"
                >
                  <ImageIcon className="w-5 h-5" />
                  ดูใบเสร็จ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {imageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setImageModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-white">ใบเสร็จ</h3>
              <button 
                onClick={() => setImageModal(null)} 
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              <img 
                src={imageModal} 
                alt="Receipt" 
                className="w-full h-auto rounded-lg shadow-md" 
              />
            </div>
          </div>
        </div>
      )}

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
