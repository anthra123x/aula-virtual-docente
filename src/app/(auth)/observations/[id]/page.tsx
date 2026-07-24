import { getObservationById, getObservations, deleteObservation } from '@/modules/observations/observations.actions'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, ArrowLeft, User, FileText, Plus, Clock } from 'lucide-react'
import Link from 'next/link'

type PageProps = { params: Promise<{ id: string }> }

export default async function ObservationDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getObservationById(id)
  if (!result.success) { notFound() }
  const obs = result.data

  const historyResult = await getObservations({ studentId: obs.studentId })
  const studentHistory = historyResult.success
    ? historyResult.data.filter((o) => o.id !== id).slice(0, 5)
    : []

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Link
        href="/observations"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Observación</h1>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href={`/observations/new?studentId=${obs.studentId}`} />} variant="outline" size="sm">
            <Plus className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Nueva para este estudiante</span>
          </Button>
          <Button render={<Link href={`/observations/${id}/edit`} />} variant="outline" size="sm">
            <Edit className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Editar</span>
          </Button>
          <DeleteButton action={deleteObservation} id={id} label="observación" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Estudiante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Link href={`/students/${obs.student.id}`} className="font-medium hover:underline text-base block">
              {obs.student.lastName}, {obs.student.firstName}
            </Link>
            <p className="text-muted-foreground">
              {obs.student.group.course.name} - {obs.student.group.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {obs.student._count.observations} observación(es) en total
            </p>
          </CardContent>
        </Card>

        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detalles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={obs.type === 'ACADEMIC' ? 'default' : 'destructive'}>
                {obs.type === 'ACADEMIC' ? 'Académica' : 'Comportamiento'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Creada: {obs.createdAt.toLocaleDateString('es-ES', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-liquid">
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{obs.description}</p>
        </CardContent>
      </Card>

      {studentHistory.length > 0 && (
        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Historial de observaciones de {obs.student.firstName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {studentHistory.map((h) => (
              <Link
                key={h.id}
                href={`/observations/${h.id}`}
                className="block p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={h.type === 'ACADEMIC' ? 'default' : 'destructive'} className="text-xs">
                        {h.type === 'ACADEMIC' ? 'Académica' : 'Comportamiento'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {h.createdAt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2 text-muted-foreground">{h.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
