'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCourseById, updateCourse } from '@/modules/courses/courses.actions'

type PageProps = {
  params: Promise<{ id: string }>
}

export default function EditCoursePage({ params }: PageProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3B82F6')

  useEffect(() => {
    params.then(async (p) => {
      setId(p.id)
      const result = await getCourseById(p.id)
      if (result.success) {
        setName(result.data.name)
        setDescription(result.data.description || '')
        setColor(result.data.color)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    })
  }, [params])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await updateCourse(id, formData)

    if (!result.success) {
      setError(result.error)
    } else {
      router.push(`/courses/${id}`)
      router.refresh()
    }
  }

  if (loading) {
    const shimmer = 'animate-shimmer rounded'
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card>
          <CardHeader>
            <div className={`${shimmer} h-6 w-40`} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className={`${shimmer} h-4 w-32`} />
              <div className={`${shimmer} h-10 w-full`} />
            </div>
            <div className="space-y-2">
              <div className={`${shimmer} h-4 w-32`} />
              <div className={`${shimmer} h-10 w-full`} />
            </div>
            <div className="space-y-2">
              <div className={`${shimmer} h-4 w-16`} />
              <div className={`${shimmer} h-10 w-20`} />
            </div>
            <div className="flex gap-2 pt-2">
              <div className={`${shimmer} h-8 w-20`} />
              <div className={`${shimmer} h-8 w-32`} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <p className="text-muted-foreground">Materia no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/courses')}>
          Volver a materias
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Editar materia</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la materia</Label>
              <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" name="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-24 cursor-pointer" />
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
