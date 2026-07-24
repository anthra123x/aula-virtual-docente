import { getCourses } from '@/modules/courses/courses.actions'
import { Plus, Search, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const result = await getCourses()
  const courses = result.success ? result.data : []

  const { q } = await searchParams
  const filtered = q
    ? courses.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(q.toLowerCase()))
      )
    : courses

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Materias</h1>
          <p className="text-sm text-muted-foreground">Gestiona tus materias y grupos</p>
        </div>
        <Button render={<Link href="/courses/new" />} size="sm">
          <Plus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Nueva materia</span>
        </Button>
      </div>

      <form className="relative">
        <input
          name="q"
          defaultValue={q || ''}
          placeholder="Buscar materias..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course, i) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="animate-fade-in block"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <Card className="card-hover glass-liquid h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: course.color }}
                  />
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {course._count.groups} grupo{course._count.groups !== 1 ? 's' : ''}
                </p>
                {course.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}

        {filtered.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              {q ? (
                <p>No se encontraron materias con &quot;{q}&quot;</p>
              ) : (
                <div className="space-y-2">
                  <BookOpen className="h-8 w-8 mx-auto opacity-40" />
                  <p>Aún no tienes materias. ¡Crea tu primera materia!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
