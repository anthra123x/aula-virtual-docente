const store = new Map<string, { count: number; resetAt: number }>()

const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now()

  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    for (const [k, entry] of store) {
      if (now > entry.resetAt) store.delete(k)
    }
    lastCleanup = now
  }

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 }
  }

  entry.count++
  return { ok: true, remaining: limit - entry.count }
}
