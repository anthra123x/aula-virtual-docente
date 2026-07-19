'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import { CreateObservationSchema, UpdateObservationSchema } from '@/lib/validations'
import { success, failure, type ActionResult } from '@/types'

export async function getObservationById(id: string) {
  const user = await requireAuth()

  const observation = await prisma.observation.findFirst({
    where: { id, userId: user.id },
    select: { id: true, description: true, type: true, studentId: true },
  })

  if (!observation) {
    return failure('Observación no encontrada')
  }

  return success(observation)
}

export async function getObservationsByStudent(studentId: string) {
  const user = await requireAuth()

  const student = await prisma.student.findFirst({
    where: { id: studentId, group: { course: { userId: user.id } } },
    select: { id: true },
  })
  if (!student) return success([])

  const observations = await prisma.observation.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  })

  return success(observations)
}

export async function createObservation(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateObservationSchema.safeParse({
    description: formData.get('description'),
    type: formData.get('type') || 'ACADEMIC',
    studentId: formData.get('studentId'),
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const student = await prisma.student.findFirst({
    where: { id: validated.data.studentId, group: { course: { userId: user.id } } },
    select: { id: true },
  })
  if (!student) return failure('Estudiante no encontrado')

  const observation = await prisma.observation.create({
    data: {
      ...validated.data,
      userId: user.id,
    },
  })

  revalidatePath(`/students/${validated.data.studentId}`)
  revalidatePath('/observations')
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
    description: formData.get('description'),
    type: formData.get('type') || 'ACADEMIC',
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const observation = await prisma.observation.update({
    where: { id },
    data: validated.data,
  })

  revalidatePath(`/students/${observation.studentId}`)
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
}
