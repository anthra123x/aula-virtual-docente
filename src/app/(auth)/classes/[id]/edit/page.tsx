'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getClassById, updateClass, updateLessonPlan } from '@/modules/classes/classes.actions'
import { generateLessonPlan, generateActivities } from '@/modules/ai/ai.actions'
import { AiSuggestButton, AiGenerateButton } from '@/components/ai/ai-suggest-button'

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditClassPage({ params }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [topic, setTopic] = useState('')
  const [objectives, setObjectives] = useState('')
  const [activities, setActivities] = useState('')
  const [resources, setResources] = useState('')
  const [homework, setHomework] = useState('')
  const [courseName, setCourseName] = useState('')
  const [grade, setGrade] = useState('')

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id)
      const result = await getClassById(p.id)
      if (result.success) {
        const cls = result.data as {
          date: Date
          startTime?: string | null
          endTime?: string | null
          topic: string
          group: { course: { name: string }; grade?: string | null }
          lessonPlan?: {
            objectives?: string | null
            activities?: string | null
            resources?: string | null
            homework?: string | null
          } | null
        }
        setCourseName(cls.group.course.name)
        setGrade(cls.group.grade || '')
        setDate(new Date(cls.date).toISOString().split('T')[0])
        setStartTime(cls.startTime || '')
        setEndTime(cls.endTime || '')
        setTopic(cls.topic)
        setObjectives(cls.lessonPlan?.objectives || '')
        setActivities(cls.lessonPlan?.activities || '')
        setResources(cls.lessonPlan?.resources || '')
        setHomework(cls.lessonPlan?.homework || '')
      } else {
        setError(result.error)
      }
      setLoading(false)
    })
  }, [params])

  async function handleSubmit(formData: FormData) {
    setError(null)

    const classResult = await updateClass(id, formData)
    if (!classResult.success) {
      setError(classResult.error)
      return
    }

    const planResult = await updateLessonPlan(id, formData)
    if (!planResult.success) {
      setError(planResult.error)
      return
    }

    router.push(`/classes/${id}`)
    router.refresh()
  }

  function fillPlan(data: Record<string, string>) {
    if (data.objectives) setObjectives(data.objectives)
    if (data.activities) setActivities(data.activities)
    if (data.resources) setResources(data.resources)
    if (data.homework) setHomework(data.homework)
  }

  if (loading) return null

  const aiContext = { topic, subject: courseName, grade }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar clase</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora inicio</Label>
                <Input id="startTime" name="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora fin</Label>
                <Input id="endTime" name="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Tema de la clase</Label>
              <Input id="topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} required />
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Plan de clase</h3>
                <AiGenerateButton
                  action={generateLessonPlan}
                  formData={aiContext}
                  onResult={fillPlan}
                  label="✨ Regenerar plan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Objetivos</Label>
                <Textarea
                  id="objectives"
                  name="objectives"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
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
                  rows={2}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
