import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { Pool } from 'pg'

const connectionUrl = new URL(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aula-docente')

const pool = new Pool({
  host: connectionUrl.hostname,
  port: parseInt(connectionUrl.port || '5432'),
  user: connectionUrl.username,
  password: connectionUrl.password,
  database: connectionUrl.pathname.replace('/', ''),
  max: 5,
})

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

async function main() {
  // Clean existing data
  await prisma.observation.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.lessonPlan.deleteMany()
  await prisma.classSession.deleteMany()
  await prisma.student.deleteMany()
  await prisma.group.deleteMany()
  await prisma.course.deleteMany()
  await prisma.academicPeriod.deleteMany()
  await prisma.user.deleteMany()

  const user = await prisma.user.create({
    data: { id: 'dev-user', email: 'dev@local.dev', name: 'Usuario de Prueba' },
  })

  const course = await prisma.course.create({
    data: {
      id: 'dev-course-1',
      name: 'Matemáticas',
      description: 'Álgebra y funciones',
      color: '#3B82F6',
      userId: user.id,
    },
  })

  const course2 = await prisma.course.create({
    data: {
      id: 'dev-course-2',
      name: 'Física',
      description: 'Mecánica clásica',
      color: '#10B981',
      userId: user.id,
    },
  })

  const group = await prisma.group.create({
    data: {
      id: 'dev-group-1',
      name: '10-1',
      grade: '10°',
      courseId: course.id,
    },
  })

  await prisma.group.create({
    data: {
      id: 'dev-group-2',
      name: '10-2',
      grade: '10°',
      courseId: course.id,
    },
  })

  await prisma.group.create({
    data: {
      id: 'dev-group-3',
      name: '11-1',
      grade: '11°',
      courseId: course2.id,
    },
  })

  const students = [
    { id: 'dev-student-1', firstName: 'Carlos', lastName: 'García', groupId: group.id },
    { id: 'dev-student-2', firstName: 'María', lastName: 'López', groupId: group.id },
    { id: 'dev-student-3', firstName: 'Juan', lastName: 'Martínez', groupId: group.id },
    { id: 'dev-student-4', firstName: 'Ana', lastName: 'Rodríguez', groupId: group.id },
    { id: 'dev-student-5', firstName: 'Pedro', lastName: 'Hernández', groupId: group.id },
  ]

  for (const s of students) {
    await prisma.student.create({ data: s })
  }

  await prisma.classSession.create({
    data: {
      id: 'dev-class-1',
      date: new Date(),
      startTime: '08:00',
      endTime: '09:30',
      topic: 'Ecuaciones lineales',
      status: 'DONE',
      groupId: group.id,
      lessonPlan: {
        create: {
          objectives: 'Resolver ecuaciones lineales de primer grado.',
          activities: '1. Explicación teórica (15 min)\n2. Ejercicios guiados (30 min)\n3. Práctica individual (30 min)\n4. Puesta en común (15 min)',
          resources: 'Pizarrón, marcadores, guía de ejercicios',
          homework: 'Resolver los ejercicios 1-10 de la página 45 del libro.',
        },
      },
    },
  })

  for (const s of students) {
    await prisma.attendanceRecord.create({
      data: {
        studentId: s.id,
        classSessionId: 'dev-class-1',
        status: s.id === 'dev-student-3' ? 'ABSENT' : 'PRESENT',
      },
    })
  }

  await prisma.observation.create({
    data: {
      description: 'Carlos ha mostrado gran interés en clase, participa activamente y resuelve los ejercicios correctamente.',
      type: 'ACADEMIC',
      studentId: 'dev-student-1',
      userId: user.id,
    },
  })

  const year = new Date().getFullYear()
  const periods = [
    { name: 'Período 1', startDate: new Date(year, 0, 1), endDate: new Date(year, 2, 31) },
    { name: 'Período 2', startDate: new Date(year, 3, 1), endDate: new Date(year, 5, 30) },
    { name: 'Período 3', startDate: new Date(year, 6, 1), endDate: new Date(year, 8, 30) },
    { name: 'Período 4', startDate: new Date(year, 9, 1), endDate: new Date(year, 11, 31) },
  ]

  for (const p of periods) {
    await prisma.academicPeriod.create({
      data: { ...p, year, userId: user.id },
    })
  }

  console.log('✅ Seed completado exitosamente')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
