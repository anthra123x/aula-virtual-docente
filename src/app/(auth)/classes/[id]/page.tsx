import { getClassById, deleteClass, updateClassStatus } from '@/modules/classes/classes.actions'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, ClipboardCheck, CheckCircle2, XCircle, Clock, CalendarDays, Users } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type PageProps = { params: Promise<{ id: string }> }

const statusLabels: Record<string, string> = {
  PLANNED: 'Planificada', DONE: 'Realizada', CANCELLED: 'Cancelada',
}

const statusColors: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  DONE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const attendanceLabels: Record<string, string> = {
  PRESENT: 'Presente', ABSENT: 'Ausente', LATE: 'Tardanza',
}

const attendanceIcons: Record<string, typeof CheckCircle2> = {
  PRESENT: CheckCircle2, ABSENT: XCircle, LATE: Clock,
}

const attendanceColors: Record<string, string> = {
  PRESENT: 'text-green-600 dark:text-green-400',
  ABSENT: 'text-red-600 dark:text-red-400',
  LATE: 'text-amber-600 dark:text-amber-400',
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getClassById(id)
  if (!result.success) { notFound() }
  const cls = result.data

  const presentCount = cls.attendanceRecords.filter((r) => r.status === 'PRESENT').length
  const absentCount = cls.attendanceRecords.filter((r) => r.status === 'ABSENT').length
  const lateCount = cls.attendanceRecords.filter((r) => r.status === 'LATE').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[cls.status]}`}>
              {statusLabels[cls.status]}
            </span>
            <span className="text-sm text-muted-foreground">
              <Link href={`/courses/${cls.group.course.id}`} className="hover:underline">
                {cls.group.course.name}
              </Link>
              {' - '}
              <Link href={`/groups/${cls.group.id}`} className="hover:underline">
                {cls.group.name}
              </Link>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">{cls.topic}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(cls.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            {cls.startTime && ` · ${cls.startTime}`}
            {cls.endTime && ` - ${cls.endTime}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button render={<Link href={`/classes/${id}/edit`} />} variant="outline" size="sm">
            <Edit className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Editar</span>
          </Button>
          <DeleteButton action={deleteClass} id={id} label="clase" />
          <Button render={<Link href={`/classes/${id}/attendance`} />} size="sm">
            <ClipboardCheck className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Asistencia</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cls.group.students.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cls.attendanceRecords.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Presentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{presentCount}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Ausentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{absentCount + lateCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-liquid">
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
              <p className="text-sm text-muted-foreground text-center py-4">Sin plan de clase registrado</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Asistencia ({cls.attendanceRecords.length}/{cls.group.students.length})</span>
              <Button render={<Link href={`/classes/${id}/attendance`} />} variant="outline" size="xs">
                <ClipboardCheck className="h-3 w-3 mr-1" /> Tomar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {cls.group.students.map((student, i) => {
                const record = cls.attendanceRecords.find((r) => r.studentId === student.id)
                const Icon = record ? attendanceIcons[record.status] : null
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between text-sm py-1.5 animate-fade-in"
                    style={{ animationDelay: `${i * 0.02}s` }}
                  >
                    <span>{student.lastName}, {student.firstName}</span>
                    {record ? (
                      <span className={`flex items-center gap-1 ${attendanceColors[record.status]}`}>
                        {Icon && <Icon className="h-4 w-4" />}
                        {attendanceLabels[record.status]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Sin registro</span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {cls.status === 'PLANNED' && (
        <div className="flex gap-2 justify-center">
          <form action={async () => {
            'use server'
            await updateClassStatus(id, 'DONE')
          }}>
            <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
              ✓ Finalizar clase
            </Button>
          </form>
          <form action={async () => {
            'use server'
            await updateClassStatus(id, 'CANCELLED')
          }}>
            <Button type="submit" variant="outline" size="sm">
              Cancelar clase
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
