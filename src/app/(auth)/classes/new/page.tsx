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
import { createClassWithPlan, getAllGroups } from '@/modules/classes/classes.actions'
import { generateLessonPlan, generateActivities } from '@/modules/ai/ai.actions'
import { AiSuggestButton, AiGenerateButton } from '@/components/ai/ai-suggest-button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

type PageProps = {
  searchParams: Promise<{ groupId?: string }>
}

export default function NewClassPage({ searchParams }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [groupId, setGroupId] = useState('')
  const [groups, setGroups] = useState<{ id: string; name: string; courseName: string }[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [topic, setTopic] = useState('')
  const [objectives, setObjectives] = useState('')
  const [activities, setActivities] = useState('')
  const [resources, setResources] = useState('')
  const [homework, setHomework] = useState('')
  const [dirty, setDirty] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    Promise.all([
      searchParams.then((p) => setGroupId(p.groupId || '')),
      getAllGroups().then((r) => { if (r.success) setGroups(r.data) }),
    ]).finally(() => setLoadingGroups(false))
  }, [searchParams])

  const handleFormChange = useCallback(() => {
    if (!dirty) setDirty(true)
  }, [dirty])

  async function handleSubmit(formData: FormData) {
    if (!groupId) { setError('Selecciona un grupo'); return }
    setError(null)
    const result = await createClassWithPlan(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      const data = result.data as { id: string }
      router.push(`/classes/${data.id}`)
      router.refresh()
    }
  }

  function handleCancel() {
    if (dirty) { setConfirmCancel(true) }
    else { router.back() }
  }

  const selectedGroup = groups.find((g) => g.id === groupId)
  const courseName = selectedGroup?.courseName || ''
  const grade = ''

  if (loadingGroups) {
    const shimmer = 'animate-shimmer rounded'
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card>
          <CardHeader>
            <div className={`${shimmer} h-6 w-36`} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`${shimmer} h-10 w-full`} />
            <div className={`${shimmer} h-10 w-full`} />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${shimmer} h-4 w-24`} />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!groupId) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card className="glass-liquid">
          <CardHeader>
            <CardTitle>Nueva clase</CardTitle>
            <p className="text-sm text-muted-foreground">Selecciona el grupo para la clase</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Grupo</Label>
              <Select value={groupId || undefined} onValueChange={(v) => typeof v === 'string' && setGroupId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grupo..." />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.courseName} - {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => groupId && setDirty(true)} disabled={!groupId}>
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const aiContext = { topic, subject: courseName, grade }

  function fillPlan(data: Record<string, string>) {
    if (data.objectives) setObjectives(data.objectives)
    if (data.activities) setActivities(data.activities)
    if (data.resources) setResources(data.resources)
    if (data.homework) setHomework(data.homework)
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="glass-liquid">
        <CardHeader>
          <CardTitle>Planificar clase</CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedGroup?.courseName} - {selectedGroup?.name}
          </p>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleSubmit} onChange={handleFormChange} className="space-y-6">
            <input type="hidden" name="groupId" value={groupId} />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="date" className="text-sm">Fecha</Label>
                <Input id="date" name="date" type="date" required className="text-sm" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="startTime" className="text-sm">Inicio</Label>
                <Input id="startTime" name="startTime" type="time" className="text-sm" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="endTime" className="text-sm">Fin</Label>
                <Input id="endTime" name="endTime" type="time" className="text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Tema de la clase</Label>
              <Input id="topic" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej: Ecuaciones cuadráticas" required />
            </div>

            <div className="space-y-4 border border-border/60 rounded-lg p-4">
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
                <Label htmlFor="objectives">Objetivos</Label>
                <Textarea id="objectives" name="objectives" value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="¿Qué aprendizajes esperas lograr?" rows={3} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="activities">Actividades</Label>
                  <AiSuggestButton action={generateActivities} formData={aiContext}
                    onResult={(v) => setActivities(v)} label="✨ Sugerir" />
                </div>
                <Textarea id="activities" name="activities" value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  placeholder="Describe las actividades de la clase" rows={4} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resources">Recursos / Materiales</Label>
                <Textarea id="resources" name="resources" value={resources}
                  onChange={(e) => setResources(e.target.value)}
                  placeholder="Libros, videos, guías, etc." rows={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="homework">Tarea / Evaluación</Label>
                <Textarea id="homework" name="homework" value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  placeholder="Tareas o actividades de evaluación" rows={2} />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit">Crear clase</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Descartar cambios?</DialogTitle>
            <DialogDescription>
              Hay cambios sin guardar. Si cancelas se perderán los datos ingresados.
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
