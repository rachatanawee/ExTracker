// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const pathname = request.nextUrl.pathname
  const locale = pathname.split('/')[1] || 'en'
  const next = `/${locale}`

  if (code) {
    const cookieStore = await cookies() // ถูกต้อง: Next.js 16 ต้อง await
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // กัน Error กรณีเรียกใช้ใน Server Component (แต่ใน Route Handler ไม่น่าเกิด)
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: existingAccounts } = await supabase
          .from('accounts')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
        
        if (!existingAccounts || existingAccounts.length === 0) {
          await supabase.from('accounts').insert({
            user_id: user.id,
            name: 'Cash',
            color: '#6366F1'
          })
        }
      }
      
      const forwardedUrl = new URL(next, origin)
      return NextResponse.redirect(forwardedUrl)
    } else {
        console.error('Auth Exchange Error:', error)
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`)
}