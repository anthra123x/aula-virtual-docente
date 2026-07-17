'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/modules/auth/auth.actions'
import { CreateAcademicPeriodSchema } from '@/lib/validations'
import { success, failure, type ActionResult } from '@/types'

export async function getPeriods() {
  const user = await requireAuth()

  const periods = await prisma.academicPeriod.findMany({
    where: { userId: user.id },
    orderBy: [{ year: 'desc' }, { startDate: 'asc' }],
  })

  return success(periods)
}

export async function createPeriod(formData: FormData): Promise<ActionResult<unknown>> {
  const user = await requireAuth()

  const validated = CreateAcademicPeriodSchema.safeParse({
    name: formData.get('name'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    year: formData.get('year'),
  })

  if (!validated.success) {
    return failure(validated.error.issues.map((e) => e.message).join(', '))
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
  return success(period)
}

export async function deletePeriod(id: string) {
  const user = await requireAuth()

  await prisma.academicPeriod.delete({ where: { id, userId: user.id } })
  revalidatePath('/periods')
}
