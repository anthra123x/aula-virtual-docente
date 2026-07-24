import { getPeriodById, deletePeriod } from '@/modules/periods/periods.actions'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, ArrowLeft, CalendarDays, GraduationCap, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

type PageProps = { params: Promise<{ id: string }> }

export default async function PeriodDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getPeriodById(id)
  if (!result.success) { notFound() }
  const period = result.data

  const now = new Date()
  const isActive = period.startDate <= now && period.endDate >= now

  const doneCount = period.classSessions.filter((s) => s.status === 'DONE').length
  const cancelledCount = period.classSessions.filter((s) => s.status === 'CANCELLED').length
  const plannedCount = period.classSessions.filter((s) => s.status === 'PLANNED').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Link
        href="/periods"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            {period.name}
            {isActive && <Badge>Activo</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground">
            <CalendarDays className="h-3 w-3 inline mr-1" />
            {period.startDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            {' — '}
            {period.endDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href={`/periods/${id}/edit`} />} variant="outline" size="sm">
            <Edit className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Editar</span>
          </Button>
          <DeleteButton action={deletePeriod} id={id} label="período" />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total clases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{period._count.classSessions}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{doneCount}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Planificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{plannedCount}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Canceladas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cancelledCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>Año {period.year}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24))} días de duración
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isActive ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : period.endDate < now ? (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Clock className="h-4 w-4 text-blue-500" />
              )}
              <span>
                {isActive ? 'En curso' : period.endDate < now ? 'Finalizado' : 'Próximo'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Clases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {period._count.classSessions === 0 ? (
              <p className="text-muted-foreground">
                No hay clases registradas en este período.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span>Realizadas</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{doneCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Planificadas</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{plannedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Canceladas</span>
                  <span className="font-medium text-destructive">{cancelledCount}</span>
                </div>
                {period._count.classSessions > 0 && (
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden mt-2">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(doneCount / period._count.classSessions) * 100}%` }}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
