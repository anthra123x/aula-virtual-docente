import { getGroupById, deleteGroup } from '@/modules/groups/groups.actions'
import { Plus, UserPlus, Edit, Trash2, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">
            {group.course.name} {group.grade ? `- ${group.grade}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href={`/groups/${id}/edit`} />} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <form action={deleteGroup.bind(null, id)}>
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </form>
          <Button render={<Link href={`/groups/${id}/students/new`} />} size="sm">
            <UserPlus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
          <Button render={<Link href={`/groups/${id}/import`} />} size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Importar Excel
          </Button>
          <Button render={<Link href={`/classes/new?groupId=${id}`} />} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Planificar clase
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estudiantes ({group.students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {group.students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay estudiantes en este grupo.
            </p>
          ) : (
            <div className="divide-y">
              {group.students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between py-3"
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
