import { getTranslations } from 'next-intl/server'
import { HomeContent } from './home-content'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  return (
    <HomeContent 
      locale={locale}
      translations={{
        title: t('title'),
        recentTransactions: t('recentTransactions'),
        noTransactions: t('noTransactions'),
        viewAll: t('viewAll'),
        income: t('income'),
        expense: t('expense')
      }}
    />
  )
}
