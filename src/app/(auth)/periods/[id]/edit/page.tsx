'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPeriodById, updatePeriod } from '@/modules/periods/periods.actions'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

type PageProps = { params: Promise<{ id: string }> }

export default function EditPeriodPage({ params }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [year, setYear] = useState('')
  const [dirty, setDirty] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id)
      const result = await getPeriodById(p.id)
      if (result.success) {
        setName(result.data.name)
        setStartDate(result.data.startDate.toISOString().split('T')[0])
        setEndDate(result.data.endDate.toISOString().split('T')[0])
        setYear(String(result.data.year))
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
    const result = await updatePeriod(id, formData)
    if (!result.success) {
      setError(result.error)
      setSaving(false)
    } else {
      router.push(`/periods/${id}`)
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
            <div className="grid grid-cols-2 gap-4">
              <div className={`${shimmer} h-10 w-full`} />
              <div className={`${shimmer} h-10 w-full`} />
            </div>
            <div className={`${shimmer} h-10 w-full`} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <Card className="glass-liquid">
        <CardHeader>
          <CardTitle>Editar período</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleSubmit} onChange={handleFormChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del período</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Bimestre I"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de inicio</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de fin</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
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
