'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createObservation, searchStudents } from '@/modules/observations/observations.actions'
import { Search, FileText, Users } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

type StudentResult = {
  id: string
  firstName: string
  lastName: string
  group: { id: string; name: string; course: { name: string } }
  _count: { observations: number }
}

function NewObservationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [studentId, setStudentId] = useState('')
  const [type, setType] = useState('ACADEMIC')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StudentResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null)
  const [dirty, setDirty] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const sid = searchParams.get('studentId')
    if (sid) {
      setStudentId(sid)
      searchStudents('').then((r) => {
        if (r.success) {
          const found = r.data.find((s: StudentResult) => s.id === sid)
          if (found) {
            setSelectedStudent(found)
            setSearchQuery(`${found.lastName}, ${found.firstName}`)
          }
        }
      })
    }
  }, [searchParams])

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (value.length < 2) { setSearchResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      const r = await searchStudents(value)
      if (r.success) setSearchResults(r.data)
      setSearching(false)
    }, 300)
  }, [])

  function selectStudent(s: StudentResult) {
    setSelectedStudent(s)
    setStudentId(s.id)
    setSearchQuery(`${s.lastName}, ${s.firstName}`)
    setSearchResults([])
    if (!dirty) setDirty(true)
  }

  const handleFormChange = useCallback(() => {
    if (!dirty) setDirty(true)
  }, [dirty])

  async function handleSubmit(formData: FormData) {
    if (!studentId) { setError('Selecciona un estudiante'); return }
    setError(null)
    setSaving(true)
    const result = await createObservation(formData)
    if (!result.success) {
      setError(result.error)
      setSaving(false)
    } else {
      router.push(`/students/${studentId}`)
      router.refresh()
    }
  }

  function handleCancel() {
    if (dirty) { setConfirmCancel(true) }
    else { router.back() }
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <Card className="glass-liquid">
        <CardHeader>
          <CardTitle>Nueva observación</CardTitle>
          <p className="text-sm text-muted-foreground">
            Busca un estudiante y registra una observación
          </p>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={handleSubmit} onChange={handleFormChange} className="space-y-4">
            <input type="hidden" name="studentId" value={studentId} />
            <input type="hidden" name="type" value={type} />

            <div className="space-y-2">
              <Label>Estudiante</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar por nombre o apellido..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
              </div>
              {searchResults.length > 0 && !selectedStudent && (
                <Card className="absolute z-10 mt-1 w-full shadow-lg">
                  <CardContent className="p-1">
                    {searchResults.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectStudent(s)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                      >
                        <span className="font-medium">{s.lastName}, {s.firstName}</span>
                        <span className="text-muted-foreground ml-2">
                          {s.group.course.name} - {s.group.name}
                        </span>
                        {s._count.observations > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({s._count.observations} obs)
                          </span>
                        )}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
              {searching && (
                <p className="text-xs text-muted-foreground mt-1">Buscando...</p>
              )}
              {selectedStudent && (
                <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-muted/50">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium">
                      {selectedStudent.lastName}, {selectedStudent.firstName}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {selectedStudent.group.course.name} - {selectedStudent.group.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedStudent(null); setStudentId(''); setSearchQuery('') }}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cambiar
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-select">Tipo</Label>
              <Select value={type} onValueChange={(v) => typeof v === 'string' && setType(v)}>
                <SelectTrigger id="type-select">
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
                placeholder="Describe la observación en detalle..."
                rows={5}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar observación'}
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

export default function NewObservationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="animate-shimmer rounded-xl h-64 w-full" />
      </div>
    }>
      <NewObservationForm />
    </Suspense>
  )
}
