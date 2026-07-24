'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, CalendarRange, FileText, RefreshCw, Server } from 'lucide-react'
import Link from 'next/link'

const QUICK_LINKS = [
  { href: '/courses', label: 'Materias', icon: BookOpen, desc: 'Gestiona tus materias y cursos' },
  { href: '/groups', label: 'Grupos', icon: Users, desc: 'Administra los grupos de cada materia' },
  { href: '/periods', label: 'Períodos', icon: CalendarRange, desc: 'Configura los bimestres académicos' },
  { href: '/observations', label: 'Observaciones', icon: FileText, desc: 'Registro académico y de comportamiento' },
]

export function SystemSection() {
  return (
    <Card className="glass-liquid">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          Accesos rápidos
        </CardTitle>
        <CardDescription>Navegación directa a los módulos del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-accent/50 transition-colors"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
