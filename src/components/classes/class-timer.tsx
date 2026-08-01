'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Timer } from 'lucide-react'

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function ClassTimer({
  startedAt,
  duration,
}: {
  startedAt: string
  duration: number | null
}) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(startedAt).getTime())

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - new Date(startedAt).getTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [startedAt])

  const durationMs = duration ? duration * 60 * 1000 : null
  const overTime = durationMs !== null && elapsed > durationMs
  const percent = durationMs ? Math.min(100, (elapsed / durationMs) * 100) : 0

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className={`text-2xl font-bold tabular-nums ${overTime ? 'text-destructive' : 'text-primary'}`}>
          {formatElapsed(elapsed)}
        </p>
        {duration && (
          <p className="text-xs text-muted-foreground">
            de {duration} min planificados
          </p>
        )}
      </div>
      {durationMs && (
        <Progress
          value={percent}
          className={overTime ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}
        />
      )}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Timer className="h-3 w-3" />
        {overTime ? 'Tiempo planificado superado' : 'Clase en curso'}
      </p>
    </div>
  )
}
