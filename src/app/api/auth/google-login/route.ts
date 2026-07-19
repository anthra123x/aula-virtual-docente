import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/api/auth/callback`,
    },
  })

  if (data.url) {
    return NextResponse.redirect(data.url)
  }

  return NextResponse.redirect(new URL('/login?error=oauth_failed', baseUrl))
}
