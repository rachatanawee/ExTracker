import { getTranslations } from 'next-intl/server'
import { TransactionList } from './transaction-list'

export default async function TransactionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'TransactionsPage' })

  return (
    <div className="py-2">
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t('title')}</h1>
      <TransactionList
        locale={locale}
        translations={{
          search: t('search'),
          filterByDate: t('filterByDate'),
          from: t('from'),
          to: t('to'),
          noTransactions: t('noTransactions')
        }}
      />
    </div>
  )
}
