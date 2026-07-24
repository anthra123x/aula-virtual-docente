'use server'

import { generateText, isStepCount, tool } from 'ai'
import { z } from 'zod'
import { zen, AI_MODEL, callAI, SYSTEM_PROMPTS } from '@/lib/ai'
import { requireAuth } from '@/modules/auth/auth.actions'
import { prisma } from '@/lib/prisma'

export async function chatWithAgent(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<{ response: string }> {
  const user = await requireAuth()

  const systemPrompt = `Eres "AulaBot", un asistente docente integrado en AulaDocente.

CAPACIDADES:
- CRUD completo de cursos, grupos, estudiantes, clases, observaciones y períodos
- Consultar datos del sistema
- Generar y crear planes de clase con IA
- Responder preguntas sobre pedagogía

INSTRUCCIONES CRÍTICAS:
1. Cuando el usuario te pida CREAR algo (clase, curso, grupo, etc.), EJECUTA las herramientas directamente. No preguntes confirmación — el usuario ya te está pidiendo que lo hagas.
2. Para crear una clase: llama listCourses → listGroups → generateLessonPlan → createClass en ese orden.
3. Para crear una clase sin plan de IA: llama listCourses → listGroups → createClass (solo con los datos que el usuario te dio).
4. Para consultar información: usa las herramientas correspondientes y responde con los datos.
5. Siempre usa las herramientas para obtener datos reales — no inventes IDs ni nombres.
6. Si no encuentras un curso o grupo con el nombre exacto, busca coincidencias parciales (ej: "Informática" coincide con "Informática - Computación").
7. Después de crear algo, informa al usuario con un resumen claro de lo que se creó.
8. Si el usuario omite datos requeridos (como fecha para una clase), usa la fecha de hoy por defecto.

REGLAS:
- Todo en español, tono cercano y profesional
- No inventes datos — siempre consulta primero
- Cuando generes un plan de clase, pasa el resultado a createClass`

  const tools = {
    listCourses: tool({
      description: 'Lista todos los cursos/materias del usuario',
      inputSchema: z.object({}),
      execute: async () => {
        const courses = await prisma.course.findMany({
          where: { userId: user.id },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, description: true },
        })
        return courses
      },
    }),

    listGroups: tool({
      description: 'Lista los grupos de un curso específico',
      inputSchema: z.object({
        courseId: z.string().describe('ID del curso'),
      }),
      execute: async ({ courseId }) => {
        const groups = await prisma.group.findMany({
          where: { courseId, course: { userId: user.id } },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, grade: true, courseId: true },
        })
        return groups
      },
    }),

    getGroupById: tool({
      description: 'Obtiene un grupo con sus estudiantes y el curso al que pertenece',
      inputSchema: z.object({
        groupId: z.string().describe('ID del grupo'),
      }),
      execute: async ({ groupId }) => {
        const group = await prisma.group.findFirst({
          where: { id: groupId, course: { userId: user.id } },
          include: { course: true, students: { orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] } },
        })
        return group
      },
    }),

    getStudentById: tool({
      description: 'Obtiene información de un estudiante',
      inputSchema: z.object({
        studentId: z.string().describe('ID del estudiante'),
      }),
      execute: async ({ studentId }) => {
        const student = await prisma.student.findFirst({
          where: { id: studentId, group: { course: { userId: user.id } } },
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        })
        return student
      },
    }),

    generateLessonPlan: tool({
      description: 'Genera un plan de clase completo usando IA. Devuelve objetivos, actividades, recursos y tarea en formato JSON.',
      inputSchema: z.object({
        topic: z.string().describe('Tema de la clase'),
        subject: z.string().optional().describe('Materia/asignatura'),
        grade: z.string().optional().describe('Grado o nivel'),
      }),
      execute: async ({ topic, subject, grade }) => {
        try {
          const prompt = `Genera un plan de clase completo para:
- Materia: ${subject || 'No especificada'}
- Grado/Nivel: ${grade || 'No especificado'}
- Tema: ${topic}`
          const text = await callAI({ system: SYSTEM_PROMPTS.lessonPlan, prompt })
          const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
          const outerBrace = cleaned.indexOf('{')
          const endBrace = cleaned.lastIndexOf('}')
          const json = outerBrace !== -1 && endBrace > outerBrace ? cleaned.slice(outerBrace, endBrace + 1) : cleaned
          const plan = JSON.parse(json)
          return {
            objectives: plan.objectives || '',
            activities: plan.activities || '',
            resources: plan.resources || '',
            homework: plan.homework || '',
          }
        } catch {
          return {
            objectives: `Comprender los conceptos fundamentales de ${topic}`,
            activities: '1. Introducción al tema (10 min)\n2. Desarrollo de contenidos (25 min)\n3. Actividad práctica (15 min)\n4. Cierre y preguntas (10 min)',
            resources: 'Pizarrón, materiales de lectura, computadora',
            homework: `Realizar un resumen de ${topic}`,
          }
        }
      },
    }),

    createClass: tool({
      description: 'Crea una clase (opcionalmente con plan de clase) en el sistema. Requiere groupId, fecha y tema. Los datos del plan son opcionales.',
      inputSchema: z.object({
        groupId: z.string().describe('ID del grupo'),
        date: z.string().describe('Fecha de la clase (YYYY-MM-DD)'),
        startTime: z.string().optional().describe('Hora de inicio (HH:mm)'),
        endTime: z.string().optional().describe('Hora de fin (HH:mm)'),
        topic: z.string().describe('Tema de la clase'),
        objectives: z.string().optional().describe('Objetivos de aprendizaje'),
        activities: z.string().optional().describe('Actividades de la clase'),
        resources: z.string().optional().describe('Recursos y materiales'),
        homework: z.string().optional().describe('Tarea o evaluación'),
      }),
      execute: async (params) => {
        const group = await prisma.group.findFirst({
          where: { id: params.groupId, course: { userId: user.id } },
          select: { id: true, name: true, course: { select: { name: true } } },
        })
        if (!group) throw new Error('Grupo no encontrado o no tienes acceso')

        const hasLessonData = params.objectives || params.activities || params.resources || params.homework

        const cls = await prisma.classSession.create({
          data: {
            date: new Date(params.date),
            startTime: params.startTime || null,
            endTime: params.endTime || null,
            topic: params.topic,
            status: 'PLANNED',
            groupId: params.groupId,
            ...(hasLessonData ? {
              lessonPlan: {
                create: {
                  objectives: params.objectives || null,
                  activities: params.activities || null,
                  resources: params.resources || null,
                  homework: params.homework || null,
                },
              },
            } : {}),
          },
          include: {
            lessonPlan: true,
            group: { select: { name: true, course: { select: { name: true } } } },
          },
        })

        return cls
      },
    }),

    listStudents: tool({
      description: 'Lista los estudiantes de un grupo',
      inputSchema: z.object({
        groupId: z.string().describe('ID del grupo'),
      }),
      execute: async ({ groupId }) => {
        const students = await prisma.student.findMany({
          where: { groupId, group: { course: { userId: user.id } } },
          orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
          select: { id: true, firstName: true, lastName: true, email: true },
        })
        return students
      },
    }),

    listClasses: tool({
      description: 'Lista las clases de un grupo',
      inputSchema: z.object({
        groupId: z.string().describe('ID del grupo'),
      }),
      execute: async ({ groupId }) => {
        const classes = await prisma.classSession.findMany({
          where: { groupId, group: { course: { userId: user.id } } },
          orderBy: { date: 'desc' },
          take: 20,
          select: { id: true, date: true, topic: true, status: true },
        })
        return classes
      },
    }),

    listObservations: tool({
      description: 'Lista las observaciones de un estudiante',
      inputSchema: z.object({
        studentId: z.string().describe('ID del estudiante'),
      }),
      execute: async ({ studentId }) => {
        const obs = await prisma.observation.findMany({
          where: { studentId, student: { group: { course: { userId: user.id } } } },
          orderBy: { createdAt: 'desc' },
          select: { id: true, description: true, type: true, createdAt: true },
        })
        return obs
      },
    }),

    createCourse: tool({
      description: 'Crea una nueva materia/curso. Requiere nombre.',
      inputSchema: z.object({
        name: z.string().describe('Nombre del curso/materia'),
        description: z.string().optional().describe('Descripción opcional'),
        color: z.string().optional().describe('Color hexadecimal (ej: #3B82F6)'),
      }),
      execute: async ({ name, description, color }) => {
        const course = await prisma.course.create({
          data: { name, description: description || null, color: color || '#3B82F6', userId: user.id },
          select: { id: true, name: true, description: true, color: true },
        })
        return course
      },
    }),

    createGroup: tool({
      description: 'Crea un nuevo grupo dentro de un curso',
      inputSchema: z.object({
        courseId: z.string().describe('ID del curso al que pertenece'),
        name: z.string().describe('Nombre del grupo (ej: 10-E)'),
        grade: z.string().optional().describe('Grado o nivel'),
      }),
      execute: async ({ courseId, name, grade }) => {
        const course = await prisma.course.findFirst({
          where: { id: courseId, userId: user.id },
          select: { id: true },
        })
        if (!course) throw new Error('Materia no encontrada o no tienes acceso')

        const group = await prisma.group.create({
          data: { name, grade: grade || null, courseId },
          select: { id: true, name: true, grade: true, courseId: true },
        })
        return group
      },
    }),

    createStudent: tool({
      description: 'Crea un nuevo estudiante en un grupo',
      inputSchema: z.object({
        groupId: z.string().describe('ID del grupo'),
        firstName: z.string().describe('Nombre del estudiante'),
        lastName: z.string().describe('Apellido del estudiante'),
        email: z.string().optional().describe('Email del estudiante'),
        phone: z.string().optional().describe('Teléfono del estudiante'),
      }),
      execute: async ({ groupId, firstName, lastName, email, phone }) => {
        const group = await prisma.group.findFirst({
          where: { id: groupId, course: { userId: user.id } },
          select: { id: true },
        })
        if (!group) throw new Error('Grupo no encontrado o no tienes acceso')

        const student = await prisma.student.create({
          data: { firstName, lastName, email: email || null, phone: phone || null, groupId },
          select: { id: true, firstName: true, lastName: true, email: true },
        })
        return student
      },
    }),

    createObservation: tool({
      description: 'Crea una observación para un estudiante',
      inputSchema: z.object({
        studentId: z.string().describe('ID del estudiante'),
        description: z.string().describe('Descripción de la observación'),
        type: z.enum(['ACADEMIC', 'BEHAVIOR']).optional().describe('Tipo: ACADEMIC o BEHAVIOR'),
      }),
      execute: async ({ studentId, description, type }) => {
        const student = await prisma.student.findFirst({
          where: { id: studentId, group: { course: { userId: user.id } } },
          select: { id: true },
        })
        if (!student) throw new Error('Estudiante no encontrado o no tienes acceso')

        const obs = await prisma.observation.create({
          data: { description, type: type || 'ACADEMIC', studentId, userId: user.id },
          select: { id: true, description: true, type: true, createdAt: true },
        })
        return obs
      },
    }),

    createPeriod: tool({
      description: 'Crea un período académico',
      inputSchema: z.object({
        name: z.string().describe('Nombre del período (ej: Período 1)'),
        startDate: z.string().describe('Fecha de inicio (YYYY-MM-DD)'),
        endDate: z.string().describe('Fecha de fin (YYYY-MM-DD)'),
        year: z.number().int().optional().describe('Año académico'),
      }),
      execute: async ({ name, startDate, endDate, year }) => {
        const period = await prisma.academicPeriod.create({
          data: { name, startDate: new Date(startDate), endDate: new Date(endDate), year: year || new Date().getFullYear(), userId: user.id },
          select: { id: true, name: true, startDate: true, endDate: true, year: true },
        })
        return period
      },
    }),

    editGroup: tool({
      description: 'Actualiza el nombre o grado de un grupo',
      inputSchema: z.object({
        groupId: z.string().describe('ID del grupo a editar'),
        name: z.string().optional().describe('Nuevo nombre del grupo'),
        grade: z.string().optional().describe('Nuevo grado'),
      }),
      execute: async ({ groupId, name, grade }) => {
        const existing = await prisma.group.findFirst({
          where: { id: groupId, course: { userId: user.id } },
          select: { id: true },
        })
        if (!existing) throw new Error('Grupo no encontrado o no tienes acceso')

        const data: Record<string, string> = {}
        if (name !== undefined) data.name = name
        if (grade !== undefined) data.grade = grade

        const group = await prisma.group.update({
          where: { id: groupId },
          data,
          select: { id: true, name: true, grade: true },
        })
        return group
      },
    }),

    deleteGroup: tool({
      description: 'Elimina un grupo (requiere confirmación del usuario)',
      inputSchema: z.object({
        groupId: z.string().describe('ID del grupo a eliminar'),
        confirm: z.boolean().describe('El usuario debe confirmar explícitamente con true'),
      }),
      execute: async ({ groupId, confirm }) => {
        if (!confirm) throw new Error('Debes confirmar la eliminación')

        const group = await prisma.group.findFirst({
          where: { id: groupId, course: { userId: user.id } },
          select: { id: true, name: true },
        })
        if (!group) throw new Error('Grupo no encontrado o no tienes acceso')

        await prisma.group.delete({ where: { id: groupId } })
        return { deleted: true, name: group.name }
      },
    }),
  }

  const messages = [
    { role: 'assistant' as const, content: '¡Hola! Soy AulaBot, tu asistente docente. Puedo consultar y gestionar cursos, grupos, estudiantes, clases, observaciones y períodos. ¿En qué te ayudo?' },
    ...history.map(h => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user' as const, content: message },
  ]

  try {
    const result = await generateText({
      model: zen.chatModel(AI_MODEL),
      system: systemPrompt,
      messages,
      tools,
      toolChoice: 'auto',
      stopWhen: isStepCount(5),
      maxOutputTokens: 4096,
    })

    if (result.text) {
      return { response: result.text }
    }

    if (result.steps && result.steps.length > 0) {
      const lastStep = result.steps[result.steps.length - 1]
      if (lastStep.text) {
        return { response: lastStep.text }
      }
    }

    return { response: 'Listo, la acción se ha completado. ¿Necesitas algo más?' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    console.error('Agent error:', msg)
    return { response: `Lo siento, ocurrió un error: ${msg}. Intenta de nuevo o reformula tu solicitud.` }
  }
}
