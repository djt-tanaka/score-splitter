'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CopyMonthDialog } from '@/components/features/copy-month-dialog'
import { ExportCsvButton } from '@/components/features/export-csv-button'
import { getPreviousMonth } from '@/lib/utils/format'
import type { Income, Expense, Carryover } from '@/types'

interface MonthToolbarProps {
  currentMonth: string
  incomes: Income[]
  expenses: Expense[]
  carryovers: Carryover[]
}

export function MonthToolbar({ currentMonth, incomes, expenses, carryovers }: MonthToolbarProps) {
  const previousMonth = getPreviousMonth(currentMonth)

  return (
    <div className="flex items-center justify-between py-1">
      <Link
        href="/"
        aria-label="月の一覧へ戻る"
        className="inline-flex items-center gap-1 text-sub-text text-xs hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        <span>一覧へ</span>
      </Link>
      <div className="flex gap-1.5">
        <CopyMonthDialog
          currentMonth={currentMonth}
          previousMonth={previousMonth}
        />
        <ExportCsvButton
          currentMonth={currentMonth}
          incomes={incomes}
          expenses={expenses}
          carryovers={carryovers}
        />
      </div>
    </div>
  )
}
