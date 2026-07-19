'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import { CreateStudentSchema, UpdateStudentSchema } from '@/lib/validations'
import { success, failure, type ActionResult } from '@/types'

export async function getStudentsByGroup(groupId: string) {
  const user = await requireAuth()

  const group = await prisma.group.findFirst({
    where: { id: groupId, course: { userId: user.id } },
    select: { id: true },
  })
  if (!group) return failure('Grupo no encontrado')

  const students = await prisma.student.findMany({
    where: { groupId },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })

  return success(students)
}

export async function getStudentById(id: string) {
  const user = await requireAuth()

  const student = await prisma.student.findFirst({
    where: { id, group: { course: { userId: user.id } } },
    include: {
      group: { include: { course: true } },
      observations: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!student) {
    return failure('Estudiante no encontrado')
  }

  return success(student)
}

export async function createStudent(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateStudentSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    groupId: formData.get('groupId'),
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const group = await prisma.group.findFirst({
    where: { id: validated.data.groupId, course: { userId: user.id } },
    select: { id: true },
  })
  if (!group) return failure('Grupo no encontrado')

  const student = await prisma.student.create({
    data: validated.data,
  })

  revalidatePath(`/groups/${validated.data.groupId}`)
  return success(student)
}

export async function updateStudent(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const existing = await prisma.student.findFirst({
    where: { id, group: { course: { userId: user.id } } },
    select: { id: true },
  })
  if (!existing) return failure('Estudiante no encontrado')

  const validated = UpdateStudentSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
  }

  const student = await prisma.student.update({
    where: { id },
    data: validated.data,
  })

  revalidatePath(`/groups/${student.groupId}`)
  revalidatePath(`/students/${id}`)
  return success(student)
}

export async function deleteStudent(id: string) {
  const user = await requireAuth()

  const student = await prisma.student.findFirst({
    where: { id, group: { course: { userId: user.id } } },
    select: { groupId: true },
  })
  if (!student) redirect('/students')

  await prisma.student.delete({ where: { id } })
  revalidatePath(`/groups/${student.groupId}`)
  redirect(`/groups/${student.groupId}`)
}
