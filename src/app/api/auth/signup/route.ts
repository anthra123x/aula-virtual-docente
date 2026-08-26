import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (data.user) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { id: data.user.id, email, name: name || email.split('@')[0] },
    })
  }

  const hasSession = !!data.session
  return NextResponse.json({ success: true, hasSession })
}
