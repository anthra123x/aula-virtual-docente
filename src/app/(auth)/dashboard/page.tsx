import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CalendarDays, Users, BookOpen, GraduationCap, BarChart3, PieChart, Plus, ClipboardCheck, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClassesByCourseChart } from '@/components/charts/classes-by-course'
import { AttendanceDistribution } from '@/components/charts/attendance-distribution'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  try {
    const [
      courseCount, groupCount, studentCount,
      todayClasses, upcomingClasses,
      coursesWithClasses, attendanceRecords,
      activePeriod, weekClasses, recentStudents, recentObservations,
    ] = await Promise.all([
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
      prisma.course.findMany({
        where: { userId: user!.id },
        include: {
          groups: {
            include: {
              _count: { select: { classSessions: true } },
            },
          },
        },
      }),
      prisma.attendanceRecord.findMany({
        where: {
          classSession: { group: { course: { userId: user!.id } } },
        },
        select: { status: true },
      }),
      prisma.academicPeriod.findFirst({
        where: {
          userId: user!.id,
          startDate: { lte: today },
          endDate: { gte: today },
        },
        select: { name: true, startDate: true, endDate: true },
      }),
      prisma.classSession.findMany({
        where: {
          group: { course: { userId: user!.id } },
          date: { gte: weekStart, lt: weekEnd },
        },
        include: { group: { include: { course: true } } },
        orderBy: { date: 'asc' },
      }),
      prisma.student.findMany({
        where: { group: { course: { userId: user!.id } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, createdAt: true, group: { select: { name: true } } },
      }),
      prisma.observation.findMany({
        where: { userId: user!.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, description: true, type: true, createdAt: true, student: { select: { firstName: true, lastName: true } } },
      }),
    ])

    const classesByCourse = coursesWithClasses
      .map(c => ({
        name: c.name,
        classes: c.groups.reduce((sum, g) => sum + g._count.classSessions, 0),
      }))
      .filter(c => c.classes > 0)
      .sort((a, b) => b.classes - a.classes)

    const attendanceCount: Record<string, number> = {}
    for (const r of attendanceRecords) {
      attendanceCount[r.status] = (attendanceCount[r.status] || 0) + 1
    }
    const attendanceData = Object.entries(attendanceCount).map(([name, value]) => ({ name, value }))

    return (
      <DashboardContent
        userName={user?.name}
        activePeriod={activePeriod}
        courseCount={courseCount}
        groupCount={groupCount}
        studentCount={studentCount}
        todayClasses={todayClasses}
        upcomingClasses={upcomingClasses}
        classesByCourse={classesByCourse}
        attendanceData={attendanceData}
        weekClasses={weekClasses}
        recentStudents={recentStudents}
        recentObservations={recentObservations}
      />
    )
  } catch {
    return <DashboardError />
  }
}

function DashboardError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-fade-in">
      <div className="text-destructive text-4xl">!</div>
      <h2 className="text-xl font-semibold">Error al cargar el dashboard</h2>
      <p className="text-muted-foreground text-sm text-center max-w-md">
        Ocurrió un problema al obtener los datos. Intenta recargar la página.
      </p>
    </div>
  )
}

