'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyMonthDialog } from '@/components/features/copy-month-dialog'
import { ExportCsvButton } from '@/components/features/export-csv-button'
import { labelSlide, motionDuration, motionEase } from '@/components/animations/tokens'
import { formatMonth, parseMonth, getPreviousMonth } from '@/lib/utils/format'
import type { Income, Expense, Carryover } from '@/types'

interface MonthSelectorProps {
  currentMonth: string
  incomes?: Income[]
  expenses?: Expense[]
  carryovers?: Carryover[]
}

function useMonthDirection(currentMonth: string) {
  const [state, setState] = useState({ prev: currentMonth, direction: 0 })
  if (state.prev !== currentMonth) {
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

export function MonthSelector({ currentMonth, incomes, expenses, carryovers }: MonthSelectorProps) {
  const router = useRouter()
  const direction = useMonthDirection(currentMonth)

  function navigateMonth(offset: number) {
    const year = parseInt(currentMonth.slice(0, 4), 10)
    const month = parseInt(currentMonth.slice(4, 6), 10)
    const date = new Date(year, month - 1 + offset, 1)
    router.push(`/?month=${parseMonth(date)}`)
  }

  function goToCurrentMonth() {
    router.push(`/?month=${parseMonth(new Date())}`)
  }

  const previousMonth = getPreviousMonth(currentMonth)

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="前月に移動" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <button
          type="button"
          onClick={goToCurrentMonth}
          aria-label="今月に移動"
          aria-live="polite"
          className="text-2xl font-bold min-w-[140px] text-center hover:text-accent transition-[color,transform] duration-200 motion-safe:hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md overflow-hidden"
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
        <Button variant="outline" size="icon" aria-label="翌月に移動" onClick={() => navigateMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <CopyMonthDialog
          currentMonth={currentMonth}
          previousMonth={previousMonth}
        />
        {incomes && expenses && carryovers && (
          <ExportCsvButton
            currentMonth={currentMonth}
            incomes={incomes}
            expenses={expenses}
            carryovers={carryovers}
          />
        )}
      </div>
    </div>
  )
}
