import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path')
  if (!path) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 })
  }

  const { data, error } = await supabase.storage.from('receipts').download(path)
  
  if (error || !data) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  return new NextResponse(data, {
    headers: {
      'Content-Type': data.type,
      'Cache-Control': 'private, max-age=3600'
    }
  })
}
