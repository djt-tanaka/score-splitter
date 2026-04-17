'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyMonthDialog } from '@/components/features/copy-month-dialog'
import { ExportCsvButton } from '@/components/features/export-csv-button'
import { formatMonth, parseMonth, getPreviousMonth } from '@/lib/utils/format'
import type { Income, Expense, Carryover } from '@/types'

interface MonthSelectorProps {
  currentMonth: string
  incomes?: Income[]
  expenses?: Expense[]
  carryovers?: Carryover[]
}

export function MonthSelector({ currentMonth, incomes, expenses, carryovers }: MonthSelectorProps) {
  const router = useRouter()

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
          onClick={goToCurrentMonth}
          aria-label="今月に移動"
          className="text-2xl font-bold min-w-[140px] text-center hover:text-accent transition-[color,transform] duration-200 motion-safe:hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md"
        >
          {formatMonth(currentMonth)}
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
