import { requireAuth } from '@/modules/auth/auth.actions'
import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function CoursesPage() {
  const user = await requireAuth()
  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
    include: { _count: { select: { groups: true } } },
  })

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-clay-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
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
                <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
              )}
              <Button render={<Link href={`/courses/${course.id}`} />} variant="outline" size="sm" className="mt-3">
                Ver grupos
              </Button>
            </CardContent>
          </Card>
        ))}

        {courses.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Aún no tienes materias. ¡Crea tu primera materia!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
