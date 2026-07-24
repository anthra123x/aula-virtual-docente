'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import { CreateStudentSchema, UpdateStudentSchema } from '@/lib/validations'
import { formVal, formatZodError } from '@/lib/zod-utils'
import { success, failure, type ActionResult } from '@/types'

export async function getStudents() {
  const user = await requireAuth()

  const courses = await prisma.course.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
    include: {
      groups: {
        orderBy: { name: 'asc' },
        include: {
          students: {
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            include: {
              _count: { select: { observations: true, attendanceRecords: true } },
            },
          },
          _count: { select: { students: true } },
        },
      },
      _count: { select: { groups: true } },
    },
  })

  return success(courses)
}

export async function getStudentById(id: string) {
  const user = await requireAuth()

  const student = await prisma.student.findFirst({
    where: { id, group: { course: { userId: user.id } } },
    include: {
      group: { include: { course: true } },
      observations: { orderBy: { createdAt: 'desc' } },
      attendanceRecords: {
        orderBy: { classSession: { date: 'desc' } },
        take: 10,
        include: {
          classSession: {
            select: { id: true, date: true, topic: true, groupId: true },
          },
        },
      },
    },
  })

  if (!student) return failure('Estudiante no encontrado')
  return success(student)
}

export async function createStudent(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateStudentSchema.safeParse({
    firstName: formVal(formData, 'firstName'),
    lastName: formVal(formData, 'lastName'),
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    groupId: formVal(formData, 'groupId'),
  })

  if (!validated.success) return failure(formatZodError(validated.error))

  const group = await prisma.group.findFirst({
    where: { id: validated.data.groupId, course: { userId: user.id } },
    select: { id: true, courseId: true },
  })
  if (!group) return failure('Grupo no encontrado')

  await prisma.student.create({ data: validated.data })
  revalidatePath(`/groups/${validated.data.groupId}`)
  revalidatePath(`/courses/${group.courseId}`)
  revalidatePath('/students')
  revalidatePath('/dashboard')
  return success({})
}

export async function updateStudent(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const existing = await prisma.student.findFirst({
    where: { id, group: { course: { userId: user.id } } },
    select: { id: true },
  })
  if (!existing) return failure('Estudiante no encontrado')

  const validated = UpdateStudentSchema.safeParse({
    firstName: formVal(formData, 'firstName'),
    lastName: formVal(formData, 'lastName'),
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
  })

  if (!validated.success) return failure(formatZodError(validated.error))

  const student = await prisma.student.update({
    where: { id },
    data: validated.data,
  })

  revalidatePath(`/groups/${student.groupId}`)
  revalidatePath(`/students/${id}`)
  revalidatePath('/students')
  revalidatePath('/dashboard')
  return success(student)
}

export async function deleteStudent(id: string) {
  const user = await requireAuth()

  const student = await prisma.student.findFirst({
    where: { id, group: { course: { userId: user.id } } },
    select: { groupId: true, group: { select: { courseId: true } } },
  })
  if (!student) redirect('/students')

  await prisma.student.delete({ where: { id } })
  revalidatePath(`/groups/${student.groupId}`)
  revalidatePath(`/courses/${student.group.courseId}`)
  revalidatePath('/students')
  revalidatePath('/dashboard')
  redirect('/students')
}
