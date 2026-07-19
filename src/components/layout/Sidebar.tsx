'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  BarChart3,
  CalendarDays,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useSidebar } from './SidebarProvider'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Materias', href: '/courses', icon: BookOpen },
  { label: 'Grupos', href: '/groups', icon: Users },
  { label: 'Estudiantes', href: '/students', icon: GraduationCap },
  { label: 'Clases', href: '/classes', icon: CalendarDays },
  { label: 'Observaciones', href: '/observations', icon: FileText },
  { label: 'Períodos', href: '/periods', icon: CalendarDays },
  { label: 'Configuración', href: '/settings', icon: Settings },
]

function NavLinks() {
  const pathname = usePathname()
  const { setOpen } = useSidebar()

  return (
    <nav className="flex-1 px-3 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all',
              isActive
                ? 'bg-primary/10 text-primary font-medium shadow-clay-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-clay-sm',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarLogo() {
  return (
    <div className="px-6 py-5">
      <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
        <BookOpen className="h-6 w-6 text-primary shrink-0" />
        <span>AulaDocente</span>
      </Link>
    </div>
  )
}

export function Sidebar() {
  const { open, setOpen } = useSidebar()

  return (
    <>
      <aside className="hidden md:flex w-64 h-screen flex-col shrink-0
        bg-card/80 backdrop-blur-lg border-r border-border/60">
        <SidebarLogo />
        <NavLinks />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col glass-liquid">
          <div className="flex items-center justify-between pr-2">
            <SidebarLogo />
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <NavLinks />
        </SheetContent>
      </Sheet>
    </>
  )
}
