import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}))

vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => null,
}))

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => null,
}))

vi.mock('@/components/providers/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/app/globals.css', () => ({}))

import RootLayout from '@/app/layout'

describe('スキップリンク', () => {
  it('href="#main" のスキップリンクが存在する', () => {
    const { container } = render(
      <RootLayout>
        <main id="main">コンテンツ</main>
      </RootLayout>
    )

    const skipLink = container.querySelector('a[href="#main"]')
    expect(skipLink).toBeTruthy()
    expect(skipLink?.textContent).toBe('メインコンテンツへ')
  })
})
