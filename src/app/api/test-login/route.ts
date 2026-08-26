import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  const debug: Record<string, unknown> = {}

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    debug.envUrl = url
    debug.envKeyLen = key?.length
    debug.envKeyPrefix = key?.substring(0, 30)

    if (!url || !key) {
      return NextResponse.json({ error: 'Missing env vars', debug }, { status: 500 })
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch (e) {
            debug.setAllError = e instanceof Error ? e.message : String(e)
          }
        },
      },
    })

    debug.clientCreated = true

    const testEmail = 'andrescamilomartinez330@gmail.com'
    const testPassword = '123456'

    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (error) {
      debug.signInError = {
        message: error.message,
        status: error.status,
        name: error.name,
      }
    } else {
      debug.signInSuccess = true
      debug.userEmail = data.user?.email
      debug.sessionExists = !!data.session
    }

    const setCookies = cookieStore.getAll()
    debug.cookiesAfterSignIn = setCookies.map(c => ({
      name: c.name,
      valueLen: c.value.length,
      hasValue: c.value.length > 0,
    }))

    return NextResponse.json(debug)
  } catch (e) {
    debug.unhandledError = e instanceof Error ? e.message : String(e)
    debug.unhandledStack = e instanceof Error ? e.stack?.substring(0, 500) : undefined
    return NextResponse.json({ error: 'Unhandled', debug }, { status: 500 })
  }
}
