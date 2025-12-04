'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/types'
import { Save, Camera, Upload, X } from 'lucide-react'

type Account = Tables<'accounts'>
type Category = Tables<'categories'>

interface AddTransactionFormProps {
  locale: string
  translations: {
    image: string
    takePhoto: string
    uploadImage: string
    expense: string
    income: string
    amount: string
    account: string
    category: string
    selectCategory: string
    date: string
    time: string
    note: string
    notePlaceholder: string
    save: string
    saving: string
  }
}

export function AddTransactionForm({ locale, translations: t }: AddTransactionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  const getLocalTime = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  const initialFormData = {
    type: 'expense' as 'income' | 'expense',
    amount: '',
    account_id: '',
    category_id: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    time: getLocalTime()
  }
  const [formData, setFormData] = useState(initialFormData)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const amountInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    amountInputRef.current?.focus()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [accountsRes, categoriesRes] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', user.id),
      supabase.from('categories').select('*')
    ])

    if (accountsRes.data) {
      setAccounts(accountsRes.data)
      if (accountsRes.data.length > 0 && !formData.account_id) {
        setFormData(prev => ({ ...prev, account_id: accountsRes.data[0].id }))
      }
    }
    if (categoriesRes.data) {
      console.log('Categories loaded:', categoriesRes.data)
      setCategories(categoriesRes.data)
    }
  }

  const uploadImage = async (file: File) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file)

    if (error) return null
    
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName)
    
    return publicUrl
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setShowSuccess(false)
      setTimeout(() => setShowSuccess(true), 100)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setShowSuccess(false)
      setTimeout(() => setShowSuccess(true), 100)
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setImagePreview(base64)
      
      setOcrLoading(true)
      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        })
        
        if (!response.ok) throw new Error('OCR failed')
        
        const data = await response.json()
        console.log('OCR Response:', JSON.stringify(data, null, 2))
        
        if (data.amount) setFormData(prev => ({ ...prev, amount: data.amount.toString() }))
        if (data.date) setFormData(prev => ({ ...prev, date: data.date }))
        if (data.note) setFormData(prev => ({ ...prev, note: data.note }))
        if (data.category) {
          console.log('OCR Category:', data.category)
          console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name, type: c.type })))
          const matchedCategory = categories.find(c => 
            c.type === formData.type && (
              c.name.toLowerCase().includes(data.category.toLowerCase()) ||
              data.category.toLowerCase().includes(c.name.toLowerCase())
            )
          )
          console.log('Matched category:', matchedCategory)
          if (matchedCategory) setFormData(prev => ({ ...prev, category_id: matchedCategory.id }))
        }
      } catch (error) {
        console.error('OCR failed:', error)
      }
      setOcrLoading(false)
    }
    reader.onerror = () => {
      setImageFile(null)
      setImagePreview(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMessage('กรุณากรอกจำนวนเงิน')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }
    
    if (!formData.account_id) {
      setErrorMessage('กรุณาเลือกบัญชี')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    if (!formData.category_id) {
      setErrorMessage('กรุณาเลือกหมวดหมู่')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let imageUrl = ''
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) imageUrl = uploadedUrl
      }
      console.log('date time', `${formData.date} ${formData.time}`)
      const { error } = await supabase.from('transactions').insert({
        type: formData.type,
        amount: parseFloat(formData.amount),
        account_id: formData.account_id,
        category_id: formData.category_id,
        date: `${formData.date} ${formData.time}`,
        note: formData.note,
        image_url: imageUrl,
        user_id: user.id
      })

      if (!error) {
        setShowSuccess(true)
        setFormData({
          type: 'expense',
          amount: '',
          account_id: accounts[0]?.id || '',
          category_id: '',
          note: '',
          date: new Date().toISOString().split('T')[0],
          time: getLocalTime()
        })
        setImageFile(null)
        setImagePreview(null)
        amountInputRef.current?.focus()
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))} className={`p-2 rounded-lg font-medium text-sm ${formData.type === 'expense' ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-700'}`}>
          {t.expense}
        </button>
        <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))} className={`p-2 rounded-lg font-medium text-sm ${formData.type === 'income' ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
          {t.income}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1">{t.amount}</label>
          <input ref={amountInputRef} type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} className="w-full p-2 border rounded-lg text-sm text-center" placeholder="0.00" required />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t.account}</label>
          <div className="flex gap-1">
            {accounts.map(account => (
              <button key={account.id} type="button" onClick={() => setFormData(prev => ({ ...prev, account_id: account.id }))} className={`flex-1 px-2 py-2 rounded-lg border flex items-center justify-center font-medium text-xs ${formData.account_id === account.id ? 'bg-blue-200 text-blue-800 border-blue-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: account.color || '#6366F1' }} />
                {account.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">{t.category}</label>
        <select value={formData.category_id} onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))} className="w-full p-2 border rounded-lg text-base">
          <option value="">{t.selectCategory}</option>
          {categories.filter(c => c.type === formData.type).map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1">{t.date}</label>
          <input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t.time}</label>
          <input type="time" value={formData.time} onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" required />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">{t.note}</label>
        <input type="text" value={formData.note} onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))} className="w-full p-2 border rounded-lg text-sm" placeholder={t.notePlaceholder} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t.image}</label>
        {imagePreview ? (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-24 object-cover rounded-lg cursor-pointer" 
              onClick={() => setShowImageModal(true)}
            />
            {ocrLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-white text-xs">Processing...</div>
              </div>
            )}
            <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }} className="absolute top-1 right-1 bg-orange-500 text-white p-1 rounded-full z-10">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <Camera className="h-4 w-4 mr-1" />
              <span className="text-sm">{t.takePhoto}</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
            </label>
            <label className="flex items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload className="h-4 w-4 mr-1" />
              <span className="text-sm">{t.uploadImage}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        )}
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-200 text-blue-800 p-2 rounded-lg font-medium hover:bg-blue-300 disabled:opacity-50 flex items-center justify-center text-sm relative">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin mr-2" />
            {t.saving}
          </>
        ) : (
          <>
            <Save className="h-3 w-3 mr-1" />
            {t.save}
          </>
        )}
      </button>

      {showImageModal && imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setShowImageModal(false)}>
            <X className="h-8 w-8" />
          </button>
          <img src={imagePreview} alt="Full size" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top">
          ✓ บันทึกข้อมูลเรียบร้อย
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top">
          {errorMessage}
        </div>
      )}
    </form>
  )
}
