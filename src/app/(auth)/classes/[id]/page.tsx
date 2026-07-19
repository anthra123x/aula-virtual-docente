import { getClassById, deleteClass } from '@/modules/classes/classes.actions'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, ClipboardCheck, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type PageProps = {
  params: Promise<{ id: string }>
}

const statusLabels: Record<string, string> = {
  PLANNED: 'Planificada',
  DONE: 'Realizada',
  CANCELLED: 'Cancelada',
}

const statusColors: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const attendanceLabels: Record<string, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Ausente',
  LATE: 'Tardanza',
}

const attendanceColors: Record<string, string> = {
  PRESENT: 'text-green-600',
  ABSENT: 'text-red-600',
  LATE: 'text-yellow-600',
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getClassById(id)

  if (!result.success) {
    notFound()
  }

  const cls = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[cls.status]}`}>
              {statusLabels[cls.status]}
            </span>
            <span className="text-sm text-muted-foreground">
              {cls.group.course.name} - {cls.group.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{cls.topic}</h1>
          <p className="text-muted-foreground">
            {format(new Date(cls.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            {cls.startTime && ` · ${cls.startTime}`}
            {cls.endTime && ` - ${cls.endTime}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href={`/classes/${id}/edit`} />} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <DeleteButton action={deleteClass} id={id} label="clase" />
          <Button render={<Link href={`/classes/${id}/attendance`} />} size="sm">
            <ClipboardCheck className="h-4 w-4 mr-1" />
            Asistencia
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan de clase</CardTitle>
          </CardHeader>
          <CardContent>
            {cls.lessonPlan ? (
              <div className="space-y-4">
                {cls.lessonPlan.objectives && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Objetivos</h4>
                    <p className="text-sm whitespace-pre-wrap">{cls.lessonPlan.objectives}</p>
                  </div>
                )}
                {cls.lessonPlan.activities && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Actividades</h4>
                    <p className="text-sm whitespace-pre-wrap">{cls.lessonPlan.activities}</p>
                  </div>
                )}
                {cls.lessonPlan.resources && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Recursos</h4>
                    <p className="text-sm whitespace-pre-wrap">{cls.lessonPlan.resources}</p>
                  </div>
                )}
                {cls.lessonPlan.homework && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Tarea / Evaluación</h4>
                    <p className="text-sm whitespace-pre-wrap">{cls.lessonPlan.homework}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin plan de clase registrado</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Asistencia ({cls.attendanceRecords.length}/{cls.group.students.length})</span>
              <Button render={<Link href={`/classes/${id}/attendance`} />} variant="outline" size="xs">
                <ClipboardCheck className="h-3 w-3 mr-1" />
                Tomar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cls.group.students.map((student) => {
                const record = cls.attendanceRecords.find(
                  (r) => r.studentId === student.id,
                )
                return (
                  <div key={student.id} className="flex items-center justify-between text-sm py-1">
                    <span>
                      {student.lastName}, {student.firstName}
                    </span>
                    {record ? (
                      <span className={attendanceColors[record.status]}>
                        {record.status === 'PRESENT' && <CheckCircle2 className="h-4 w-4 inline mr-1" />}
                        {record.status === 'ABSENT' && <XCircle className="h-4 w-4 inline mr-1" />}
                        {record.status === 'LATE' && <Clock className="h-4 w-4 inline mr-1" />}
                        {attendanceLabels[record.status]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Sin registro</span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
