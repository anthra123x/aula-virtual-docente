import { getGroupById, deleteGroup } from '@/modules/groups/groups.actions'
import { Plus, UserPlus, Edit, FileSpreadsheet, Users, CalendarDays, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteButton } from '@/components/ui/delete-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function GroupDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getGroupById(id)

  if (!result.success) {
    notFound()
  }

  const group = result.data
  const classCount = '_count' in group ? (group as typeof group & { _count: { classSessions: number } })._count.classSessions : 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: group.course.color }} />
            <h1 className="text-xl sm:text-2xl font-bold">{group.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            {group.course.name} {group.grade ? `- ${group.grade}` : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button render={<Link href={`/groups/${id}/edit`} />} variant="outline" size="sm">
            <Edit className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Editar</span>
          </Button>
          <DeleteButton action={deleteGroup} id={id} label="grupo" description={`¿Eliminar el grupo "${group.name}" y todos sus estudiantes?`} />
          <Button render={<Link href={`/groups/${id}/students/new`} />} size="sm">
            <UserPlus className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Agregar</span>
          </Button>
          <Button render={<Link href={`/groups/${id}/import`} />} variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Excel</span>
          </Button>
          <Button render={<Link href={`/classes/new?groupId=${id}`} />} size="sm">
            <Plus className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Clase</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{group.students.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{classCount}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Materia</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/courses/${group.course.id}`} className="text-lg font-bold hover:underline">
              {group.course.name}
            </Link>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Grado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{group.grade || '—'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button render={<Link href={`/groups/${id}/students/new`} />} size="sm">
          <UserPlus className="h-4 w-4 mr-1" />
          Agregar estudiante
        </Button>
        <Button render={<Link href={`/groups/${id}/import`} />} variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-1" />
          Importar desde Excel
        </Button>
        <Button render={<Link href={`/classes/new?groupId=${id}`} />} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Planificar clase
        </Button>
      </div>

      <Card className="glass-liquid">
        <CardHeader>
          <CardTitle>Estudiantes ({group.students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {group.students.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 space-y-2">
              <Users className="h-8 w-8 mx-auto opacity-40" />
              <p>No hay estudiantes en este grupo.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {group.students.map((student, i) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between py-3 animate-fade-in"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <div>
                    <p className="font-medium">
                      {student.lastName}, {student.firstName}
                    </p>
                    {student.email && (
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    )}
                  </div>
                  <Button
                    render={<Link href={`/students/${student.id}`} />}
                    variant="ghost"
                    size="sm"
                  >
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
