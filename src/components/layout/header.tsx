'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/features/theme-toggle'
import { logout } from '@/app/actions/auth'

export function Header() {
  return (
    <header className="bg-background">
      <div className="px-5 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <span className="text-[12px] font-bold tracking-[1px] uppercase text-foreground">
          Score Splitter
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <form action={logout}>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-accent" aria-label="ログアウト">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
