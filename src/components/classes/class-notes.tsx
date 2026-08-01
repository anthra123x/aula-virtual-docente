'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { addClassNote, deleteClassNote } from '@/modules/classes/classes.actions'
import { Plus, Trash2 } from 'lucide-react'

export type ClassNoteItem = {
  id: string
  stage: string
  note: string
  createdAt: Date
}

const stageMeta: Record<string, { label: string; color: string }> = {
  INICIO: { label: 'Inicio', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  DESARROLLO: { label: 'Desarrollo', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' },
  CIERRE: { label: 'Cierre', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  INCIDENCIA: { label: 'Incidencia', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
}

export function ClassNotes({
  classSessionId,
  initialNotes,
  disabled = false,
}: {
  classSessionId: string
  initialNotes: ClassNoteItem[]
  disabled?: boolean
}) {
  const [stage, setStage] = useState('DESARROLLO')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSaving(true)
    const result = await addClassNote(classSessionId, formData)
    setSaving(false)
    if (!result.success) { setError(result.error); return }
    setNote('')
  }

  async function handleDelete(noteId: string) {
    await deleteClassNote(noteId, classSessionId)
  }

  return (
    <div className="space-y-4">
      {!disabled && (
        <form action={handleSubmit} className="space-y-2">
          <input type="hidden" name="stage" value={stage} />
          <Select value={stage} onValueChange={(v) => typeof v === 'string' && setStage(v)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INICIO">Inicio</SelectItem>
              <SelectItem value="DESARROLLO">Desarrollo</SelectItem>
              <SelectItem value="CIERRE">Cierre</SelectItem>
              <SelectItem value="INCIDENCIA">Incidencia</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Registra el avance de la clase: lo que ocurrió, dificultades, participación..."
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Los registros quedan con fecha y hora</p>
            <Button type="submit" size="sm" disabled={saving || !note.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              {saving ? 'Guardando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {initialNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          Sin registros todavía{disabled ? '.' : ' durante la clase.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {initialNotes.map((n) => {
            const meta = stageMeta[n.stage] ?? { label: n.stage, color: 'bg-muted text-muted-foreground' }
            const date = new Date(n.createdAt)
            return (
              <li key={n.id} className="rounded-lg border border-border/60 p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {date.toLocaleDateString('es', { day: '2-digit', month: 'short' })}{' '}
                      {date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Eliminar registro"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{n.note}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
