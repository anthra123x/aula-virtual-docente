import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CalendarDays, Users, BookOpen, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [courseCount, groupCount, studentCount, todayClasses, upcomingClasses] =
    await Promise.all([
      prisma.course.count({ where: { userId: user!.id } }),
      prisma.group.count({
        where: { course: { userId: user!.id } },
      }),
      prisma.student.count({
        where: { group: { course: { userId: user!.id } } },
      }),
      prisma.classSession.findMany({
        where: {
          group: { course: { userId: user!.id } },
          date: { gte: today, lt: tomorrow },
        },
        include: { group: { include: { course: true } } },
        orderBy: { date: 'asc' },
      }),
      prisma.classSession.findMany({
        where: {
          group: { course: { userId: user!.id } },
          date: { gte: tomorrow },
          status: 'PLANNED',
        },
        include: { group: { include: { course: true } } },
        orderBy: { date: 'asc' },
        take: 5,
      }),
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bienvenido, {user?.name}</h1>
        <p className="text-muted-foreground">Resumen de tu actividad docente</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Materias</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{courseCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Grupos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{groupCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{studentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clases hoy</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayClasses.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clases de hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {todayClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes clases programadas para hoy</p>
            ) : (
              <ul className="space-y-3">
                {todayClasses.map((cls) => (
                  <li key={cls.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{cls.topic}</span>
                      <span className="text-muted-foreground ml-2">
                        {cls.group.course.name} - {cls.group.name}
                      </span>
                    </div>
                    {cls.startTime && (
                      <span className="text-muted-foreground">{cls.startTime}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas clases</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay clases programadas</p>
            ) : (
              <ul className="space-y-3">
                {upcomingClasses.map((cls) => (
                  <li key={cls.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{cls.topic}</span>
                      <span className="text-muted-foreground ml-2">
                        {cls.group.course.name} - {cls.group.name}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {format(new Date(cls.date), 'dd MMM', { locale: es })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
