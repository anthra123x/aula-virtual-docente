'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getObservationById, updateObservation } from '@/modules/observations/observations.actions'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

type PageProps = { params: Promise<{ id: string }> }

export default function EditObservationPage({ params }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [id, setId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('ACADEMIC')
  const [dirty, setDirty] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id)
      const result = await getObservationById(p.id)
      if (result.success) {
        setStudentId(result.data.studentId)
        setDescription(result.data.description)
        setType(result.data.type || 'ACADEMIC')
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
    const result = await updateObservation(id, formData)

    if (!result.success) {
      setError(result.error)
      setSaving(false)
    } else {
      router.push(`/observations/${id}`)
      router.refresh()
    }
  }

  function handleCancel() {
    if (dirty) { setConfirmCancel(true) }
    else { router.back() }
  }

  if (loading) {
    const shimmer = 'animate-shimmer rounded'
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card>
          <CardHeader>
            <div className={`${shimmer} h-6 w-36`} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`${shimmer} h-10 w-full`} />
            <div className={`${shimmer} h-4 w-24`} />
            <div className={`${shimmer} h-24 w-full`} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <Card className="glass-liquid">
        <CardHeader>
          <CardTitle>Editar observación</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleSubmit} onChange={handleFormChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(v) => typeof v === 'string' && setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACADEMIC">Académica</SelectItem>
                  <SelectItem value="BEHAVIOR">Comportamiento</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="type" value={type} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
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
