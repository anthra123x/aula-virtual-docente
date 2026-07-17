'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import { CreateCourseSchema, UpdateCourseSchema } from '@/lib/validations'
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
        include: { _count: { select: { students: true, classSessions: true } } },
      },
    },
  })

  if (!course) {
    return failure('Materia no encontrada')
  }

  return success(course)
}

export async function createCourse(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateCourseSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || null,
    color: formData.get('color') || '#3B82F6',
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const course = await prisma.course.create({
    data: { ...validated.data, userId: user.id },
  })

  revalidatePath('/courses')
  return success(course)
}

export async function updateCourse(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  await requireAuth()

  const validated = UpdateCourseSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || null,
    color: formData.get('color'),
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const course = await prisma.course.update({
    where: { id },
    data: validated.data,
  })

  revalidatePath('/courses')
  revalidatePath(`/courses/${id}`)
  return success(course)
}

export async function deleteCourse(id: string) {
  const user = await requireAuth()

  await prisma.course.delete({ where: { id, userId: user.id } })
  revalidatePath('/courses')
  redirect('/courses')
}
