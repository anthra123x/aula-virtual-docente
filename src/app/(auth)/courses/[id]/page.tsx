import { getCourseById, deleteCourse } from '@/modules/courses/courses.actions'
import { Plus, Edit, Trash2, Users, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getCourseById(id)

  if (!result.success) {
    notFound()
  }

  const course = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: course.color }} />
          <div>
            <h1 className="text-2xl font-bold">{course.name}</h1>
            {course.description && (
              <p className="text-muted-foreground">{course.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href={`/courses/${id}/edit`} />} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <form action={deleteCourse.bind(null, id)}>
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </form>
          <Button render={<Link href={`/courses/${id}/groups/new`} />} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo grupo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {course.groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="text-lg">{group.name}</CardTitle>
              {group.grade && (
                <p className="text-sm text-muted-foreground">{group.grade}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {group._count.students} estudiantes
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {group._count.classSessions} clases
                </span>
              </div>
              <div className="flex gap-2">
                <Button render={<Link href={`/groups/${group.id}`} />} variant="outline" size="sm">
                  Ver grupo
                </Button>
                <Button render={<Link href={`/classes/new?groupId=${group.id}`} />} variant="outline" size="sm">
                  Planificar clase
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {course.groups.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No hay grupos en esta materia. ¡Crea tu primer grupo!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
