import { getStudentById, deleteStudent } from '@/modules/students/students.actions'
import { FileText, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { id } = await params
  const result = await getStudentById(id)

  if (!result.success) {
    notFound()
  }

  const student = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {student.lastName}, {student.firstName}
          </h1>
          <p className="text-muted-foreground">
            {student.group.course.name} - {student.group.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href={`/students/${id}/edit`} />} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <form action={deleteStudent.bind(null, id)}>
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </form>
          <Button render={<Link href={`/observations/new?studentId=${id}`} />} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nueva observación
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {student.email && (
              <p>
                <span className="text-muted-foreground">Email:</span> {student.email}
              </p>
            )}
            {student.phone && (
              <p>
                <span className="text-muted-foreground">Teléfono:</span> {student.phone}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observaciones ({student.observations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student.observations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin observaciones registradas
              </p>
            ) : (
              <div className="space-y-3">
                {student.observations.slice(0, 5).map((obs) => (
                  <div key={obs.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={obs.type === 'ACADEMIC' ? 'default' : 'destructive'}>
                        {obs.type === 'ACADEMIC' ? 'Académica' : 'Comportamiento'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {obs.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{obs.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
