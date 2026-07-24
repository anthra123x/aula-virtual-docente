'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { updateSetting } from '@/modules/settings/settings.actions'
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react'

const ACCENT_COLORS = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Violeta', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Ámbar', value: '#F59E0B' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cian', value: '#06B6D4' },
  { name: 'Pizarra', value: '#64748B' },
]

type Props = {
  currentAccent: string
}

export function AppearanceSection({ currentAccent }: Props) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [accentColor, setAccentColor] = useState(currentAccent)
  const [savingColor, setSavingColor] = useState(false)
  const [customColor, setCustomColor] = useState(
    ACCENT_COLORS.some((c) => c.value === currentAccent) ? '' : currentAccent
  )

  useEffect(() => setMounted(true), [])

  async function handleThemeChange(newTheme: string) {
    setTheme(newTheme)
    await updateSetting('theme', newTheme)
    router.refresh()
  }

  async function handleAccentChange(color: string) {
    setAccentColor(color)
    setSavingColor(true)
    await updateSetting('accentColor', color)
    setSavingColor(false)
    router.refresh()
  }

  if (!mounted) return null

  const themeOptions = [
    { key: 'light', label: 'Claro', icon: Sun },
    { key: 'dark', label: 'Oscuro', icon: Moon },
    { key: 'system', label: 'Sistema', icon: Monitor },
  ]

  return (
    <Card className="glass-liquid">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Apariencia
        </CardTitle>
        <CardDescription>Personaliza el aspecto visual del sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Tema</Label>
          <div className="flex gap-2">
            {themeOptions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  theme === key
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Color de acento</Label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map(({ name, value }) => (
              <button
                key={value}
                onClick={() => handleAccentChange(value)}
                className="relative h-8 w-8 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: value }}
                title={name}
              >
                {accentColor === value && (
                  <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
            <div className="relative">
              <input
                type="color"
                value={customColor || accentColor}
                onChange={(e) => {
                  setCustomColor(e.target.value)
                  handleAccentChange(e.target.value)
                }}
                className="h-8 w-8 rounded-full cursor-pointer border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full"
                title="Color personalizado"
              />
              {!ACCENT_COLORS.some((c) => c.value === accentColor) && (
                <Check className="h-4 w-4 text-white absolute inset-0 m-auto pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
