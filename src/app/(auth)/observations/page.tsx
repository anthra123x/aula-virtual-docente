import { requireAuth } from '@/modules/auth/auth.actions'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteObservation } from '@/modules/observations/observations.actions'
import { Edit } from 'lucide-react'
import { DeleteButton } from '@/components/ui/delete-button'
import Link from 'next/link'

export default async function ObservationsPage() {
  const user = await requireAuth()

  const observations = await prisma.observation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      student: { select: { id: true, firstName: true, lastName: true, group: { select: { name: true } } } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Observaciones</h1>
        <p className="text-sm text-muted-foreground">Registro de observaciones académicas y de comportamiento</p>
      </div>

      <div className="space-y-3">
        {observations.map((obs) => (
          <Card key={obs.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Link
                    href={`/students/${obs.student.id}`}
                    className="font-medium hover:underline"
                  >
                    {obs.student.lastName}, {obs.student.firstName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {obs.student.group.name} · {obs.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={obs.type === 'ACADEMIC' ? 'default' : 'destructive'}>
                    {obs.type === 'ACADEMIC' ? 'Académica' : 'Comportamiento'}
                  </Badge>
                  <Button render={<Link href={`/observations/${obs.id}/edit`} />} variant="ghost" size="icon-xs">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <DeleteButton action={deleteObservation} id={obs.id} size="icon-xs" />
                </div>
              </div>
              <p className="text-sm mt-3 whitespace-pre-wrap">{obs.description}</p>
            </CardContent>
          </Card>
        ))}

        {observations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No hay observaciones registradas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
