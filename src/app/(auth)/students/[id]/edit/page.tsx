'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getStudentById, updateStudent } from '@/modules/students/students.actions'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditStudentPage({ params }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [id, setId] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dirty, setDirty] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id)
      const result = await getStudentById(p.id)
      if (result.success) {
        setFirstName(result.data.firstName)
        setLastName(result.data.lastName)
        setEmail(result.data.email || '')
        setPhone(result.data.phone || '')
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
    const result = await updateStudent(id, formData)

    if (!result.success) {
      setError(result.error)
      setSaving(false)
    } else {
      router.push(`/students/${id}`)
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
            <div className={`${shimmer} h-6 w-36`} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`${shimmer} h-4 w-20`} />
            <div className="grid grid-cols-2 gap-4">
              <div className={`${shimmer} h-10 w-full`} />
              <div className={`${shimmer} h-10 w-full`} />
            </div>
            <div className={`${shimmer} h-4 w-28`} />
            <div className={`${shimmer} h-10 w-full`} />
            <div className={`${shimmer} h-4 w-20`} />
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
          <CardTitle>Editar estudiante</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleSubmit} onChange={handleFormChange} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico (opcional)</Label>
              <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
