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
      // Forward search params อื่นๆ ไปด้วยถ้าจำเป็น
      const forwardedSearchParams = new URLSearchParams(searchParams.toString())
      forwardedSearchParams.delete('code') // ลบ code ทิ้งไป
      
      // สร้าง URL ปลายทางที่สมบูรณ์
      // ข้อควรระวัง: ถ้า run บน localhost แล้ว origin เป็น http แต่ production เป็น https 
      // การใช้ request.nextUrl.clone() หรือสร้าง URL ใหม่จะชัวร์กว่า
      const forwardedUrl = new URL(next, origin) 
      
      return NextResponse.redirect(forwardedUrl)
    } else {
        console.error('Auth Exchange Error:', error)
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`)
}