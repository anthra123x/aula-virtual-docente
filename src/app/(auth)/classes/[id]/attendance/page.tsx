import { getClassById } from '@/modules/classes/classes.actions'
import { notFound } from 'next/navigation'
import { AttendanceForm } from './attendance-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AttendancePage({ params }: PageProps) {
  const { id } = await params
  const result = await getClassById(id)

  if (!result.success) {
    notFound()
  }

  const cls = result.data

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tomar asistencia</h1>
        <p className="text-muted-foreground">
          {cls.group.course.name} - {cls.group.name}
        </p>
        <p className="text-muted-foreground">
          {new Date(cls.date).toLocaleDateString()} - {cls.topic}
        </p>
      </div>

      <AttendanceForm
        classSessionId={cls.id}
        students={cls.group.students}
        existingRecords={cls.attendanceRecords}
      />
    </div>
  )
}
