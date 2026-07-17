'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

type AiSuggestButtonProps = {
  action: (formData: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>
  formData: Record<string, string>
  onResult: (value: string) => void
  label?: string
  field?: string
}

export function AiSuggestButton({
  action,
  formData,
  onResult,
  label = 'Sugerir',
  field,
}: AiSuggestButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    const fd = new FormData()
    for (const [key, value] of Object.entries(formData)) {
      fd.append(key, value)
    }

    const result = await action(fd)

    if (result.success) {
      const data = result.data as Record<string, string>
      if (field && data[field]) {
        onResult(data[field])
      } else if (typeof result.data === 'string') {
        onResult(result.data as string)
      }
    } else {
      setError(result.error || 'Error inesperado')
    }

    setLoading(false)
  }

  return (
    <div>
      <Button type="button" variant="outline" size="xs" onClick={handleClick} disabled={loading}>
        {loading ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3 mr-1" />
        )}
        {loading ? 'Pensando...' : label}
      </Button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

export function AiGenerateButton({
  action,
  formData,
  onResult,
  label = 'Generar plan completo',
}: {
  action: (formData: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>
  formData: Record<string, string>
  onResult: (data: Record<string, string>) => void
  label?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)

    const fd = new FormData()
    for (const [key, value] of Object.entries(formData)) {
      fd.append(key, value)
    }

    const result = await action(fd)

    if (result.success) {
      onResult(result.data as Record<string, string>)
    } else {
      setError(result.error || 'Error inesperado')
    }

    setLoading(false)
  }

  return (
    <div>
      <Button type="button" variant="secondary" size="sm" onClick={handleClick} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 mr-1" />
        )}
        {loading ? 'Generando...' : label}
      </Button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}
