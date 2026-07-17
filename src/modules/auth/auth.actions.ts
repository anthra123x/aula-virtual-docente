'use server'

import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { failure } from '@/types'

export { getCurrentUser }

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return failure(error.message)
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { error, data: authData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) {
    return failure(error.message)
  }

  if (authData.user) {
    await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    })
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/login')
  redirect('/login')
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}
