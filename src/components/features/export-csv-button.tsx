'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateMonthlyCsv, downloadCsv } from '@/lib/utils/csv'
import { formatMonth } from '@/lib/utils/format'
import type { Income, Expense, Carryover } from '@/types'

interface ExportCsvButtonProps {
  currentMonth: string
  incomes: Income[]
  expenses: Expense[]
  carryovers: Carryover[]
}

export function ExportCsvButton({
  currentMonth,
  incomes,
  expenses,
  carryovers,
}: ExportCsvButtonProps) {
  function handleExport() {
    const csv = generateMonthlyCsv(currentMonth, incomes, expenses, carryovers)
    const filename = `家計データ_${formatMonth(currentMonth)}.csv`
    downloadCsv(csv, filename)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-1 h-4 w-4" />
      CSV出力
    </Button>
  )
}
