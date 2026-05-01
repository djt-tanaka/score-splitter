'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/features/theme-toggle'
import { labelSlide, motionDuration, motionEase } from '@/components/animations/tokens'
import { formatMonth, parseMonth } from '@/lib/utils/format'
import { logout } from '@/app/actions/auth'

interface HeaderProps {
  currentMonth?: string
}

function useMonthDirection(currentMonth: string | undefined) {
  const [state, setState] = useState({ prev: currentMonth ?? '', direction: 0 })
  if (currentMonth && state.prev !== currentMonth) {
    setState({
      prev: currentMonth,
      direction: currentMonth > state.prev ? 1 : -1,
    })
  }
  return state.direction
}

const monthLabelVariants = {
  enter: (d: number) => ({ x: d * labelSlide, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d * -labelSlide, opacity: 0 }),
}

export function Header({ currentMonth }: HeaderProps) {
  const router = useRouter()
  const direction = useMonthDirection(currentMonth)

  function navigateMonth(offset: number) {
    if (!currentMonth) return
    const year = parseInt(currentMonth.slice(0, 4), 10)
    const month = parseInt(currentMonth.slice(4, 6), 10)
    const date = new Date(year, month - 1 + offset, 1)
    router.push(`/?month=${parseMonth(date)}`)
  }

  function goToCurrentMonth() {
    router.push(`/?month=${parseMonth(new Date())}`)
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 py-3.5 flex items-center justify-between max-w-4xl">
        <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-sub-text">
          Splitter
        </span>

        {currentMonth && (
          <nav className="flex items-center gap-2" aria-label="月ナビゲーション">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="前月に移動"
              onClick={() => navigateMonth(-1)}
              className="h-7 w-7 rounded-full bg-muted text-accent"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <button
              type="button"
              onClick={goToCurrentMonth}
              aria-label="今月に移動"
              aria-live="polite"
              className="text-sm font-semibold min-w-[100px] text-center hover:text-accent transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md overflow-hidden font-tabular"
            >
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.span
                  key={currentMonth}
                  custom={direction}
                  variants={monthLabelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: motionDuration.fast, ease: motionEase.out }}
                  className="inline-block"
                >
                  {formatMonth(currentMonth)}
                </motion.span>
              </AnimatePresence>
            </button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="翌月に移動"
              onClick={() => navigateMonth(1)}
              className="h-7 w-7 rounded-full bg-muted text-accent"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </nav>
        )}

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
