'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getObservationById, updateObservation } from '@/modules/observations/observations.actions'

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditObservationPage({ params }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('ACADEMIC')

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id)
      const result = await getObservationById(p.id)
      if (result.success) {
        const obs = result.data as { description: string; type: string; studentId: string }
        setStudentId(obs.studentId)
        setDescription(obs.description)
        setType(obs.type || 'ACADEMIC')
      }
      setLoading(false)
    })
  }, [params])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await updateObservation(id, formData)

    if (!result.success) {
      setError(result.error)
    } else {
      router.push(`/students/${studentId}`)
      router.refresh()
    }
  }

  if (loading) return null

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar observación</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select name="type" defaultValue={type}>
                <SelectTrigger>
                  <SelectValue />
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
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
