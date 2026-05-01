'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="sm" asChild className="text-sub-text hover:text-foreground -ml-2">
        <Link href="/" aria-label="月の一覧へ戻る">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="text-xs">一覧へ</span>
        </Link>
      </Button>
      <div className="flex gap-1">
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
