import { requireAuth } from '@/modules/auth/auth.actions'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CalendarDays, BookOpen, GraduationCap, Search } from 'lucide-react'
import Link from 'next/link'

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const user = await requireAuth()

  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
    include: {
      groups: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { students: true, classSessions: true } } },
      },
    },
  })

  const { q } = await searchParams

  const filteredCourses = courses
    .map((c) => ({
      ...c,
      groups: q
        ? c.groups.filter(
            (g) =>
              g.name.toLowerCase().includes(q.toLowerCase()) ||
              (g.grade && g.grade.toLowerCase().includes(q.toLowerCase())) ||
              c.name.toLowerCase().includes(q.toLowerCase())
          )
        : c.groups,
    }))
    .filter((c) => c.groups.length > 0)

  const totalGroups = courses.reduce((s, c) => s + c.groups.length, 0)
  const totalStudents = courses.reduce((s, c) => s + c.groups.reduce((ss, g) => ss + g._count.students, 0), 0)
  const totalClasses = courses.reduce((s, c) => s + c.groups.reduce((ss, g) => ss + g._count.classSessions, 0), 0)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Grupos</h1>
          <p className="text-sm text-muted-foreground">Todos tus grupos organizados por materia</p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-3 sm:grid-cols-3">
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Grupos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalGroups}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalClasses}</p>
          </CardContent>
        </Card>
      </div>

      <form className="relative">
        <input
          name="q"
          defaultValue={q || ''}
          placeholder="Buscar grupos o materias..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </form>

      {courses.length === 0 ? (
        <Card className="glass-liquid">
          <CardContent className="py-12 text-center text-muted-foreground space-y-2">
            <BookOpen className="h-8 w-8 mx-auto opacity-40" />
            <p>Aún no tienes materias.</p>
            <Button render={<Link href="/courses/new" />} variant="outline" size="sm">
              Crear primera materia
            </Button>
          </CardContent>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <Card className="glass-liquid">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto opacity-40 mb-2" />
            <p>No se encontraron grupos con &quot;{q}&quot;</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredCourses.map((course) => (
            <div key={course.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                <Link href={`/courses/${course.id}`} className="text-lg font-semibold hover:underline">
                  {course.name}
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {course.groups.map((group, i) => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="animate-fade-in block"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <Card className="card-hover glass-liquid h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                          <CardTitle className="text-base">{group.name}</CardTitle>
                        </div>
                        {group.grade && (
                          <p className="text-xs text-muted-foreground ml-6">{group.grade}</p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {group._count.students}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {group._count.classSessions} clases
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
