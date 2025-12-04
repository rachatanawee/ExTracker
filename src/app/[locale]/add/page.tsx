import { getTranslations } from 'next-intl/server'
import { AddTransactionForm } from './add-transaction-form'

export default async function AddPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AddTransaction' })

  return (
    <div className="py-2">
      <div className="mb-3">
        <h1 className="text-xl font-bold text-gray-800">{t('title')}</h1>
      </div>
      <AddTransactionForm
        locale={locale}
        translations={{
          image: t('image'),
          takePhoto: t('takePhoto'),
          uploadImage: t('uploadImage'),
          expense: t('expense'),
          income: t('income'),
          amount: t('amount'),
          account: t('account'),
          category: t('category'),
          selectCategory: t('selectCategory'),
          date: t('date'),
          note: t('note'),
          notePlaceholder: t('notePlaceholder'),
          save: t('save'),
          saving: t('saving')
        }}
      />
    </div>
  )
}