import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'

export const zen = createOpenAICompatible({
  name: 'zen',
  baseURL: 'https://opencode.ai/zen/v1',
  apiKey: process.env.ZEN_API_KEY || '',
})

export const AI_MODEL = 'deepseek-v4-flash-free'

export async function callAI({
  system,
  prompt,
  maxOutputTokens = 2048,
}: {
  system: string
  prompt: string
  maxOutputTokens?: number
}) {
  const { text } = await generateText({
    model: zen.chatModel(AI_MODEL),
    system,
    prompt,
    maxOutputTokens,
  })
  return text
}

export const SYSTEM_PROMPTS = {
  lessonPlan: `Eres un docente experto en planificación de clases. Tu tarea es generar planes de clase completos en español.
Debes devolver SOLO un objeto JSON válido con esta estructura exacta, sin texto adicional antes ni después:
{
  "objectives": "objetivos de aprendizaje",
  "activities": "actividades paso a paso",
  "resources": "recursos y materiales",
  "homework": "tarea o evaluación"
}

Los objetivos deben ser claros y medibles.
Las actividades deben estar numeradas y detalladas.
Los recursos deben ser concretos y disponibles.
La tarea debe reforzar lo aprendido.`,

  activities: `Eres un docente experto en diseño de actividades pedagógicas.
Genera entre 3 y 5 actividades numeradas para una clase específica.
Cada actividad debe incluir: nombre, descripción breve, y tiempo estimado.
Devuelve SOLO un JSON con un array "activities": ["1. ...", "2. ...", etc].`,

  evaluation: `Eres un docente experto en evaluación educativa.
Genera preguntas o una rúbrica de evaluación según el tipo solicitado.
Si el tipo es "questions", genera 5 preguntas con sus respuestas.
Si el tipo es "rubric", genera una rúbrica con criterios y niveles.
Devuelve SOLO un JSON con la estructura apropiada.`,

  optimize: `Eres un docente experto en mejora de planes de clase.
Recibes un plan de clase actual y una instrucción del docente sobre cómo mejorarlo.
Devuelves el plan mejorado manteniendo la misma estructura JSON:
{
  "objectives": "objetivos mejorados",
  "activities": "actividades mejoradas",
  "resources": "recursos mejorados",
  "homework": "tarea mejorada"
}
Devuelve SOLO el JSON, sin texto adicional.`,
}
