import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  let user: { email?: string | null } | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Error getting Supabase session:', error)
    return null
  }

  if (!user?.email) return devFallback()

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, email: true, name: true, avatar: true },
    })

    return dbUser ?? null
  } catch (error) {
    console.error('Error loading DB user:', error)
    return null
  }
}

function devFallback() {
  if (process.env.NODE_ENV !== 'development') return null
  return { id: 'dev-user', email: 'dev@local.dev', name: 'Usuario de Prueba', avatar: null }
}
