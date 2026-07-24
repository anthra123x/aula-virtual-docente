'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { getClassById, updateClass, updateLessonPlan } from '@/modules/classes/classes.actions'
import { generateLessonPlan, generateActivities } from '@/modules/ai/ai.actions'
import { AiSuggestButton, AiGenerateButton } from '@/components/ai/ai-suggest-button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

type PageProps = { params: Promise<{ id: string }> }

export default function EditClassPage({ params }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [id, setId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [topic, setTopic] = useState('')
  const [status, setStatus] = useState<string>('PLANNED')
  const [objectives, setObjectives] = useState('')
  const [activities, setActivities] = useState('')
  const [resources, setResources] = useState('')
  const [homework, setHomework] = useState('')
  const [courseName, setCourseName] = useState('')
  const [dirty, setDirty] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id)
      const result = await getClassById(p.id)
      if (result.success) {
        const cls = result.data as any
        setCourseName(cls.group.course.name)
        setDate(new Date(cls.date).toISOString().split('T')[0])
        setStartTime(cls.startTime || '')
        setEndTime(cls.endTime || '')
        setTopic(cls.topic)
        setStatus(cls.status || 'PLANNED')
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

  const handleFormChange = useCallback(() => {
    if (!dirty) setDirty(true)
  }, [dirty])

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSaving(true)
    const classResult = await updateClass(id, formData)
    if (!classResult.success) { setError(classResult.error); setSaving(false); return }
    const planResult = await updateLessonPlan(id, formData)
    if (!planResult.success) { setError(planResult.error); setSaving(false); return }
    router.push(`/classes/${id}`)
    router.refresh()
  }

  function handleCancel() {
    if (dirty) { setConfirmCancel(true) }
    else { router.back() }
  }

  if (loading) {
    const shimmer = 'animate-shimmer rounded'
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card>
          <CardHeader>
            <div className={`${shimmer} h-6 w-36`} />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${shimmer} h-10 w-full`} />
            ))}
            <div className="space-y-4 border rounded-lg p-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`${shimmer} h-20 w-full`} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function fillPlan(data: Record<string, string>) {
    if (data.objectives) setObjectives(data.objectives)
    if (data.activities) setActivities(data.activities)
    if (data.resources) setResources(data.resources)
    if (data.homework) setHomework(data.homework)
  }

  const aiContext = { topic, subject: courseName, grade: '' }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="glass-liquid">
        <CardHeader>
          <CardTitle>Editar clase</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleSubmit} onChange={handleFormChange} className="space-y-6">
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

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <input type="hidden" name="status" value={status} />
              <Select value={status} onValueChange={(v) => typeof v === 'string' && setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNED">Planificada</SelectItem>
                  <SelectItem value="DONE">Realizada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 border border-border/60 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Plan de clase</h3>
                <AiGenerateButton action={generateLessonPlan} formData={aiContext}
                  onResult={fillPlan} label="✨ Regenerar plan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectives">Objetivos</Label>
                <Textarea id="objectives" name="objectives" value={objectives}
                  onChange={(e) => setObjectives(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="activities">Actividades</Label>
                  <AiSuggestButton action={generateActivities} formData={aiContext}
                    onResult={(v) => setActivities(v)} label="✨ Sugerir" />
                </div>
                <Textarea id="activities" name="activities" value={activities}
                  onChange={(e) => setActivities(e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resources">Recursos / Materiales</Label>
                <Textarea id="resources" name="resources" value={resources}
                  onChange={(e) => setResources(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homework">Tarea / Evaluación</Label>
                <Textarea id="homework" name="homework" value={homework}
                  onChange={(e) => setHomework(e.target.value)} rows={2} />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Descartar cambios?</DialogTitle>
            <DialogDescription>
              Hay cambios sin guardar. Si cancelas se perderán las modificaciones.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>
              Seguir editando
            </Button>
            <Button variant="destructive" onClick={() => router.back()}>
              Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
