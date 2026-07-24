'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import { CreateAcademicPeriodSchema, UpdateAcademicPeriodSchema } from '@/lib/validations'
import { formVal, formatZodError } from '@/lib/zod-utils'
import { success, failure, type ActionResult } from '@/types'

export async function getPeriods() {
  const user = await requireAuth()

  const periods = await prisma.academicPeriod.findMany({
    where: { userId: user.id },
    orderBy: [{ year: 'desc' }, { startDate: 'asc' }],
    include: { _count: { select: { classSessions: true } } },
  })

  return success(periods)
}

export async function getPeriodById(id: string) {
  const user = await requireAuth()

  const period = await prisma.academicPeriod.findFirst({
    where: { id, userId: user.id },
    include: {
      _count: { select: { classSessions: true } },
      classSessions: {
        select: { status: true },
      },
    },
  })

  if (!period) return failure('Período no encontrado')
  return success(period)
}

export async function createPeriod(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateAcademicPeriodSchema.safeParse({
    name: formVal(formData, 'name'),
    startDate: formVal(formData, 'startDate'),
    endDate: formVal(formData, 'endDate'),
    year: formData.get('year'),
  })

  if (!validated.success) {
    return failure(formatZodError(validated.error))
  }

  const period = await prisma.academicPeriod.create({
    data: {
      ...validated.data,
      startDate: new Date(validated.data.startDate),
      endDate: new Date(validated.data.endDate),
      userId: user.id,
    },
  })

  revalidatePath('/periods')
  revalidatePath('/dashboard')
  return success(period)
}

export async function updatePeriod(id: string, formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const existing = await prisma.academicPeriod.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })
  if (!existing) return failure('Período no encontrado')

  const validated = UpdateAcademicPeriodSchema.safeParse({
    name: formVal(formData, 'name'),
    startDate: formVal(formData, 'startDate'),
    endDate: formVal(formData, 'endDate'),
    year: formData.get('year'),
  })

  if (!validated.success) {
    return failure(formatZodError(validated.error))
  }

  const data: Record<string, unknown> = { ...validated.data }
  if (data.startDate) data.startDate = new Date(data.startDate as string)
  if (data.endDate) data.endDate = new Date(data.endDate as string)

  const period = await prisma.academicPeriod.update({
    where: { id },
    data,
  })

  revalidatePath(`/periods/${id}`)
  revalidatePath('/periods')
  revalidatePath('/dashboard')
  return success(period)
}

export async function deletePeriod(id: string) {
  const user = await requireAuth()

  const period = await prisma.academicPeriod.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })
  if (!period) redirect('/periods')

  await prisma.academicPeriod.delete({ where: { id } })
  revalidatePath('/periods')
  revalidatePath('/dashboard')
}
