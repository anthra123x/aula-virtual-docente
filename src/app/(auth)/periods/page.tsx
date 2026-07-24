import { requireAuth } from '@/modules/auth/auth.actions'
import { getPeriods, deletePeriod } from '@/modules/periods/periods.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteButton } from '@/components/ui/delete-button'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, CalendarDays, GraduationCap, Clock } from 'lucide-react'
import Link from 'next/link'

type PageProps = { searchParams: Promise<{ q?: string }> }

export default async function PeriodsPage({ searchParams }: PageProps) {
  const user = await requireAuth()
  const { q } = await searchParams

  const result = await getPeriods()
  const periods = result.success ? result.data : []

  const now = new Date()

  const filtered = q
    ? periods.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          String(p.year).includes(q)
      )
    : periods

  const activePeriod = periods.find((p) => p.startDate <= now && p.endDate >= now)
  const totalClassesInActive = activePeriod?._count.classSessions ?? 0
  const totalClassesAll = periods.reduce((sum, p) => sum + p._count.classSessions, 0)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Períodos académicos</h1>
          <p className="text-sm text-muted-foreground">Configura los bimestres del año escolar</p>
        </div>
        <Button render={<Link href="/periods/new" />} size="sm">
          <Plus className="h-4 w-4 md:mr-1" />
          <span className="hidden md:inline">Nuevo período</span>
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
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
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Activo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activePeriod ? activePeriod.name : '—'}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Clases activo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalClassesInActive}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clases total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalClassesAll}</p>
          </CardContent>
        </Card>
      </div>

      <form className="relative max-w-md">
        <input
          name="q"
          defaultValue={q || ''}
          placeholder="Buscar por nombre o año..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((period, i) => {
          const isActive = period.startDate <= now && period.endDate >= now
          return (
            <Link
              key={period.id}
              href={`/periods/${period.id}`}
              className="animate-fade-in block"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <Card className={`card-hover glass-liquid ${isActive ? 'ring-2 ring-primary/30' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {period.name}
                        {isActive && (
                          <Badge variant="default" className="text-xs">Activo</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        <CalendarDays className="h-3 w-3 inline mr-1" />
                        {period.startDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        {' — '}
                        {period.endDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <DeleteButton action={deletePeriod} id={period.id} size="icon-xs" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      Año {period.year}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {period._count.classSessions} clase(s)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}

        {filtered.length === 0 && (
          <Card className="col-span-full glass-liquid">
            <CardContent className="py-12 text-center text-muted-foreground space-y-2">
              <CalendarDays className="h-8 w-8 mx-auto opacity-40" />
              {q ? (
                <p>No se encontraron períodos con ese criterio de búsqueda.</p>
              ) : (
                <>
                  <p>Aún no has configurado períodos académicos.</p>
                  <Button render={<Link href="/periods/new" />} variant="outline" size="sm">
                    Crear primer período
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
