import { getCourseById, deleteCourse } from '@/modules/courses/courses.actions'
import { Plus, Edit, Users, CalendarDays, BookOpen, GraduationCap, UserPlus, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'
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
  const recentClasses = 'recentClasses' in course ? (course as any).recentClasses : []

  const totalStudents = course.groups.reduce((s: number, g: any) => s + g._count.students, 0)
  const totalClasses = course.groups.reduce((s: number, g: any) => s + g._count.classSessions, 0)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{course.name}</h1>
            {course.description && (
              <p className="text-sm text-muted-foreground">{course.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button render={<Link href={`/courses/${id}/edit`} />} variant="outline" size="sm">
            <Edit className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Editar</span>
          </Button>
          <DeleteButton action={deleteCourse} id={id} label="materia" />
          <Button render={<Link href={`/courses/${id}/groups/new`} />} size="sm">
            <Plus className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Nuevo grupo</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-3 md:grid-cols-3">
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Grupos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{course.groups.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Clases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalClasses}</p>
          </CardContent>
        </Card>
      </div>

      {course.groups.length === 0 ? (
        <Card className="glass-liquid">
          <CardContent className="py-12 text-center text-muted-foreground space-y-2">
            <BookOpen className="h-8 w-8 mx-auto opacity-40" />
            <p>Aún no hay grupos en esta materia.</p>
            <Button render={<Link href={`/courses/${id}/groups/new`} />} size="sm">
              Crear primer grupo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Grupos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {course.groups.map((group: any, i: number) => (
              <div
                key={group.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Card className="card-hover glass-liquid h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                      </div>
                      <Link
                        href={`/groups/${group.id}`}
                        className="text-xs text-primary hover:underline shrink-0"
                      >
                        Ver todo
                      </Link>
                    </div>
                    {group.grade && (
                      <p className="text-xs text-muted-foreground ml-6">{group.grade}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground ml-6">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {group._count.students} estudiantes
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {group._count.classSessions} clases
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {group.students.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Estudiantes</p>
                        {group.students.map((s: any) => (
                          <Link
                            key={s.id}
                            href={`/students/${s.id}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                            {s.lastName}, {s.firstName}
                          </Link>
                        ))}
                        {group._count.students > 5 && (
                          <Link
                            href={`/groups/${group.id}`}
                            className="text-xs text-primary hover:underline block mt-1"
                          >
                            ... y {group._count.students - 5} más
                          </Link>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Button
                        render={<Link href={`/groups/${group.id}/students/new`} />}
                        variant="outline"
                        size="sm"
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Agregar
                      </Button>
                      <Button
                        render={<Link href={`/groups/${group.id}/import`} />}
                        variant="outline"
                        size="sm"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                        Excel
                      </Button>
                      <Button
                        render={<Link href={`/classes/new?groupId=${group.id}`} />}
                        size="sm"
                        className="ml-auto"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Clase
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentClasses.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Últimas clases</h2>
          <Card className="glass-liquid">
            <CardContent className="p-0 divide-y divide-border/50">
              {recentClasses.map((cls: any) => (
                <Link
                  key={cls.id}
                  href={`/classes/${cls.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-sm"
                >
                  <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground min-w-[90px]">
                    {new Date(cls.date).toLocaleDateString('es-ES', {
                      day: '2-digit', month: '2-digit',
                    })}
                  </span>
                  <span className="font-medium">{cls.group.name}</span>
                  {cls.topic && (
                    <span className="text-muted-foreground truncate">— {cls.topic}</span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {cls._count.attendanceRecords} asistencias
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
