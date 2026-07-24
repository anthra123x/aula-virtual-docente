export const dynamic = 'force-dynamic'

import { getObservations, getObservationFilters, deleteObservation } from '@/modules/observations/observations.actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteButton } from '@/components/ui/delete-button'
import { Edit, FileText, Plus } from 'lucide-react'
import { ObservationsFilters } from './_components/observations-filters'
import Link from 'next/link'

type PageProps = {
  searchParams: Promise<{
    q?: string
    type?: string
    courseId?: string
    groupId?: string
  }>
}

export default async function ObservationsPage({ searchParams }: PageProps) {
  const { q, type, courseId, groupId } = await searchParams
  const filters = { type, courseId, groupId: groupId || undefined }

  const [obsResult, filtersResult] = await Promise.all([
    getObservations(filters.type ? { type: filters.type, courseId: filters.courseId, groupId: filters.groupId } : undefined),
    getObservationFilters(),
  ])

  const all = obsResult.success ? obsResult.data : []
  const courses = filtersResult.success ? filtersResult.data : []

  const filtered = q
    ? all.filter(
        (o) =>
          o.description.toLowerCase().includes(q.toLowerCase()) ||
          o.student.lastName.toLowerCase().includes(q.toLowerCase()) ||
          o.student.firstName.toLowerCase().includes(q.toLowerCase()) ||
          o.student.group.name.toLowerCase().includes(q.toLowerCase()) ||
          o.student.group.course.name.toLowerCase().includes(q.toLowerCase())
      )
    : all

  const academicCount = filtered.filter((o) => o.type === 'ACADEMIC').length
  const behaviorCount = filtered.filter((o) => o.type === 'BEHAVIOR').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Observaciones</h1>
          <p className="text-sm text-muted-foreground">Registro académico y de comportamiento</p>
        </div>
        <Button render={<Link href="/observations/new" />} size="sm">
          <Plus className="h-4 w-4 md:mr-1" />
          <span className="hidden md:inline">Nueva observación</span>
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-3">
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Académicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{academicCount}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Comportamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{behaviorCount}</p>
          </CardContent>
        </Card>
      </div>

      <ObservationsFilters courses={courses} />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="glass-liquid">
            <CardContent className="py-12 text-center text-muted-foreground space-y-2">
              <FileText className="h-8 w-8 mx-auto opacity-40" />
              {q || type || courseId ? (
                <p>No se encontraron observaciones con los filtros seleccionados</p>
              ) : (
                <>
                  <p>No hay observaciones registradas.</p>
                  <Button render={<Link href="/observations/new" />} variant="outline" size="sm">
                    Crear primera observación
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          filtered.map((obs, i) => (
            <Link
              key={obs.id}
              href={`/observations/${obs.id}`}
              className="animate-fade-in block"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <Card className="card-hover glass-liquid">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/students/${obs.student.id}`}
                          className="font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {obs.student.lastName}, {obs.student.firstName}
                        </Link>
                        <Badge variant={obs.type === 'ACADEMIC' ? 'default' : 'destructive'} className="text-xs">
                          {obs.type === 'ACADEMIC' ? 'Académica' : 'Comportamiento'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {obs.student.group.course.name} - {obs.student.group.name} ·{' '}
                        {obs.createdAt.toLocaleDateString('es-ES', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        render={<Link href={`/observations/${obs.id}/edit`} />}
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <DeleteButton action={deleteObservation} id={obs.id} size="icon-xs" />
                    </div>
                  </div>
                  <p className="text-sm mt-3 whitespace-pre-wrap line-clamp-2 text-muted-foreground">{obs.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
