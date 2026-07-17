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
- Puedes CONSULTAR información del sistema (cursos, grupos, estudiantes, clases)
- Puedes CREAR clases completas con plan de clase (objetivos, actividades, recursos, tarea)
- Puedes GENERAR planes de clase usando IA
- Respondes preguntas sobre metodología y pedagogía
- Todo en español, tono cercano y profesional

Para realizar acciones en el sistema, usa las herramientas disponibles.
Cuando crees una clase, asegúrate de tener el groupId correcto.
El usuario debe aprobar antes de crear cualquier registro.

REGLAS:
- No inventes datos ni IDs
- Si no tienes suficiente información para actuar, pregunta al usuario
- Para generar un plan de clase, usa generateLessonPlan y luego createClass con esos datos
- Confirma siempre antes de crear o modificar datos`

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
        const prompt = `Genera un plan de clase completo para:
- Materia: ${subject || 'No especificada'}
- Grado/Nivel: ${grade || 'No especificado'}
- Tema: ${topic}`
        const text = await callAI({ system: SYSTEM_PROMPTS.lessonPlan, prompt })
        const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        const plan = JSON.parse(cleaned)
        return {
          objectives: plan.objectives || '',
          activities: plan.activities || '',
          resources: plan.resources || '',
          homework: plan.homework || '',
        }
      },
    }),

    createClass: tool({
      description: 'Crea una clase con plan de clase en el sistema. Requiere groupId, fecha, tema, y datos del plan.',
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
          select: { id: true },
        })
        if (!group) throw new Error('Grupo no encontrado o no tienes acceso')

        const cls = await prisma.classSession.create({
          data: {
            date: new Date(params.date),
            startTime: params.startTime || null,
            endTime: params.endTime || null,
            topic: params.topic,
            status: 'PLANNED',
            groupId: params.groupId,
            lessonPlan: {
              create: {
                objectives: params.objectives || null,
                activities: params.activities || null,
                resources: params.resources || null,
                homework: params.homework || null,
              },
            },
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
  }

  const messages = [
    { role: 'assistant' as const, content: '¡Hola! Soy AulaBot, tu asistente docente. ¿En qué puedo ayudarte? Puedo consultar tus cursos, grupos, y hasta crear clases con plan completo.' },
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
    console.error('Agent error:', e)
    return { response: 'Lo siento, ocurrió un error al procesar tu solicitud. Intenta de nuevo.' }
  }
}
