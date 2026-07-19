import { requireAuth } from '@/modules/auth/auth.actions'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CalendarDays, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function GroupsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Grupos</h1>
          <p className="text-sm text-muted-foreground">Todos tus grupos organizados por materia</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Aún no tienes materias. <Link href="/courses/new" className="underline hover:text-primary">Crea tu primera materia</Link></p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {courses.map((course) => (
            <div key={course.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: course.color }} />
                <h2 className="text-lg font-semibold">{course.name}</h2>
              </div>

              {course.groups.length === 0 ? (
                <p className="text-sm text-muted-foreground ml-5">
                  Sin grupos. <Link href={`/courses/${course.id}`} className="underline hover:text-primary">Crear grupo</Link>
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {course.groups.map((group) => (
                    <Link key={group.id} href={`/groups/${group.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{group.name}</CardTitle>
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
