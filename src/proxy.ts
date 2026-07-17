import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  // Local dev: skip auth checks
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next({ request: req })
  }

  const { pathname } = req.nextUrl

  const protectedRoutes = ['/dashboard', '/courses', '/groups', '/classes', '/students', '/observations', '/periods']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = pathname === '/login'

  const authCookies = req.cookies.getAll().filter((c) => c.name.startsWith('sb-'))
  const hasSessionCookie = authCookies.some((c) => c.value.length > 0)

  if (isProtectedRoute && !hasSessionCookie) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isProtectedRoute && hasSessionCookie) {
    const res = NextResponse.next({ request: req })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet, headers) {
            cookiesToSet.forEach(({ name, value }) => {
              req.cookies.set(name, value)
              res.cookies.set(name, value)
            })
            for (const [key, value] of Object.entries(headers)) {
              res.headers.set(key, value)
            }
          },
        },
      },
    )

    await supabase.auth.getUser().catch(() => {})

    return res
  }

  return NextResponse.next({ request: req })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
