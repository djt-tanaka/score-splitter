'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/actions/auth'

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">家計計算アプリ</h1>
        <form action={logout}>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent">
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </Button>
        </form>
      </div>
    </header>
  )
}
