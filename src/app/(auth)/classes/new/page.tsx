'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClassWithPlan } from '@/modules/classes/classes.actions'
import { getGroupById } from '@/modules/groups/groups.actions'
import { generateLessonPlan, generateActivities } from '@/modules/ai/ai.actions'
import { AiSuggestButton, AiGenerateButton } from '@/components/ai/ai-suggest-button'

export default function NewClassPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId: string }>
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [groupName, setGroupName] = useState('')
  const [groupId, setGroupId] = useState('')
  const [courseName, setCourseName] = useState('')
  const [grade, setGrade] = useState('')
  const [topic, setTopic] = useState('')
  const [objectives, setObjectives] = useState('')
  const [activities, setActivities] = useState('')
  const [resources, setResources] = useState('')
  const [homework, setHomework] = useState('')

  useEffect(() => {
    searchParams.then(async (p) => {
      setGroupId(p.groupId)
      if (p.groupId) {
        const result = await getGroupById(p.groupId)
        if (result.success) {
          const group = result.data as { course: { name: string }; name: string; grade?: string | null }
          setGroupName(`${group.course.name} - ${group.name}`)
          setCourseName(group.course.name)
          setGrade(group.grade || '')
        }
      }
    })
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createClassWithPlan(formData)

    if (!result.success) {
      setError(result.error)
    } else {
      const classSession = result.data as { id: string }
      router.push(`/classes/${classSession.id}`)
      router.refresh()
    }
  }

  function fillPlan(data: Record<string, string>) {
    if (data.objectives) setObjectives(data.objectives)
    if (data.activities) setActivities(data.activities)
    if (data.resources) setResources(data.resources)
    if (data.homework) setHomework(data.homework)
  }

  const aiContext = { topic, subject: courseName, grade }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Planificar clase</CardTitle>
          {groupName && (
            <p className="text-sm text-muted-foreground">{groupName}</p>
          )}
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {groupId && <input type="hidden" name="groupId" value={groupId} />}

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora inicio</Label>
                <Input id="startTime" name="startTime" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora fin</Label>
                <Input id="endTime" name="endTime" type="time" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Tema de la clase</Label>
              <Input id="topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej: Ecuaciones cuadráticas" required />
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Plan de clase (opcional)</h3>
                <AiGenerateButton
                  action={generateLessonPlan}
                  formData={aiContext}
                  onResult={fillPlan}
                  label="✨ Generar plan completo"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="objectives">Objetivos</Label>
                </div>
                <Textarea
                  id="objectives"
                  name="objectives"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="¿Qué aprendizajes esperas lograr?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="activities">Actividades</Label>
                  <AiSuggestButton
                    action={generateActivities}
                    formData={aiContext}
                    onResult={(v) => setActivities(v)}
                    label="✨ Sugerir"
                  />
                </div>
                <Textarea
                  id="activities"
                  name="activities"
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  placeholder="Describe las actividades de la clase"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resources">Recursos / Materiales</Label>
                <Textarea
                  id="resources"
                  name="resources"
                  value={resources}
                  onChange={(e) => setResources(e.target.value)}
                  placeholder="Libros, videos, guías, etc."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="homework">Tarea / Evaluación</Label>
                <Textarea
                  id="homework"
                  name="homework"
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  placeholder="Tareas o actividades de evaluación"
                  rows={2}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit">Crear clase</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
