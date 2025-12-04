import { getTranslations } from 'next-intl/server'
import { SummaryPageClient } from './summary-page-client'

export default async function SummaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SummaryPage' })

  return (
    <div className="py-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <p className="text-gray-600">{t('description')}</p>
      </div>
      <SummaryPageClient />
    </div>
  )
}