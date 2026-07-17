'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createObservation } from '@/modules/observations/observations.actions'
import { getStudentById } from '@/modules/students/students.actions'

function NewObservationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')

  useEffect(() => {
    const sid = searchParams.get('studentId')
    if (sid) {
      setStudentId(sid)
      getStudentById(sid).then((result) => {
        if (result.success) {
          const s = result.data as { firstName: string; lastName: string }
          setStudentName(`${s.lastName}, ${s.firstName}`)
        }
      })
    }
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createObservation(formData)

    if (!result.success) {
      setError(result.error)
    } else {
      router.push(`/students/${studentId}`)
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva observación</CardTitle>
        {studentName && (
          <p className="text-sm text-muted-foreground">Estudiante: {studentName}</p>
        )}
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="studentId" value={studentId} />

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select name="type" defaultValue="ACADEMIC">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACADEMIC">Académica</SelectItem>
                <SelectItem value="BEHAVIOR">Comportamiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe la observación..."
              rows={4}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit">Guardar observación</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function NewObservationPage() {
  return (
    <div className="max-w-lg mx-auto">
      <Suspense fallback={<div>Cargando...</div>}>
        <NewObservationForm />
      </Suspense>
    </div>
  )
}
