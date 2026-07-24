'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

type Course = {
  id: string
  name: string
  color: string | null
  groups: { id: string; name: string }[]
}

export function ObservationsFilters({ courses }: { courses: Course[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') || ''
  const currentCourseId = searchParams.get('courseId') || ''
  const currentGroupId = searchParams.get('groupId') || ''
  const currentQ = searchParams.get('q') || ''

  const selectedCourse = courses.find((c) => c.id === currentCourseId)

  function setParam(key: string, value: string) {
    const url = new URL(window.location.href)
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
    if (key === 'courseId') url.searchParams.delete('groupId')
    router.push(url.toString())
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const q = data.get('q') as string
    setParam('q', q)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <form onSubmit={handleSearch} className="relative flex-1">
        <input
          name="q"
          defaultValue={currentQ}
          placeholder="Buscar por descripción, estudiante o grupo..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </form>

      <div className="flex gap-2 flex-wrap">
        <select
          value={currentType}
          onChange={(e) => setParam('type', e.target.value)}
          className="h-10 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todos los tipos</option>
          <option value="ACADEMIC">Académicas</option>
          <option value="BEHAVIOR">Comportamiento</option>
        </select>

        <select
          value={currentCourseId}
          onChange={(e) => setParam('courseId', e.target.value)}
          className="h-10 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todas las materias</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {currentCourseId && selectedCourse && (
          <select
            value={currentGroupId}
            onChange={(e) => setParam('groupId', e.target.value)}
            className="h-10 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Todos los grupos</option>
            {selectedCourse.groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
