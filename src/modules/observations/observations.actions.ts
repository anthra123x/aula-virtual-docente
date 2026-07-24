'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import { CreateObservationSchema, UpdateObservationSchema } from '@/lib/validations'
import { formVal, formatZodError } from '@/lib/zod-utils'
import { success, failure, type ActionResult } from '@/types'

export async function getObservationById(id: string) {
  const user = await requireAuth()

  const observation = await prisma.observation.findFirst({
    where: { id, userId: user.id },
    include: {
      student: {
        select: {
          id: true, firstName: true, lastName: true,
          group: { select: { id: true, name: true, course: { select: { id: true, name: true } } } },
          _count: { select: { observations: true } },
        },
      },
    },
  })

  if (!observation) return failure('Observación no encontrada')
  return success(observation)
}

export async function getObservations(filters?: {
  type?: string
  courseId?: string
  groupId?: string
  studentId?: string
}) {
  const user = await requireAuth()

  const where: Record<string, unknown> = { userId: user.id }

  if (filters?.type) where.type = filters.type
  if (filters?.studentId) where.studentId = filters.studentId
  if (filters?.courseId || filters?.groupId) {
    where.student = {
      group: {
        ...(filters.courseId ? { courseId: filters.courseId } : {}),
        ...(filters.groupId ? { id: filters.groupId } : {}),
      },
    }
  }

  const observations = await prisma.observation.findMany({
    where: where as any,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      student: {
        select: {
          id: true, firstName: true, lastName: true,
          group: { select: { id: true, name: true, course: { select: { id: true, name: true } } } },
        },
      },
    },
  })

  return success(observations)
}

export async function getObservationFilters() {
  const user = await requireAuth()

  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, color: true, groups: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  })

  return success(courses)
}

export async function searchStudents(query: string) {
  const user = await requireAuth()

  const students = await prisma.student.findMany({
    where: {
      group: { course: { userId: user.id } },
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      group: { select: { id: true, name: true, course: { select: { name: true } } } },
      _count: { select: { observations: true } },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: 10,
  })

  return success(students)
}

export async function createObservation(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateObservationSchema.safeParse({
    description: formVal(formData, 'description'),
    type: formData.get('type') || 'ACADEMIC',
    studentId: formVal(formData, 'studentId'),
  })

  if (!validated.success) return failure(formatZodError(validated.error))

  const student = await prisma.student.findFirst({
    where: { id: validated.data.studentId, group: { course: { userId: user.id } } },
    select: { id: true },
  })
  if (!student) return failure('Estudiante no encontrado')

  const observation = await prisma.observation.create({
    data: { ...validated.data, userId: user.id },
  })

  revalidatePath(`/students/${validated.data.studentId}`)
  revalidatePath('/observations')
  revalidatePath('/dashboard')
  return success(observation)
}

export async function updateObservation(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const existing = await prisma.observation.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })
  if (!existing) return failure('Observación no encontrada')

  const validated = UpdateObservationSchema.safeParse({
    description: formVal(formData, 'description'),
    type: formData.get('type') || 'ACADEMIC',
  })

  if (!validated.success) return failure(formatZodError(validated.error))

  const observation = await prisma.observation.update({
    where: { id },
    data: validated.data,
  })

  revalidatePath(`/students/${observation.studentId}`)
  revalidatePath(`/observations/${id}`)
  revalidatePath('/observations')
  revalidatePath('/dashboard')
  return success(observation)
}

export async function deleteObservation(id: string) {
  const user = await requireAuth()

  const observation = await prisma.observation.findFirst({
    where: { id, userId: user.id },
    select: { studentId: true },
  })
  if (!observation) redirect('/observations')

  await prisma.observation.delete({ where: { id } })
  revalidatePath(`/students/${observation.studentId}`)
  revalidatePath('/observations')
  revalidatePath('/dashboard')
}
