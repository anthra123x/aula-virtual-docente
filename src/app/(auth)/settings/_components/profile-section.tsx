'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { updateProfile } from '@/modules/settings/settings.actions'
import { User, Save } from 'lucide-react'

type Props = {
  user: { id: string; email: string; name: string; avatar: string | null }
}

export function ProfileSection({ user }: Props) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const dirty = name !== user.name
  const formRef = useRef<HTMLFormElement>(null)

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    setSaving(true)
    const result = await updateProfile(formData)
    if (!result.success) {
      setError(result.error)
      setSaving(false)
    } else {
      setSuccess(true)
      setSaving(false)
      router.refresh()
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  return (
    <Card className="glass-liquid">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <AvatarFallback className="text-sm">{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Tu información personal</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Correo electrónico</Label>
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {user.email}
            </div>
            <p className="text-xs text-muted-foreground">El correo no se puede modificar</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">Perfil actualizado</p>}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={!dirty || saving} size="sm">
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Guardando...' : 'Guardar perfil'}
            </Button>
            {dirty && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setName(user.name)}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
