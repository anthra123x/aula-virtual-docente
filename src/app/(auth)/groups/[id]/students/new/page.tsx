'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createStudent } from '@/modules/students/students.actions'
import { useState, useEffect } from 'react'

export default function NewStudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [groupId, setGroupId] = useState<string>('')

  useEffect(() => {
    params.then((p) => setGroupId(p.id))
  }, [params])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createStudent(formData)

    if (!result.success) {
      setError(result.error)
    } else {
      router.push(`/groups/${groupId}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo estudiante</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {groupId && <input type="hidden" name="groupId" value={groupId} />}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico (opcional)</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input id="phone" name="phone" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit">Agregar estudiante</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
