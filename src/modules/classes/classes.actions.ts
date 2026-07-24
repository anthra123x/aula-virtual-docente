'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import { CreateClassSessionSchema, UpdateClassSessionSchema, UpdateLessonPlanSchema } from '@/lib/validations'
import { formVal, formatZodError } from '@/lib/zod-utils'
import { success, failure, type ActionResult } from '@/types'

export async function getAllGroups() {
  const user = await requireAuth()

  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    include: { groups: { orderBy: { name: 'asc' } } },
    orderBy: { name: 'asc' },
  })

  const groups = courses.flatMap((c) =>
    c.groups.map((g) => ({ id: g.id, name: g.name, courseName: c.name }))
  )

  return success(groups)
}

export async function getClasses() {
  const user = await requireAuth()

  const classes = await prisma.classSession.findMany({
    where: { group: { course: { userId: user.id } } },
    orderBy: { date: 'desc' },
    take: 50,
    include: {
      group: { include: { course: true } },
      _count: { select: { attendanceRecords: true } },
    },
  })

  return success(classes)
}

export async function getClassesByGroup(groupId: string) {
  const user = await requireAuth()

  const group = await prisma.group.findFirst({
    where: { id: groupId, course: { userId: user.id } },
    select: { id: true },
  })
  if (!group) return success([])

  const classes = await prisma.classSession.findMany({
    where: { groupId },
    orderBy: { date: 'desc' },
    include: { lessonPlan: true, _count: { select: { attendanceRecords: true } } },
  })

  return success(classes)
}

export async function getClassById(id: string) {
  const user = await requireAuth()

  const cls = await prisma.classSession.findFirst({
    where: { id, group: { course: { userId: user.id } } },
    include: {
      group: {
        include: {
          course: true,
          students: { orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] },
        },
      },
      lessonPlan: true,
      attendanceRecords: {
        include: { student: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  })

  if (!cls) return failure('Clase no encontrada')
  return success(cls)
}

export async function createClassWithPlan(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateClassSessionSchema.safeParse({
    date: formVal(formData, 'date'),
    startTime: formData.get('startTime') || null,
    endTime: formData.get('endTime') || null,
    topic: formVal(formData, 'topic'),
    status: 'PLANNED',
    groupId: formVal(formData, 'groupId'),
    periodId: formData.get('periodId') || null,
  })

  if (!validated.success) return failure(formatZodError(validated.error))

  const group = await prisma.group.findFirst({
    where: { id: validated.data.groupId, course: { userId: user.id } },
    select: { id: true, courseId: true },
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
  revalidatePath(`/courses/${group.courseId}`)
  revalidatePath('/classes')
  revalidatePath('/dashboard')
  return success(classSession)
}

export async function updateClass(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const existing = await prisma.classSession.findFirst({
    where: { id, group: { course: { userId: user.id } } },
  })
  if (!existing) return failure('Clase no encontrada')

  const validated = UpdateClassSessionSchema.safeParse({
    date: formVal(formData, 'date'),
    startTime: formData.get('startTime') || null,
    endTime: formData.get('endTime') || null,
    topic: formVal(formData, 'topic'),
    status: formVal(formData, 'status'),
    periodId: formData.get('periodId') || null,
  })

  if (!validated.success) return failure(formatZodError(validated.error))

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
  revalidatePath(`/groups/${classSession.groupId}`)
  revalidatePath('/classes')
  revalidatePath('/dashboard')
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

export async function updateClassStatus(
  id: string, status: 'PLANNED' | 'DONE' | 'CANCELLED',
): Promise<ActionResult<void>> {
  const user = await requireAuth()

  const cls = await prisma.classSession.findFirst({
    where: { id, group: { course: { userId: user.id } } },
  })
  if (!cls) return failure('Clase no encontrada')

  await prisma.classSession.update({ where: { id }, data: { status } })
  revalidatePath(`/classes/${id}`)
  revalidatePath('/classes')
  revalidatePath('/dashboard')
  return success(undefined)
}

export async function deleteClass(id: string) {
  const user = await requireAuth()

  const cls = await prisma.classSession.findFirst({
    where: { id, group: { course: { userId: user.id } } },
    select: { groupId: true },
  })
  if (!cls) redirect('/classes')

  await prisma.classSession.delete({ where: { id } })
  revalidatePath(`/groups/${cls.groupId}`)
  revalidatePath('/classes')
  revalidatePath('/dashboard')
  redirect('/classes')
}