function DashboardContent({
  userName, activePeriod, courseCount, groupCount, studentCount,
  todayClasses, upcomingClasses, classesByCourse, attendanceData,
  weekClasses, recentStudents, recentObservations,
}: {
  userName?: string | null
  activePeriod: { name: string; startDate: Date; endDate: Date } | null
  courseCount: number
  groupCount: number
  studentCount: number
  todayClasses: { id: string; topic: string; startTime: string | null; date: Date; group: { name: string; course: { name: string } } }[]
  upcomingClasses: { id: string; topic: string; date: Date; group: { name: string; course: { name: string } } }[]
  classesByCourse: { name: string; classes: number }[]
  attendanceData: { name: string; value: number }[]
  weekClasses: { id: string; topic: string; date: Date; startTime: string | null; group: { name: string; course: { name: string } } }[]
  recentStudents: { id: string; firstName: string; lastName: string; createdAt: Date; group: { name: string } }[]
  recentObservations: { id: string; description: string; type: string; createdAt: Date; student: { firstName: string; lastName: string } }[]
}) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Bienvenido, {userName}</h1>
        <p className="text-muted-foreground">Resumen de tu actividad docente</p>
        {activePeriod && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
            Período activo: {activePeriod.name} ({format(new Date(activePeriod.startDate), 'dd/MM/yy')} - {format(new Date(activePeriod.endDate), 'dd/MM/yy')})
          </p>
        )}
      </div>

      <form
        action="/students"
        className="relative"
      >
        <input
          name="q"
          placeholder="Buscar estudiantes..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/courses" className="animate-fade-in block" style={{ animationDelay: '0s' }}>
          <Card className="card-clickable">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Materias</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{courseCount}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/groups" className="animate-fade-in block" style={{ animationDelay: '0.05s' }}>
          <Card className="card-clickable">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Grupos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{groupCount}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/students" className="animate-fade-in block" style={{ animationDelay: '0.1s' }}>
          <Card className="card-clickable">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{studentCount}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/classes" className="animate-fade-in block" style={{ animationDelay: '0.15s' }}>
          <Card className="card-clickable">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clases hoy</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{todayClasses.length}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/classes/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-clay-sm"
        >
          <Plus className="h-4 w-4" />
          Nueva clase
        </Link>
        <Link
          href="/classes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors shadow-clay-sm"
        >
          <ClipboardCheck className="h-4 w-4" />
          Tomar asistencia
        </Link>
        <Link
          href="/students"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors shadow-clay-sm"
        >
          <UserPlus className="h-4 w-4" />
          Agregar estudiante
        </Link>
      </div>

      {weekClasses.length > 0 && (
        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="text-lg">Clases de la semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {weekClasses.map((cls) => {
                const dayName = format(new Date(cls.date), 'EEEE', { locale: es })
                const isToday = format(new Date(cls.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                return (
                  <div
                    key={cls.id}
                    className={`flex items-center justify-between text-sm py-1.5 px-2 rounded-md ${
                      isToday ? 'bg-primary/10 font-medium' : ''
                    }`}
                  >
                    <span className="capitalize min-w-[80px] text-muted-foreground text-xs">{dayName}</span>
                    <span className="flex-1 ml-2">{cls.topic}</span>
                    <span className="text-xs text-muted-foreground">
                      {cls.group.course.name} - {cls.group.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-liquid">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Clases de hoy</CardTitle>
              <Link href="/classes" className="text-xs text-primary hover:underline">
                Ver todo
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {todayClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes clases programadas para hoy</p>
            ) : (
              <ul className="space-y-1">
                {todayClasses.map((cls) => (
                  <li key={cls.id}>
                    <Link
                      href={`/classes/${cls.id}`}
                      className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-accent/10 transition-colors"
                    >
                      <div>
                        <span className="font-medium">{cls.topic}</span>
                        <span className="text-muted-foreground ml-2">
                          {cls.group.course.name} - {cls.group.name}
                        </span>
                      </div>
                      {cls.startTime && (
                        <span className="text-muted-foreground">{cls.startTime}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="glass-liquid">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Próximas clases</CardTitle>
              <Link href="/classes" className="text-xs text-primary hover:underline">
                Ver todo
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay clases programadas</p>
            ) : (
              <ul className="space-y-1">
                {upcomingClasses.map((cls) => (
                  <li key={cls.id}>
                    <Link
                      href={`/classes/${cls.id}`}
                      className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-accent/10 transition-colors"
                    >
                      <div>
                        <span className="font-medium">{cls.topic}</span>
                        <span className="text-muted-foreground ml-2">
                          {cls.group.course.name} - {cls.group.name}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {format(new Date(cls.date), 'dd MMM', { locale: es })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-liquid">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Clases por materia</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[48px]">
              <ClassesByCourseChart data={classesByCourse} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-liquid">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Asistencia global</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <AttendanceDistribution data={attendanceData} />
          </CardContent>
        </Card>
      </div>

      {(recentStudents.length > 0 || recentObservations.length > 0) && (
        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle className="text-lg">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Últimos estudiantes
                  </h4>
                  <ul className="space-y-2">
                    {recentStudents.map((s) => (
                      <li key={s.id} className="text-sm flex items-center justify-between">
                        <span>{s.firstName} {s.lastName}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.group.name} · {format(new Date(s.createdAt), 'dd/MM', { locale: es })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recentObservations.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Últimas observaciones
                  </h4>
                  <ul className="space-y-2">
                    {recentObservations.map((o) => (
                      <li key={o.id} className="text-sm flex items-center justify-between">
                        <span className="truncate max-w-[250px]">{o.description}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {o.student.firstName} {o.student.lastName} · {format(new Date(o.createdAt), 'dd/MM', { locale: es })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
