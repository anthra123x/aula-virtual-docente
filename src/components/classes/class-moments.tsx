'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleClassMoment } from '@/modules/classes/classes.actions'
import { Check, Circle } from 'lucide-react'

const moments: { id: string; label: string; desc: string }[] = [
  { id: 'INICIO', label: 'Iniciación', desc: 'Presentar objetivos y activar saberes previos' },
  { id: 'DESARROLLO', label: 'Desarrollo', desc: 'Actividades principales y construcción del aprendizaje' },
  { id: 'CIERRE', label: 'Cierre', desc: 'Síntesis, retroalimentación y evaluación' },
]

export function ClassMoments({
  classSessionId,
  completed,
  disabled = false,
}: {
  classSessionId: string
  completed: string[]
  disabled?: boolean
}) {
  const [pending, setPending] = useState<string | null>(null)

  async function handleToggle(momentId: string) {
    setPending(momentId)
    await toggleClassMoment(classSessionId, momentId as 'INICIO' | 'DESARROLLO' | 'CIERRE')
    setPending(null)
  }

  return (
    <ul className="space-y-2">
      {moments.map((m) => {
        const isDone = completed.includes(m.id)
        return (
          <li key={m.id} className="flex items-start gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={disabled || pending === m.id}
              onClick={() => handleToggle(m.id)}
              className="mt-0.5 shrink-0"
              aria-label={`Marcar momento ${m.label}`}
            >
              {isDone
                ? <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                : <Circle className="h-4 w-4 text-muted-foreground/50" />}
            </Button>
            <div className="min-w-0">
              <p className={`text-sm font-medium ${isDone ? 'text-green-600 dark:text-green-400' : ''}`}>
                {m.label}
                {isDone && <span className="ml-1 text-xs text-muted-foreground">· completado</span>}
              </p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
