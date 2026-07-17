'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { saveAttendance } from '@/modules/attendance/attendance.actions'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

type Student = {
  id: string
  firstName: string
  lastName: string
}

type AttendanceRecord = {
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE'
  student: { id: string; firstName: string; lastName: string }
}

type Props = {
  classSessionId: string
  students: Student[]
  existingRecords: AttendanceRecord[]
}

export function AttendanceForm({ classSessionId, students, existingRecords }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>(() => {
    const initial: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {}
    for (const student of students) {
      const existing = existingRecords.find((r) => r.studentId === student.id)
      initial[student.id] = existing ? existing.status : 'PRESENT'
    }
    return initial
  })

  async function handleSubmit() {
    setSaving(true)
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status: status as 'PRESENT' | 'ABSENT' | 'LATE',
    }))

    const result = await saveAttendance(classSessionId, records)

    if (!result.success) {
      alert(result.error)
    } else {
      router.push(`/classes/${classSessionId}`)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <span className="font-medium">
                {student.lastName}, {student.firstName}
              </span>
              <div className="flex gap-1">
                {(['PRESENT', 'ABSENT', 'LATE'] as const).map((status) => {
                  const isSelected = attendance[student.id] === status
                  const icons = {
                    PRESENT: <CheckCircle2 className="h-4 w-4" />,
                    ABSENT: <XCircle className="h-4 w-4" />,
                    LATE: <Clock className="h-4 w-4" />,
                  }
                  const labels = { PRESENT: 'Presente', ABSENT: 'Ausente', LATE: 'Tardanza' }
                  const colors = {
                    PRESENT: 'text-green-600 border-green-300 bg-green-50',
                    ABSENT: 'text-red-600 border-red-300 bg-red-50',
                    LATE: 'text-yellow-600 border-yellow-300 bg-yellow-50',
                  }

                  return (
                    <Label
                      key={status}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md border text-sm cursor-pointer transition-colors ${
                        isSelected ? colors[status] : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        value={status}
                        checked={isSelected}
                        onChange={() =>
                          setAttendance((prev) => ({ ...prev, [student.id]: status }))
                        }
                        className="sr-only"
                      />
                      {icons[status]}
                      {labels[status]}
                    </Label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

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
