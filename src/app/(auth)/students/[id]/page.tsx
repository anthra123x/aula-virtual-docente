import { getStudentById, deleteStudent } from '@/modules/students/students.actions'
import { FileText, Plus, Edit, CalendarDays, GraduationCap, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Ausente',
  LATE: 'Tardanza',
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'text-green-600 dark:text-green-400',
  ABSENT: 'text-red-600 dark:text-red-400',
  LATE: 'text-amber-600 dark:text-amber-400',
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getStudentById(id)

  if (!result.success) {
    notFound()
  }

  const student = result.data

  const attendanceSummary = student.attendanceRecords.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <button
        onClick={() => history.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            {student.lastName}, {student.firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            <Link href={`/courses/${student.group.course.id}`} className="hover:underline">
              {student.group.course.name}
            </Link>
            {' '}-{' '}
            <Link href={`/groups/${student.group.id}`} className="hover:underline">
              {student.group.name}
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button render={<Link href={`/students/${id}/edit`} />} variant="outline" size="sm">
            <Edit className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Editar</span>
          </Button>
          <DeleteButton
            action={deleteStudent}
            id={id}
            label="estudiante"
            description={`¿Eliminar a ${student.lastName}, ${student.firstName}?`}
          />
          <Button render={<Link href={`/observations/new?studentId=${id}`} />} size="sm">
            <Plus className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Observación</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{student.observations.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Clases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{student.attendanceRecords.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              Presente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{attendanceSummary.PRESENT || 0}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
              Ausente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{attendanceSummary.ABSENT || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {student.email && (
              <p>
                <span className="text-muted-foreground">Email:</span> {student.email}
              </p>
            )}
            {student.phone && (
              <p>
                <span className="text-muted-foreground">Teléfono:</span> {student.phone}
              </p>
            )}
            {!student.email && !student.phone && (
              <p className="text-muted-foreground text-center py-4">Sin información adicional</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observaciones ({student.observations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student.observations.length === 0 ? (
              <div className="text-center text-muted-foreground py-4 space-y-2">
                <FileText className="h-6 w-6 mx-auto opacity-40" />
                <p className="text-sm">Sin observaciones registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {student.observations.slice(0, 5).map((obs, i) => (
                  <div
                    key={obs.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <Link href={`/observations/${obs.id}`}>
                      <div className="border border-border/60 rounded-lg p-3 hover:bg-muted/30 transition-colors space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant={obs.type === 'ACADEMIC' ? 'default' : 'destructive'}>
                            {obs.type === 'ACADEMIC' ? 'Académica' : 'Comportamiento'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {obs.createdAt.toLocaleDateString('es-ES', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{obs.description}</p>
                      </div>
                    </Link>
                  </div>
                ))}
                {student.observations.length > 5 && (
                  <Link
                    href={`/observations?studentId=${id}`}
                    className="text-xs text-primary hover:underline block text-center"
                  >
                    Ver todas las {student.observations.length} observaciones
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {student.attendanceRecords.length > 0 && (
        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Últimas clases ({student.attendanceRecords.length} registros)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {student.attendanceRecords.map((rec, i) => (
                <Link
                  key={rec.id}
                  href={`/classes/${rec.classSession.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-sm animate-fade-in"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <span className="text-muted-foreground min-w-[80px]">
                    {new Date(rec.classSession.date).toLocaleDateString('es-ES', {
                      day: '2-digit', month: '2-digit',
                    })}
                  </span>
                  <span className={`font-medium ${STATUS_COLORS[rec.status] || ''}`}>
                    {STATUS_LABELS[rec.status] || rec.status}
                  </span>
                  {rec.classSession.topic && (
                    <span className="text-muted-foreground truncate">— {rec.classSession.topic}</span>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
