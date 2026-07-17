export const dynamic = 'force-dynamic'

import { requireAuth } from '@/modules/auth/auth.actions'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const statusLabels: Record<string, string> = {
  PLANNED: 'Planificada',
  DONE: 'Realizada',
  CANCELLED: 'Cancelada',
}

export default async function ClassesPage() {
  const user = await requireAuth()

  const classes = await prisma.classSession.findMany({
    where: { group: { course: { userId: user.id } } },
    orderBy: { date: 'desc' },
    take: 30,
    include: {
      group: { include: { course: true } },
      _count: { select: { attendanceRecords: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clases</h1>
          <p className="text-muted-foreground">Planifica y gestiona tus clases</p>
        </div>
        <Button render={<Link href="/courses" />}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva clase
        </Button>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No hay clases registradas. Selecciona un grupo para planificar una clase.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {classes.map((cls) => (
            <Link key={cls.id} href={`/classes/${cls.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cls.topic}</span>
                        <Badge variant="outline" className="text-xs">
                          {statusLabels[cls.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {cls.group.course.name} - {cls.group.name} ·{' '}
                        {format(new Date(cls.date), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cls._count.attendanceRecords} asistencias
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
