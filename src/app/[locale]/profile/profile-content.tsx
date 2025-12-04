'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, User, Mail, Calendar, Wallet, Tag, Plus, Edit, Trash2 } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Tables } from '@/lib/supabase/types'

type Account = Tables<'accounts'>
type Category = Tables<'categories'>

interface ProfileContentProps {
  locale: string
  translations: Record<string, string>
}

export function ProfileContent({ locale, translations: t }: ProfileContentProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [accountForm, setAccountForm] = useState({ name: '', color: '#6366F1' })
  const [categoryForm, setCategoryForm] = useState({ name: '', type: 'expense' as 'expense' | 'income' })
  const [activeTab, setActiveTab] = useState<'profile' | 'accounts' | 'categories'>('profile')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const [accountsRes, categoriesRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('categories').select('*')
      ])
      if (accountsRes.data) setAccounts(accountsRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-40" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-end items-center mb-3">
        <button onClick={handleLogout} className="flex items-center gap-1 bg-orange-200 text-orange-800 py-1 px-3 rounded-lg text-sm hover:bg-orange-300">
          <LogOut className="w-3 h-3" />
          {t.logout}
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={() => setActiveTab('profile')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${activeTab === 'profile' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
          <User className="w-4 h-4 inline mr-1" />
          {t.title}
        </button>
        <button onClick={() => setActiveTab('accounts')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${activeTab === 'accounts' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
          <Wallet className="w-4 h-4 inline mr-1" />
          {t.accounts}
        </button>
        <button onClick={() => setActiveTab('categories')} className={`flex-1 py-2 rounded-lg text-sm font-medium ${activeTab === 'categories' ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
          <Tag className="w-4 h-4 inline mr-1" />
          {t.categories}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || t.user}
                </h2>
                <p className="text-sm text-gray-600">{t.member}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">{t.email}</p>
                  <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">{t.joinedDate}</p>
                  <p className="text-sm font-medium text-gray-800">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US') : t.unknown}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">{t.loginType}</p>
                  <p className="text-sm font-medium text-gray-800">
                    {user?.app_metadata?.provider === 'google' ? 'Google' : t.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <button onClick={() => { setShowAccountForm(true); setEditingAccount(null); setAccountForm({ name: '', color: '#6366F1' }) }} className="w-full flex items-center justify-center gap-1 bg-blue-200 text-blue-800 py-2 rounded-lg text-sm font-medium hover:bg-blue-300 mb-3">
              <Plus className="w-4 h-4" />
              {t.addAccount}
            </button>
            <div className="space-y-2">
              {accounts.map(account => (
                <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: account.color || '#6366F1' }} />
                    <span className="text-sm font-medium">{account.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingAccount(account); setAccountForm({ name: account.name, color: account.color || '#6366F1' }); setShowAccountForm(true) }} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteAccount(account.id)} className="text-orange-600 hover:text-orange-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <button onClick={() => { setShowCategoryForm(true); setEditingCategory(null); setCategoryForm({ name: '', type: 'expense' }) }} className="w-full flex items-center justify-center gap-1 bg-blue-200 text-blue-800 py-2 rounded-lg text-sm font-medium hover:bg-blue-300 mb-3">
              <Plus className="w-4 h-4" />
              {t.addCategory}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-2">{t.expense}</h4>
                <div className="space-y-2">
                  {categories.filter(c => c.type === 'expense').map(category => (
                    <div key={category.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                      <span className="text-xs truncate">{category.name}</span>
                      {category.user_id === user?.id && (
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingCategory(category); setCategoryForm({ name: category.name, type: category.type }); setShowCategoryForm(true) }} className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-3 h-3" />
                          </button>
                          <button onClick={() => deleteCategory(category.id)} className="text-orange-600 hover:text-orange-800">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-2">{t.income}</h4>
                <div className="space-y-2">
                  {categories.filter(c => c.type === 'income').map(category => (
                    <div key={category.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="text-xs truncate">{category.name}</span>
                      {category.user_id === user?.id && (
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingCategory(category); setCategoryForm({ name: category.name, type: category.type }); setShowCategoryForm(true) }} className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-3 h-3" />
                          </button>
                          <button onClick={() => deleteCategory(category.id)} className="text-orange-600 hover:text-orange-800">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAccountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAccountForm(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editingAccount ? t.edit : t.addAccount}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t.name}</label>
                <input type="text" value={accountForm.name} onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.color}</label>
                <input type="color" value={accountForm.color} onChange={(e) => setAccountForm(prev => ({ ...prev, color: e.target.value }))} className="w-full h-10 border rounded-lg" />
              </div>
              <div className="flex gap-2">
                <button onClick={saveAccount} className="flex-1 bg-blue-200 text-blue-800 py-2 rounded-lg font-medium hover:bg-blue-300">{t.save}</button>
                <button onClick={() => setShowAccountForm(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300">{t.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowCategoryForm(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editingCategory ? t.edit : t.addCategory}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t.name}</label>
                <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.type}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setCategoryForm(prev => ({ ...prev, type: 'expense' }))} className={`p-2 rounded-lg font-medium text-sm ${categoryForm.type === 'expense' ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-700'}`}>{t.expense}</button>
                  <button type="button" onClick={() => setCategoryForm(prev => ({ ...prev, type: 'income' }))} className={`p-2 rounded-lg font-medium text-sm ${categoryForm.type === 'income' ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{t.income}</button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveCategory} className="flex-1 bg-blue-200 text-blue-800 py-2 rounded-lg font-medium hover:bg-blue-300">{t.save}</button>
                <button onClick={() => setShowCategoryForm(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300">{t.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  async function saveAccount() {
    if (!accountForm.name || !user) return
    try {
      if (editingAccount) {
        await supabase.from('accounts').update(accountForm).eq('id', editingAccount.id)
      } else {
        await supabase.from('accounts').insert({ ...accountForm, user_id: user.id })
      }
      setShowAccountForm(false)
      fetchData()
    } catch (error) {
      console.error('Save account error:', error)
    }
  }

  async function deleteAccount(id: string) {
    try {
      await supabase.from('accounts').delete().eq('id', id)
      fetchData()
    } catch (error) {
      console.error('Delete account error:', error)
    }
  }

  async function saveCategory() {
    if (!categoryForm.name || !user) return
    try {
      if (editingCategory) {
        await supabase.from('categories').update(categoryForm).eq('id', editingCategory.id).eq('user_id', user.id)
      } else {
        await supabase.from('categories').insert({ ...categoryForm, user_id: user.id })
      }
      setShowCategoryForm(false)
      fetchData()
    } catch (error) {
      console.error('Save category error:', error)
    }
  }

  async function deleteCategory(id: string) {
    if (!user) return
    try {
      await supabase.from('categories').delete().eq('id', id).eq('user_id', user.id)
      fetchData()
    } catch (error) {
      console.error('Delete category error:', error)
    }
  }
}
