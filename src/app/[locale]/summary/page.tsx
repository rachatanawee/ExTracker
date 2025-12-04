import { getTranslations } from 'next-intl/server'
import { SummaryPageClient } from './summary-page-client'

export default async function SummaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SummaryPage' })

  return (
    <div className="py-2">
      <SummaryPageClient />
    </div>
  )
}