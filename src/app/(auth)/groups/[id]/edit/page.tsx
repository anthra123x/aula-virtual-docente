'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getGroupById, updateGroup } from '@/modules/groups/groups.actions'

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

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id)
      const result = await getGroupById(p.id)
      if (result.success) {
        const group = result.data as { name: string; grade?: string | null }
        setName(group.name)
        setGrade(group.grade || '')
      }
      setLoading(false)
    })
  }, [params])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await updateGroup(id, formData)

    if (!result.success) {
      setError(result.error)
    } else {
      router.push(`/groups/${id}`)
      router.refresh()
    }
  }

  if (loading) return null

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
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
