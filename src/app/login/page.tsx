'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, {})

  return (
    <main id="main" tabIndex={-1} className="min-h-screen flex items-center justify-center gradient-page">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>
      <Card className="w-full max-w-md relative glow-md animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-2">
            <span className="text-accent-foreground text-lg font-bold">家</span>
          </div>
          <CardTitle className="text-2xl">家計計算アプリ</CardTitle>
          <p className="text-sm text-muted-foreground">
            パスワードを入力してログイン
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Input
                type="password"
                name="password"
                placeholder="パスワード"
                required
                autoFocus
              />
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button
              type="submit"
              className="w-full h-12 glow-sm hover:glow-md transition-shadow"
              disabled={isPending}
            >
              {isPending ? 'ログイン中…' : 'ログイン'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
