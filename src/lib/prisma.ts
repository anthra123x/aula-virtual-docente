import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionUrl = new URL(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aula-docente')

  const isSupabasePooler = connectionUrl.hostname.endsWith('.pooler.supabase.com')
  const isSessionMode = connectionUrl.port === '5432'
  const port = isSupabasePooler && isSessionMode ? 6543 : parseInt(connectionUrl.port || '5432')

  const pool = new Pool({
    host: connectionUrl.hostname,
    port,
    user: decodeURIComponent(connectionUrl.username),
    password: decodeURIComponent(connectionUrl.password),
    database: connectionUrl.pathname.replace('/', ''),
    max: 3,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 10000,
  })

  return new PrismaClient({
    adapter: new PrismaPg(pool),
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
