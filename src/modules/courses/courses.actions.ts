'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import { CreateCourseSchema, UpdateCourseSchema } from '@/lib/validations'
import { formVal, formatZodError } from '@/lib/zod-utils'
import { success, failure, type ActionResult } from '@/types'

export async function getCourses() {
  const user = await requireAuth()

  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
    include: { _count: { select: { groups: true } } },
  })

  return success(courses)
}

export async function getCourseById(id: string) {
  const user = await requireAuth()

  const course = await prisma.course.findFirst({
    where: { id, userId: user.id },
    include: {
      groups: {
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { students: true, classSessions: true } },
          students: {
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            take: 5,
          },
        },
      },
    },
  })

  if (!course) {
    return failure('Materia no encontrada')
  }

  const recentClasses = await prisma.classSession.findMany({
    where: { group: { courseId: id } },
    orderBy: { date: 'desc' },
    take: 10,
    include: {
      group: { select: { id: true, name: true } },
      _count: { select: { attendanceRecords: true } },
    },
  })

  return success({ ...course, recentClasses })
}

export async function createCourse(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateCourseSchema.safeParse({
    name: formVal(formData, 'name'),
    description: formData.get('description') || null,
    color: formData.get('color') || '#3B82F6',
  })

  if (!validated.success) {
    return failure(formatZodError(validated.error))
  }

  const course = await prisma.course.create({
    data: { ...validated.data, userId: user.id },
  })

  revalidatePath('/courses')
  revalidatePath('/dashboard')
  return success(course)
}

export async function updateCourse(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const existing = await prisma.course.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })
  if (!existing) return failure('Materia no encontrada')

  const validated = UpdateCourseSchema.safeParse({
    name: formVal(formData, 'name'),
    description: formData.get('description') || null,
    color: formData.get('color'),
  })

  if (!validated.success) {
    return failure(formatZodError(validated.error))
  }

  const course = await prisma.course.update({
    where: { id },
    data: validated.data,
  })

  revalidatePath('/courses')
  revalidatePath(`/courses/${id}`)
  revalidatePath('/dashboard')
  return success(course)
}

export async function deleteCourse(id: string) {
  const user = await requireAuth()

  await prisma.course.delete({ where: { id, userId: user.id } })
  revalidatePath('/courses')
  revalidatePath('/dashboard')
  redirect('/courses')
}
