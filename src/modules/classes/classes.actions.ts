'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import {
  CreateClassSessionSchema,
  UpdateClassSessionSchema,
  CreateLessonPlanSchema,
  UpdateLessonPlanSchema,
} from '@/lib/validations'
import { success, failure, type ActionResult } from '@/types'

export async function getClassesByGroup(groupId: string) {
  await requireAuth()

  const classes = await prisma.classSession.findMany({
    where: { groupId },
    orderBy: { date: 'desc' },
    include: {
      lessonPlan: true,
      _count: { select: { attendanceRecords: true } },
    },
  })

  return success(classes)
}

export async function getClassById(id: string) {
  const user = await requireAuth()

  const cls = await prisma.classSession.findFirst({
    where: { id, group: { course: { userId: user.id } } },
    include: {
      group: { include: { course: true, students: { orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] } } },
      lessonPlan: true,
      attendanceRecords: {
        include: { student: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  })

  if (!cls) {
    return failure('Clase no encontrada')
  }

  return success(cls)
}

export async function createClassWithPlan(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateClassSessionSchema.safeParse({
    date: formData.get('date'),
    startTime: formData.get('startTime') || null,
    endTime: formData.get('endTime') || null,
    topic: formData.get('topic'),
    status: 'PLANNED',
    groupId: formData.get('groupId'),
    periodId: formData.get('periodId') || null,
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const group = await prisma.group.findFirst({
    where: { id: validated.data.groupId, course: { userId: user.id } },
    select: { id: true },
  })
  if (!group) return failure('Grupo no encontrado')

  const classSession = await prisma.classSession.create({
    data: {
      date: new Date(validated.data.date),
      startTime: validated.data.startTime,
      endTime: validated.data.endTime,
      topic: validated.data.topic,
      status: 'PLANNED',
      groupId: validated.data.groupId,
      periodId: validated.data.periodId,
      lessonPlan: {
        create: {
          objectives: (formData.get('objectives') as string) || null,
          activities: (formData.get('activities') as string) || null,
          resources: (formData.get('resources') as string) || null,
          homework: (formData.get('homework') as string) || null,
        },
      },
    },
    include: { lessonPlan: true },
  })

  revalidatePath(`/groups/${validated.data.groupId}`)
  revalidatePath('/classes')
  return success(classSession)
}

export async function updateClass(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const existing = await prisma.classSession.findFirst({
    where: { id, group: { course: { userId: user.id } } },
  })
  if (!existing) return failure('Clase no encontrada')

  const validated = UpdateClassSessionSchema.safeParse({
    date: formData.get('date'),
    startTime: formData.get('startTime') || null,
    endTime: formData.get('endTime') || null,
    topic: formData.get('topic'),
    status: formData.get('status'),
    periodId: formData.get('periodId') || null,
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const classSession = await prisma.classSession.update({
    where: { id },
    data: {
      ...(validated.data.date && { date: new Date(validated.data.date) }),
      ...(validated.data.startTime !== undefined && { startTime: validated.data.startTime }),
      ...(validated.data.endTime !== undefined && { endTime: validated.data.endTime }),
      ...(validated.data.topic && { topic: validated.data.topic }),
      ...(validated.data.status && { status: validated.data.status }),
      ...(validated.data.periodId !== undefined && { periodId: validated.data.periodId }),
    },
  })

  revalidatePath(`/classes/${id}`)
  return success(classSession)
}

export async function updateLessonPlan(classSessionId: string, formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const cls = await prisma.classSession.findFirst({
    where: { id: classSessionId, group: { course: { userId: user.id } } },
  })
  if (!cls) return failure('Clase no encontrada')

  const validated = UpdateLessonPlanSchema.safeParse({
    objectives: (formData.get('objectives') as string) || null,
    activities: (formData.get('activities') as string) || null,
    resources: (formData.get('resources') as string) || null,
    homework: (formData.get('homework') as string) || null,
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const lessonPlan = await prisma.lessonPlan.upsert({
    where: { classSessionId },
    update: validated.data,
    create: { ...validated.data, classSessionId },
  })

  revalidatePath(`/classes/${classSessionId}`)
  return success(lessonPlan)
}

export async function updateClassStatus(id: string, status: 'PLANNED' | 'DONE' | 'CANCELLED'): Promise<ActionResult<void>> {
  const user = await requireAuth()

  const cls = await prisma.classSession.findFirst({
    where: { id, group: { course: { userId: user.id } } },
  })
  if (!cls) return failure('Clase no encontrada')

  await prisma.classSession.update({
    where: { id },
    data: { status },
  })

  revalidatePath(`/classes/${id}`)
  return success(undefined)
}

export async function deleteClass(id: string) {
  await requireAuth()

  const cls = await prisma.classSession.findUnique({ where: { id }, select: { groupId: true } })

  await prisma.classSession.delete({ where: { id } })
  revalidatePath(`/groups/${cls?.groupId || ''}`)
  revalidatePath('/classes')
  redirect(cls ? `/groups/${cls.groupId}` : '/classes')
}
