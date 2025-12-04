import { getTranslations } from 'next-intl/server'
import { ProfileContent } from './profile-content'

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ProfilePage' })

  return (
    <ProfileContent 
      locale={locale}
      translations={{
        title: t('title'),
        logout: t('logout'),
        member: t('member'),
        email: t('email'),
        joinedDate: t('joinedDate'),
        loginType: t('loginType'),
        user: t('user'),
        unknown: t('unknown'),
        accounts: t('accounts'),
        categories: t('categories'),
        addAccount: t('addAccount'),
        addCategory: t('addCategory'),
        name: t('name'),
        color: t('color'),
        type: t('type'),
        expense: t('expense'),
        income: t('income'),
        save: t('save'),
        cancel: t('cancel'),
        edit: t('edit'),
        delete: t('delete')
      }} 
    />
  )
}
