import { getClassById, deleteClass, updateClassStatus, getClassStats } from '@/modules/classes/classes.actions'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AttendanceDistribution } from '@/components/charts/attendance-distribution'
import { StudentAttendanceTable } from '@/components/classes/student-attendance-table'
import { PeriodProgress } from '@/components/classes/period-progress'
import { ClassTimeline } from '@/components/classes/class-timeline'
import { ClassTimer } from '@/components/classes/class-timer'
import { ClassNotes } from '@/components/classes/class-notes'
import { ClassMoments } from '@/components/classes/class-moments'
import {
  Edit, ClipboardCheck, CalendarDays, Users,
  Target, Lightbulb, ListChecks, BookOpen, ClipboardList, FileCheck2,
  Timer, LineChart, Play, Flag, BookMarked, NotebookPen,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type PageProps = { params: Promise<{ id: string }> }

const statusLabels: Record<string, string> = {
  PLANNED: 'Planificada', IN_PROGRESS: 'En curso', DONE: 'Realizada', CANCELLED: 'Cancelada',
}

const statusColors: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  DONE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const timeStructure = [
  { label: 'Iniciación', pct: 10 },
  { label: 'Desarrollo', pct: 70 },
  { label: 'Cierre', pct: 20 },
]

function PlanSection({ icon: Icon, title, content }: { icon: typeof Target; title: string; content: string | null | undefined }) {
  if (!content) return null
  return (
    <div className="flex gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-1">{title}</h4>
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getClassById(id)
  if (!result.success) { notFound() }
  const cls = result.data

  const statsResult = await getClassStats(id)
  const stats = statsResult.success ? statsResult.data : null

  const presentCount = cls.attendanceRecords.filter((r) => r.status === 'PRESENT').length
  const absentCount = cls.attendanceRecords.filter((r) => r.status === 'ABSENT').length
  const lateCount = cls.attendanceRecords.filter((r) => r.status === 'LATE').length
  const recordedCount = cls.attendanceRecords.length
  const registered = cls.group.students.length

  const historyByStudent = new Map<string, { present: number; absent: number; late: number }>()
  for (const row of stats?.studentHistory ?? []) {
    const entry = historyByStudent.get(row.studentId) ?? { present: 0, absent: 0, late: 0 }
    if (row.status === 'PRESENT') entry.present += row._count._all
    else if (row.status === 'ABSENT') entry.absent += row._count._all
    else if (row.status === 'LATE') entry.late += row._count._all
    historyByStudent.set(row.studentId, entry)
  }

  const attendanceData = [
    { name: 'PRESENT', value: presentCount },
    { name: 'LATE', value: lateCount },
    { name: 'ABSENT', value: absentCount },
  ]

  const periodDone = stats?.periodClasses.find((s) => s.status === 'DONE')?._count._all ?? 0
  const periodPlanned =
    (stats?.periodClasses.find((s) => s.status === 'PLANNED')?._count._all ?? 0) +
    (stats?.periodClasses.find((s) => s.status === 'IN_PROGRESS')?._count._all ?? 0)
  const periodName = cls.period?.name

  const isDone = cls.status === 'DONE'
  const isInProgress = cls.status === 'IN_PROGRESS'
  const showDevelopment = isInProgress || isDone
  const hasAnalysis = isDone || recordedCount > 0

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
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(new Date(cls.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            {cls.startTime && ` · ${cls.startTime}`}
            {cls.endTime && ` - ${cls.endTime}`}
            {cls.duration && (
              <span className="inline-flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" /> {cls.duration} min
              </span>
            )}
            {cls.startedAt && (
              <span className="inline-flex items-center gap-1">
                · Iniciada {format(new Date(cls.startedAt), 'HH:mm')}
              </span>
            )}
            {cls.endedAt && (
              <span className="inline-flex items-center gap-1">
                · Terminada {format(new Date(cls.endedAt), 'HH:mm')}
              </span>
            )}
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
            <p className="text-2xl font-bold">{registered}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{recordedCount}/{registered}</p>
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
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Plan de clase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cls.lessonPlan ? (
              <div className="space-y-5">
                <PlanSection icon={Target} title="Competencias / Capacidades" content={cls.lessonPlan.competences} />
                <PlanSection icon={BookOpen} title="Objetivos de aprendizaje" content={cls.lessonPlan.objectives} />
                <PlanSection icon={Lightbulb} title="Metodología" content={cls.lessonPlan.methodology} />
                <PlanSection icon={ClipboardList} title="Actividades" content={cls.lessonPlan.activities} />
                <PlanSection icon={BookOpen} title="Recursos / Materiales" content={cls.lessonPlan.resources} />
                <PlanSection icon={FileCheck2} title="Criterios de evaluación" content={cls.lessonPlan.evaluationCriteria} />
                <PlanSection icon={ClipboardCheck} title="Tarea / Evaluación" content={cls.lessonPlan.homework} />

                {cls.duration && (
                  <div className="rounded-lg border border-border/60 p-3 space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <BookMarked className="h-3.5 w-3.5" /> Estructura temporal sugerida
                    </h4>
                    {timeStructure.map((t) => {
                      const minutes = Math.round((cls.duration ?? 0) * (t.pct / 100))
                      return (
                        <div key={t.label} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{t.label}</span>
                            <span className="text-muted-foreground tabular-nums">
                              {minutes} min · {t.pct}%
                            </span>
                          </div>
                          <Progress value={t.pct} className="h-1.5 [&>div]:bg-primary/60" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sin plan de clase registrado</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-liquid">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Asistencia de la clase ({recordedCount}/{registered})
              </CardTitle>
              <Button render={<Link href={`/classes/${id}/attendance`} />} variant="outline" size="xs">
                <ClipboardCheck className="h-3 w-3 mr-1" /> Tomar
              </Button>
            </CardHeader>
            <CardContent>
              <AttendanceDistribution data={attendanceData} />
            </CardContent>
          </Card>

          {isInProgress && (
            <Card className="glass-liquid">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Clase en curso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClassTimer startedAt={cls.startedAt?.toISOString() ?? new Date().toISOString()} duration={cls.duration} />
              </CardContent>
            </Card>
          )}

          {showDevelopment && (
            <Card className="glass-liquid">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Momentos de la clase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClassMoments
                  classSessionId={id}
                  completed={cls.momentsCompleted}
                  disabled={!isInProgress}
                />
              </CardContent>
            </Card>
          )}

          {showDevelopment && (
            <Card className="glass-liquid">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <NotebookPen className="h-4 w-4" />
                  Registro de la clase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClassNotes
                  classSessionId={id}
                  initialNotes={cls.notes}
                  disabled={!isInProgress}
                />
              </CardContent>
            </Card>
          )}

          {isDone && (
            <Card className="glass-liquid">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  Balance de la clase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cls.lessonPlan?.achievedObjectives && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" /> Logros de la clase
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{cls.lessonPlan.achievedObjectives}</p>
                  </div>
                )}
                {cls.lessonPlan?.observations && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5" /> Observaciones
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{cls.lessonPlan.observations}</p>
                  </div>
                )}
                {!cls.lessonPlan?.achievedObjectives && !cls.lessonPlan?.observations && (
                  <p className="text-sm text-muted-foreground">
                    Aún no registras el balance de la clase.{' '}
                    <Link href={`/classes/${id}/edit`} className="text-primary hover:underline">
                      Añadir logros y observaciones
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {hasAnalysis && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Análisis de la clase
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-liquid">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Historial de asistencia por estudiante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StudentAttendanceTable
                  students={cls.group.students.map((student) => {
                    const record = cls.attendanceRecords.find((r) => r.studentId === student.id)
                    return {
                      id: student.id,
                      firstName: student.firstName,
                      lastName: student.lastName,
                      currentStatus: record?.status ?? null,
                      history: historyByStudent.get(student.id) ?? { present: 0, absent: 0, late: 0 },
                    }
                  })}
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <PeriodProgress doneCount={periodDone} plannedCount={periodPlanned} periodName={periodName} />

              <Card className="glass-liquid">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Últimas clases del grupo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClassTimeline classes={stats?.recentClasses ?? []} currentId={id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {cls.status === 'PLANNED' && (
        <div className="flex gap-2 justify-center">
          <form action={async () => {
            'use server'
            await updateClassStatus(id, 'IN_PROGRESS')
          }}>
            <Button type="submit" size="sm">
              <Play className="h-4 w-4 mr-1" /> Iniciar clase
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

      {cls.status === 'IN_PROGRESS' && (
        <div className="flex gap-2 justify-center">
          <form action={async () => {
            'use server'
            await updateClassStatus(id, 'DONE')
          }}>
            <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
              <Flag className="h-4 w-4 mr-1" /> Finalizar clase
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
