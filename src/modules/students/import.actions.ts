'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/modules/auth/auth.actions'
import { success, failure, type ActionResult } from '@/types'
import * as XLSX from 'xlsx'

type ParsedRow = {
  lastName: string
  firstName: string
  email?: string
  phone?: string
}

export async function parseExcel(formData: FormData): Promise<ActionResult<{
  rows: ParsedRow[]
  total: number
  groupId: string
  groupName: string
}>> {
  const user = await requireAuth()

  const groupId = formData.get('groupId') as string
  const file = formData.get('file') as File

  if (!groupId) return failure('ID de grupo requerido')
  if (!file) return failure('Archivo requerido')

  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ]
  if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
    return failure('Formato de archivo no soportado. Usa archivos .xlsx, .xls o .csv')
  }

  const group = await prisma.group.findFirst({
    where: { id: groupId, course: { userId: user.id } },
    select: { id: true, name: true, course: { select: { name: true } } },
  })
  if (!group) return failure('Grupo no encontrado')

  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  if (raw.length < 2) return failure('El archivo debe tener al menos un encabezado y una fila de datos')

  const headers = (raw[0] as (string | undefined)[]).map(h => String(h ?? ''))
  const rows = raw.slice(1) as string[][]

  const headerMap = new Map<string, number>()
  headers.forEach((h, i) => {
    const key = (h || '').toString().trim().toLowerCase()
    if (key.includes('apellido') || key === 'apellidos') headerMap.set('lastName', i)
    else if (key.includes('nombre') && !key.includes('apellido')) headerMap.set('firstName', i)
    else if (key.includes('email') || key.includes('correo') || key.includes('mail')) headerMap.set('email', i)
    else if (key.includes('teléfono') || key.includes('telefono') || key.includes('phone') || key.includes('celular')) headerMap.set('phone', i)
  })

  const lastNameIdx = headerMap.get('lastName')
  const firstNameIdx = headerMap.get('firstName')

  if (lastNameIdx === undefined || firstNameIdx === undefined) {
    return failure(
      'No se encontraron columnas de "Apellido" y "Nombre" en el archivo. ' +
      'Asegúrate de que la primera fila contenga los encabezados con esos nombres.',
    )
  }

  const parsed: ParsedRow[] = []
  for (const row of rows) {
    const lastName = (row[lastNameIdx] || '').toString().trim()
    const firstName = (row[firstNameIdx] || '').toString().trim()
    if (!lastName || !firstName) continue

    parsed.push({
      lastName,
      firstName,
      email: headerMap.has('email') ? (row[headerMap.get('email')!] || '').toString().trim() || undefined : undefined,
      phone: headerMap.has('phone') ? (row[headerMap.get('phone')!] || '').toString().trim() || undefined : undefined,
    })
  }

  if (parsed.length === 0) {
    return failure('No se encontraron estudiantes válidos en el archivo')
  }

  return success({
    rows: parsed,
    total: parsed.length,
    groupId: group.id,
    groupName: `${group.course.name} - ${group.name}`,
  })
}

export async function confirmImport(
  groupId: string,
  students: ParsedRow[],
): Promise<ActionResult<{ created: number }>> {
  const user = await requireAuth()

  const group = await prisma.group.findFirst({
    where: { id: groupId, course: { userId: user.id } },
    select: { id: true },
  })
  if (!group) return failure('Grupo no encontrado')

  await prisma.student.createMany({
    data: students.map(s => ({
      lastName: s.lastName,
      firstName: s.firstName,
      email: s.email || null,
      phone: s.phone || null,
      groupId: group.id,
    })),
  })

  revalidatePath(`/groups/${groupId}`)
  return success({ created: students.length })
}
