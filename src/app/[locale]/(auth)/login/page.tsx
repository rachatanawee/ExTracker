import { getTranslations } from 'next-intl/server'
import { LoginForm } from './login-form'
import { LanguageSwitcher } from '@/components/language-switcher'

export default async function Login({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'LoginPage' })

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <LoginForm translations={{
            title: t('title'),
            email: t('email'),
            password: t('password'),
            signIn: t('signIn'),
            signingIn: t('signingIn'),
            or: t('or'),
            signInWithGoogle: t('signInWithGoogle'),
            emailPlaceholder: t('emailPlaceholder'),
            passwordPlaceholder: t('passwordPlaceholder')
          }} />
        </div>
      </div>
    </div>
  )
}
