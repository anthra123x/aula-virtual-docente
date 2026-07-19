import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error.message}`, origin))
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.user_metadata?.full_name ?? user.email.split('@')[0],
        avatar: user.user_metadata?.avatar_url ?? null,
      },
      create: {
        email: user.email,
        name: user.user_metadata?.full_name ?? user.email.split('@')[0],
        avatar: user.user_metadata?.avatar_url ?? null,
      },
    })
  }

  return NextResponse.redirect(new URL('/dashboard', origin))
}
