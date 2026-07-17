import { requireAuth } from '@/modules/auth/auth.actions'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { deletePeriod } from '@/modules/periods/periods.actions'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default async function PeriodsPage() {
  const user = await requireAuth()
  const periods = await prisma.academicPeriod.findMany({
    where: { userId: user.id },
    orderBy: [{ year: 'desc' }, { startDate: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Períodos académicos</h1>
          <p className="text-muted-foreground">Configura los bimestres del año escolar</p>
        </div>
        <Button render={<Link href="/periods/new" />}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo período
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {periods.map((period) => (
          <Card key={period.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{period.name}</CardTitle>
                <form action={deletePeriod.bind(null, period.id)}>
                  <Button type="submit" variant="destructive" size="icon-xs">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </form>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {period.startDate.toLocaleDateString()} - {period.endDate.toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">Año {period.year}</p>
            </CardContent>
          </Card>
        ))}

        {periods.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Aún no has configurado períodos académicos.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
