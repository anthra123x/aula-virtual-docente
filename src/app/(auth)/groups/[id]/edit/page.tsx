'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGroupById, updateGroup } from '@/modules/groups/groups.actions'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditGroupPage({ params }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [dirty, setDirty] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id)
      const result = await getGroupById(p.id)
      if (result.success) {
        setName(result.data.name)
        setGrade(result.data.grade || '')
      }
      setLoading(false)
    })
  }, [params])

  const handleFormChange = useCallback(() => {
    if (!dirty) setDirty(true)
  }, [dirty])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await updateGroup(id, formData)

    if (!result.success) {
      setError(result.error)
    } else {
      setDirty(false)
      router.push(`/groups/${id}`)
      router.refresh()
    }
  }

  function handleCancel() {
    if (dirty) {
      setConfirmCancel(true)
    } else {
      router.back()
    }
  }

  if (loading) {
    const shimmer = 'animate-shimmer rounded'
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card>
          <CardHeader>
            <div className={`${shimmer} h-6 w-32`} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`${shimmer} h-4 w-24`} />
            <div className={`${shimmer} h-10 w-full`} />
            <div className={`${shimmer} h-4 w-28`} />
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
          <CardTitle>Editar grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleSubmit} onChange={handleFormChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del grupo</Label>
              <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grado / Año (opcional)</Label>
              <Input id="grade" name="grade" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
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
