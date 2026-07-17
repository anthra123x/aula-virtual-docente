'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  BarChart3,
  Settings,
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Materias', href: '/courses', icon: BookOpen },
  { label: 'Estudiantes', href: '/students', icon: GraduationCap },
  { label: 'Clases', href: '/classes', icon: CalendarDays },
  { label: 'Observaciones', href: '/observations', icon: FileText },
  { label: 'Períodos', href: '/periods', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card h-screen flex flex-col shadow-clay-inset">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>AulaDocente</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all',
                isActive
                  ? 'bg-primary/10 text-primary font-medium shadow-clay-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-clay-sm',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
