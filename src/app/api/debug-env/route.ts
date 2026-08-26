import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '(empty)'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '(empty)'
  const db = process.env.DATABASE_URL || '(empty)'

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: url.substring(0, 40) + (url.length > 40 ? '...' : ''),
    NEXT_PUBLIC_SUPABASE_URL_len: url.length,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_prefix: key.substring(0, 20) + '...',
    NEXT_PUBLIC_SUPABASE_ANON_KEY_len: key.length,
    DATABASE_URL_prefix: db.substring(0, 20) + '...',
    DATABASE_URL_len: db.length,
  })
}
