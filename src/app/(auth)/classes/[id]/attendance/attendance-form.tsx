'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { saveAttendance } from '@/modules/attendance/attendance.actions'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

type Student = { id: string; firstName: string; lastName: string }
type AttendanceRecord = {
  studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE'
  student: { id: string; firstName: string; lastName: string }
}
type Props = { classSessionId: string; students: Student[]; existingRecords: AttendanceRecord[] }

const statusConfig = {
  PRESENT: {
    label: 'Presente', icon: CheckCircle2,
    base: 'border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-400 dark:bg-green-950/30',
    hover: 'hover:border-green-300 hover:text-green-700 hover:bg-green-50 dark:hover:border-green-700 dark:hover:text-green-400 dark:hover:bg-green-950/30',
  },
  ABSENT: {
    label: 'Ausente', icon: XCircle,
    base: 'border-red-300 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-400 dark:bg-red-950/30',
    hover: 'hover:border-red-300 hover:text-red-700 hover:bg-red-50 dark:hover:border-red-700 dark:hover:text-red-400 dark:hover:bg-red-950/30',
  },
  LATE: {
    label: 'Tardanza', icon: Clock,
    base: 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:bg-amber-950/30',
    hover: 'hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 dark:hover:border-amber-700 dark:hover:text-amber-400 dark:hover:bg-amber-950/30',
  },
}

export function AttendanceForm({ classSessionId, students, existingRecords }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>(() => {
    const initial: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {}
    for (const student of students) {
      const existing = existingRecords.find((r) => r.studentId === student.id)
      initial[student.id] = existing ? existing.status : 'PRESENT'
    }
    return initial
  })

  async function handleSubmit() {
    setError(null)
    setSaving(true)
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId, status: status as 'PRESENT' | 'ABSENT' | 'LATE',
    }))
    const result = await saveAttendance(classSessionId, records)
    if (!result.success) {
      setError(result.error)
      setSaving(false)
    } else {
      router.push(`/classes/${classSessionId}`)
      router.refresh()
    }
  }

  function markAll(status: 'PRESENT' | 'ABSENT' | 'LATE') {
    const updated: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {}
    for (const student of students) {
      updated[student.id] = status
    }
    setAttendance(updated)
  }

  return (
    <Card className="glass-liquid">
      <CardContent className="pt-6">
        <div className="flex gap-2 mb-4">
          <Button type="button" variant="outline" size="xs" onClick={() => markAll('PRESENT')}>
            Todos presentes
          </Button>
          <Button type="button" variant="outline" size="xs" onClick={() => markAll('ABSENT')}>
            Todos ausentes
          </Button>
          <Button type="button" variant="outline" size="xs" onClick={() => markAll('LATE')}>
            Todos tardanza
          </Button>
        </div>

        <div className="space-y-3">
          {students.map((student) => {
            const current = attendance[student.id] || 'PRESENT'
            return (
              <div key={student.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="font-medium text-sm">{student.lastName}, {student.firstName}</span>
                <div className="flex gap-1">
                  {(['PRESENT', 'ABSENT', 'LATE'] as const).map((status) => {
                    const isSelected = current === status
                    const cfg = statusConfig[status]
                    const Icon = cfg.icon
                    return (
                      <Label key={status}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors
                          ${isSelected ? cfg.base : 'border-border text-muted-foreground hover:bg-muted/50'}`}
                      >
                        <input type="radio" name={`attendance-${student.id}`} value={status}
                          checked={isSelected}
                          onChange={() => setAttendance((prev) => ({ ...prev, [student.id]: status }))}
                          className="sr-only" />
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{cfg.label}</span>
                      </Label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {error && <p className="text-sm text-destructive mt-4">{error}</p>}

        <div className="flex gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar asistencia'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
