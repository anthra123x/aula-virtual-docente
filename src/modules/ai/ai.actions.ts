'use server'

import { callAI, SYSTEM_PROMPTS } from '@/lib/ai'
import { requireAuth } from '@/modules/auth/auth.actions'
import { rateLimit } from '@/lib/rate-limit'
import { success, failure, type ActionResult } from '@/types'

type PlanSuggestion = {
  objectives: string
  activities: string
  resources: string
  homework: string
}

export async function generateLessonPlan(formData: FormData): Promise<ActionResult<PlanSuggestion>> {
  const user = await requireAuth()

  const rl = rateLimit(`ai:${user.id}`, 20, 60000)
  if (!rl.ok) return failure('Has alcanzado el límite de solicitudes. Espera un momento antes de intentar de nuevo.')

  const topic = formData.get('topic') as string
  const subject = formData.get('subject') as string || ''
  const grade = formData.get('grade') as string || ''
  const duration = formData.get('duration') as string || ''

  if (!topic || topic.length < 2) {
    return failure('El tema debe tener al menos 2 caracteres')
  }

  const prompt = `Genera un plan de clase completo para:
- Materia: ${subject || 'No especificada'}
- Grado/Nivel: ${grade || 'No especificado'}
- Tema: ${topic}
- Duración: ${duration || 'No especificada'}

Incluye objetivos de aprendizaje claros, actividades detalladas paso a paso, recursos necesarios, y tarea/evaluación.`

  try {
    const text = await callAI({ system: SYSTEM_PROMPTS.lessonPlan, prompt })
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const plan = JSON.parse(cleaned) as PlanSuggestion

    if (!plan.objectives && !plan.activities && !plan.resources && !plan.homework) {
      return failure('La IA no pudo generar un plan válido. Intenta de nuevo.')
    }

    return success(plan)
  } catch {
    return failure('Error al generar el plan. Verifica la API key o intenta de nuevo.')
  }
}

export async function generateActivities(formData: FormData): Promise<ActionResult<string>> {
  const user = await requireAuth()

  const rl = rateLimit(`ai:${user.id}`, 20, 60000)
  if (!rl.ok) return failure('Has alcanzado el límite de solicitudes. Espera un momento antes de intentar de nuevo.')

  const topic = formData.get('topic') as string
  const subject = formData.get('subject') as string || ''
  const grade = formData.get('grade') as string || ''

  if (!topic) {
    return failure('El tema es requerido')
  }

  const prompt = `Genera actividades para una clase de:
- Materia: ${subject || 'No especificada'}
- Grado: ${grade || 'No especificado'}
- Tema: ${topic}`

  try {
    const text = await callAI({ system: SYSTEM_PROMPTS.activities, prompt })
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const result = JSON.parse(cleaned)
    const activities = Array.isArray(result.activities) ? result.activities.join('\n') : text
    return success(activities)
  } catch {
    return failure('Error al generar actividades. Intenta de nuevo.')
  }
}

export async function generateEvaluation(formData: FormData): Promise<ActionResult<string>> {
  const user = await requireAuth()

  const rl = rateLimit(`ai:${user.id}`, 20, 60000)
  if (!rl.ok) return failure('Has alcanzado el límite de solicitudes. Espera un momento antes de intentar de nuevo.')

  const topic = formData.get('topic') as string
  const grade = formData.get('grade') as string || ''
  const evalType = formData.get('evalType') as string || 'questions'

  if (!topic) {
    return failure('El tema es requerido')
  }

  const prompt = `Genera una evaluación tipo "${evalType}" para:
- Grado: ${grade || 'No especificado'}
- Tema: ${topic}

${evalType === 'questions' ? 'Genera 5 preguntas con sus respuestas.' : 'Genera una rúbrica con al menos 4 criterios y 3 niveles de desempeño.'}`

  try {
    const text = await callAI({ system: SYSTEM_PROMPTS.evaluation, prompt })
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    if (evalType === 'questions') {
      const parsed = JSON.parse(cleaned)
      const items = parsed.questions || parsed.preguntas || []
      const questions = Array.isArray(items)
        ? items.map((q: { question?: string; pregunta?: string; answer?: string; respuesta?: string }) =>
            `${q.question || q.pregunta}\n${q.answer || q.respuesta}`
          ).join('\n\n')
        : text
      return success(questions)
    }

    return success(cleaned)
  } catch {
    return failure('Error al generar evaluación. Intenta de nuevo.')
  }
}

export async function optimizeLessonPlan(formData: FormData): Promise<ActionResult<PlanSuggestion>> {
  const user = await requireAuth()

  const rl = rateLimit(`ai:${user.id}`, 20, 60000)
  if (!rl.ok) return failure('Has alcanzado el límite de solicitudes. Espera un momento antes de intentar de nuevo.')

  const instruction = formData.get('instruction') as string
  const currentPlan = formData.get('currentPlan') as string

  if (!instruction || !currentPlan) {
    return failure('Se requiere una instrucción y el plan actual')
  }

  const prompt = `Instrucción del docente: ${instruction}

Plan de clase actual:
${currentPlan}

Aplica la instrucción y devuelve el plan mejorado.`

  try {
    const text = await callAI({ system: SYSTEM_PROMPTS.optimize, prompt })
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const plan = JSON.parse(cleaned) as PlanSuggestion
    return success(plan)
  } catch {
    return failure('Error al optimizar el plan. Intenta de nuevo.')
  }
}
