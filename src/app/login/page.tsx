'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import { ThemeToggle } from '@/components/features/theme-toggle'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, {})
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <span className="text-[11px] font-bold tracking-[0.18em] uppercase">
          Score Splitter
        </span>
        <ThemeToggle />
      </header>

      {/* メイン */}
      <main id="main" tabIndex={-1} className="flex-1 px-5 pt-14 pb-4 flex flex-col max-w-md mx-auto w-full">
        {/* ヒーロー */}
        <section className="pb-8 border-b border-border">
          <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-sub-text">
            Sign in / ログイン
          </div>
          <div className="mt-3.5 w-14 h-14 rounded-xl bg-foreground flex items-center justify-center">
            <span className="text-background text-2xl font-bold tracking-[-0.02em]">家</span>
          </div>
          <h1 className="text-[36px] font-bold tracking-[-0.04em] leading-[0.95] mt-4">
            家計計算アプリ
          </h1>
          <p className="text-[13px] text-sub-text mt-3 leading-relaxed">
            パスワードを入力してログインしてください。
            <br />
            セッションは7日間保持されます。
          </p>
        </section>

        {/* パスワードフォーム */}
        <form action={formAction} className="pt-8 flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="password"
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-sub-text"
            >
              パスワード
            </label>
            <span className="text-[10px] text-sub-text font-tabular tracking-[0.06em]">
              {showPassword ? 'visible' : 'hidden'}
            </span>
          </div>

          <div className="border-b-[1.5px] border-foreground flex items-center pb-2.5">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="パスワード"
              required
              autoFocus
              className="flex-1 text-[26px] font-medium tracking-[0.32em] bg-transparent border-none outline-none font-tabular placeholder:text-muted-foreground/40 placeholder:tracking-normal placeholder:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-[11px] font-bold tracking-[0.14em] uppercase text-sub-text hover:text-foreground transition-colors shrink-0"
            >
              {showPassword ? '隠す' : '表示'}
            </button>
          </div>

          {state.error && (
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
              <span className="text-[12px] font-semibold text-destructive">{state.error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-3.5 py-[18px] px-4 bg-foreground text-background rounded-xl text-[13px] font-bold tracking-[0.18em] uppercase flex items-center justify-between disabled:opacity-50 transition-opacity"
          >
            <span>{isPending ? 'ログイン中…' : 'ログイン'}</span>
            {!isPending && <span className="text-lg font-normal">→</span>}
          </button>
        </form>
      </main>

      {/* フッター */}
      <footer className="px-5 py-5 border-t border-border flex items-baseline justify-between">
        <p className="text-[11px] text-sub-text leading-relaxed">
          パスワードを忘れた場合は
          <br />
          管理者に問い合わせてください。
        </p>
        <span className="text-[10px] font-bold tracking-[0.16em] uppercase shrink-0">
          Help ›
        </span>
      </footer>
    </div>
  )
}
