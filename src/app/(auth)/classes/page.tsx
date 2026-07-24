export const dynamic = 'force-dynamic'

import { getClasses } from '@/modules/classes/classes.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, CalendarDays, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const statusLabels: Record<string, string> = {
  PLANNED: 'Planificada',
  DONE: 'Realizada',
  CANCELLED: 'Cancelada',
}

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const result = await getClasses()
  const allClasses = result.success ? result.data : []
  const { q } = await searchParams

  const filtered = q
    ? allClasses.filter(
        (c) =>
          c.topic.toLowerCase().includes(q.toLowerCase()) ||
          c.group.name.toLowerCase().includes(q.toLowerCase()) ||
          c.group.course.name.toLowerCase().includes(q.toLowerCase())
      )
    : allClasses

  const totalRealized = filtered.filter((c) => c.status === 'DONE').length
  const totalPlanned = filtered.filter((c) => c.status === 'PLANNED').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Clases</h1>
          <p className="text-sm text-muted-foreground">Planifica y gestiona tus clases</p>
        </div>
        <Button render={<Link href="/classes/new" />} size="sm">
          <Plus className="h-4 w-4 md:mr-1" />
          <span className="hidden md:inline">Nueva clase</span>
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
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRealized}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Planificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPlanned}</p>
          </CardContent>
        </Card>
      </div>

      <form className="relative">
        <input
          name="q"
          defaultValue={q || ''}
          placeholder="Buscar clases por tema, grupo o materia..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </form>

      {filtered.length === 0 ? (
        <Card className="glass-liquid">
          <CardContent className="py-12 text-center text-muted-foreground space-y-2">
            <CalendarDays className="h-8 w-8 mx-auto opacity-40" />
            {q ? (
              <p>No se encontraron clases con &quot;{q}&quot;</p>
            ) : (
              <>
                <p>No hay clases registradas.</p>
                <Button render={<Link href="/classes/new" />} variant="outline" size="sm">
                  Planificar primera clase
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((cls, i) => (
            <Link
              key={cls.id}
              href={`/classes/${cls.id}`}
              className="animate-fade-in block"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <Card className="card-hover glass-liquid">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{cls.topic}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {statusLabels[cls.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {cls.group.course.name} - {cls.group.name} ·{' '}
                        {format(new Date(cls.date), "d 'de' MMM", { locale: es })}
                        {cls.startTime && ` · ${cls.startTime}`}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground shrink-0">
                      {cls._count.attendanceRecords} asistencias
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
