'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/modules/auth/auth.actions'
import { success, failure } from '@/types'
import { SETTING_KEYS, SETTING_DEFAULTS, type SettingsMap } from './settings.types'

export async function getUserSettings() {
  const user = await requireAuth()

  const rows = await prisma.userSetting.findMany({
    where: { userId: user.id },
    select: { key: true, value: true },
  })

  const settings: SettingsMap = { ...SETTING_DEFAULTS }
  for (const row of rows) {
    settings[row.key] = row.value
  }

  return success(settings)
}

export async function updateSetting(key: string, value: string) {
  const user = await requireAuth()

  if (!Object.values(SETTING_KEYS).includes(key as any)) {
    return failure('Clave de configuración inválida')
  }

  await prisma.userSetting.upsert({
    where: { userId_key: { userId: user.id, key } },
    create: { userId: user.id, key, value },
    update: { value },
  })

  revalidatePath('/settings')
  return success({ key, value })
}

export async function updateSettings(formData: FormData) {
  const user = await requireAuth()

  const entries: { key: string; value: string }[] = []
  const errors: string[] = []

  for (const [key, value] of formData.entries()) {
    if (!Object.values(SETTING_KEYS).includes(key as any)) continue
    if (typeof value !== 'string') continue
    entries.push({ key, value })
  }

  for (const entry of entries) {
    try {
      await prisma.userSetting.upsert({
        where: { userId_key: { userId: user.id, key: entry.key } },
        create: { userId: user.id, key: entry.key, value: entry.value },
        update: { value: entry.value },
      })
    } catch {
      errors.push(entry.key)
    }
  }

  revalidatePath('/settings')
  if (errors.length > 0) return failure(`Error al guardar: ${errors.join(', ')}`)
  return success({ updated: entries.length })
}

export async function updateProfile(formData: FormData) {
  const user = await requireAuth()

  const name = formData.get('name')
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return failure('El nombre debe tener al menos 2 caracteres')
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: name.trim() },
  })

  revalidatePath('/settings')
  return success({ name: name.trim() })
}
