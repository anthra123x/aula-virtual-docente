'use client'

import { LogOut, User, Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { logout } from '@/modules/auth/auth.actions'
import { useSidebar } from './SidebarProvider'

type UserData = {
  id: string
  email: string
  name: string
  avatar: string | null
}

export function Header({ user }: { user: UserData }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { setOpen } = useSidebar()

  useEffect(() => setMounted(true), [])

  return (
    <header className="h-14 border-b glass flex items-center justify-between px-3 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-2 cursor-pointer px-1">
              <Avatar className="h-7 w-7 md:h-8 md:w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" />
              {user.email}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
