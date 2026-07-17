'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/modules/auth/auth.actions'
import { success, failure, type ActionResult } from '@/types'

export async function saveAttendance(
  classSessionId: string,
  records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }[],
): Promise<ActionResult<void>> {
  const user = await requireAuth()

  const cls = await prisma.classSession.findFirst({
    where: { id: classSessionId, group: { course: { userId: user.id } } },
    select: { id: true },
  })
  if (!cls) return failure('Clase no encontrada')

  try {
    await prisma.$transaction(
      records.map((record) =>
        prisma.attendanceRecord.upsert({
          where: {
            studentId_classSessionId: {
              studentId: record.studentId,
              classSessionId,
            },
          },
          update: { status: record.status },
          create: {
            studentId: record.studentId,
            classSessionId,
            status: record.status,
          },
        }),
      ),
    )

    revalidatePath(`/classes/${classSessionId}`)
    return success(undefined)
  } catch (error) {
    return failure('Error al guardar la asistencia')
  }
}

export async function getAttendanceByClass(classSessionId: string) {
  const user = await requireAuth()

  const cls = await prisma.classSession.findFirst({
    where: { id: classSessionId, group: { course: { userId: user.id } } },
    select: { id: true },
  })
  if (!cls) return failure('Clase no encontrada')

  const records = await prisma.attendanceRecord.findMany({
    where: { classSessionId },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  return success(records)
}
