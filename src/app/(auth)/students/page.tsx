import { getStudents } from '@/modules/students/students.actions'
import { Search, GraduationCap, Users, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const result = await getStudents()
  if (!result.success) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-xl sm:text-2xl font-bold">Estudiantes</h1>
        <p className="text-destructive">Error al cargar estudiantes</p>
      </div>
    )
  }

  const courses = result.data
  const { q } = await searchParams

  const totalStudents = courses.reduce((s, c) => s + c.groups.reduce((sg, g) => sg + g._count.students, 0), 0)
  const totalObs = courses.reduce((s, c) => s + c.groups.flatMap(g => g.students).reduce((ss, st) => ss + st._count.observations, 0), 0)
  const totalAttendance = courses.reduce((s, c) => s + c.groups.flatMap(g => g.students).reduce((ss, st) => ss + st._count.attendanceRecords, 0), 0)

  const filteredCourses = courses
    .map(c => ({
      ...c,
      groups: c.groups.map(g => ({
        ...g,
        students: q
          ? g.students.filter(
              s =>
                s.firstName.toLowerCase().includes(q.toLowerCase()) ||
                s.lastName.toLowerCase().includes(q.toLowerCase()) ||
                (s.email && s.email.toLowerCase().includes(q.toLowerCase()))
            )
          : g.students,
      })).filter(g => g.students.length > 0),
    }))
    .filter(c => c.groups.length > 0)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Estudiantes</h1>
        <p className="text-sm text-muted-foreground">Todos los estudiantes organizados por materia y grupo</p>
      </div>

      <div className="grid gap-3 grid-cols-3">
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
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
              <FileText className="h-3.5 w-3.5" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalObs}</p>
          </CardContent>
        </Card>
        <Card className="glass-liquid">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              Asistencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalAttendance}</p>
          </CardContent>
        </Card>
      </div>

      <form className="relative">
        <input
          name="q"
          defaultValue={q || ''}
          placeholder="Buscar estudiantes por nombre, apellido o email..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </form>

      {courses.length === 0 ? (
        <Card className="glass-liquid">
          <CardContent className="py-12 text-center text-muted-foreground space-y-2">
            <Users className="h-8 w-8 mx-auto opacity-40" />
            <p>Aún no hay estudiantes registrados.</p>
            <p className="text-xs">Agrega estudiantes desde la página de cada grupo o importa un archivo Excel.</p>
          </CardContent>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <Card className="glass-liquid">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto opacity-40 mb-2" />
            <p>No se encontraron estudiantes con &quot;{q}&quot;</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredCourses.map((course) => (
            <div key={course.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                <Link href={`/courses/${course.id}`} className="text-lg font-semibold hover:underline">
                  {course.name}
                </Link>
              </div>

              {course.groups.map((group, gi) => (
                <div key={group.id} className="mb-4 animate-fade-in" style={{ animationDelay: `${gi * 0.05}s` }}>
                  <div className="flex items-center justify-between mb-2 ml-5">
                    <Link href={`/groups/${group.id}`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                      {group.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">{group.students.length} estudiantes</span>
                  </div>
                  <Card className="glass-liquid">
                    <CardContent className="p-0 divide-y divide-border/50">
                      {group.students.map((student, si) => (
                        <Link
                          key={student.id}
                          href={`/students/${student.id}`}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors text-sm animate-fade-in"
                          style={{ animationDelay: `${(gi * 0.05) + (si * 0.02)}s` }}
                        >
                          <span className="font-medium">
                            {student.lastName}, {student.firstName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {student._count.observations > 0 && `${student._count.observations} obs`}
                            {student._count.observations > 0 && student._count.attendanceRecords > 0 && ' · '}
                            {student._count.attendanceRecords > 0 && `${student._count.attendanceRecords} asistencias`}
                            {student._count.observations === 0 && student._count.attendanceRecords === 0 && 'Sin actividad'}
                          </span>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
