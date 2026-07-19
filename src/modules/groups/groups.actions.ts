'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import { CreateGroupSchema, UpdateGroupSchema } from '@/lib/validations'
import { success, failure, type ActionResult } from '@/types'

export async function getGroupsByCourse(courseId: string) {
  const user = await requireAuth()

  const course = await prisma.course.findFirst({
    where: { id: courseId, userId: user.id },
    select: { id: true },
  })
  if (!course) return failure('Materia no encontrada')

  const groups = await prisma.group.findMany({
    where: { courseId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { students: true, classSessions: true } } },
  })

  return success(groups)
}

export async function getGroupById(id: string) {
  const user = await requireAuth()

  const group = await prisma.group.findFirst({
    where: { id, course: { userId: user.id } },
    include: {
      course: true,
      students: { orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] },
    },
  })

  if (!group) {
    return failure('Grupo no encontrado')
  }

  return success(group)
}

export async function createGroup(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateGroupSchema.safeParse({
    name: formData.get('name'),
    grade: formData.get('grade') || null,
    courseId: formData.get('courseId'),
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const course = await prisma.course.findFirst({
    where: { id: validated.data.courseId, userId: user.id },
    select: { id: true },
  })
  if (!course) return failure('Materia no encontrada')

  const group = await prisma.group.create({
    data: validated.data,
  })

  revalidatePath(`/courses/${validated.data.courseId}`)
  return success(group)
}

export async function updateGroup(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const existing = await prisma.group.findFirst({
    where: { id, course: { userId: user.id } },
    select: { id: true },
  })
  if (!existing) return failure('Grupo no encontrado')

  const validated = UpdateGroupSchema.safeParse({
    name: formData.get('name'),
    grade: formData.get('grade') || null,
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const group = await prisma.group.update({
    where: { id },
    data: validated.data,
  })

  revalidatePath(`/courses/${group.courseId}`)
  revalidatePath(`/groups/${id}`)
  return success(group)
}

export async function deleteGroup(id: string) {
  const user = await requireAuth()

  const group = await prisma.group.findFirst({
    where: { id, course: { userId: user.id } },
    select: { courseId: true },
  })
  if (!group) redirect('/courses')

  await prisma.group.delete({ where: { id } })
  revalidatePath(`/courses/${group.courseId}`)
  redirect(`/courses/${group.courseId}`)
}
