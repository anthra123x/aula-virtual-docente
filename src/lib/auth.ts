import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) return devFallback()

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, email: true, name: true, avatar: true },
    })

    return dbUser ?? devFallback()
  } catch {
    return devFallback()
  }
}

function devFallback() {
  if (process.env.NODE_ENV !== 'production' || !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co')) {
    return { id: 'dev-user', email: 'dev@local.dev', name: 'Usuario de Prueba', avatar: null }
  }
  return null
}
