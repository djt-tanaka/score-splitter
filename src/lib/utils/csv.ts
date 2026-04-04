import type { Income, Expense, Carryover, Person } from '@/types'
import { calculateSettlement } from '@/lib/utils/calculation'
import { formatMonth } from '@/lib/utils/format'

const BOM = '\uFEFF'

function personLabel(person: Person): string {
  return person === 'husband' ? '夫' : '妻'
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function generateMonthlyCsv(
  month: string,
  incomes: Income[],
  expenses: Expense[],
  carryovers: Carryover[]
): string {
  const result = calculateSettlement(incomes, expenses)
  const lines: string[] = []

  // ヘッダー
  lines.push(`家計データ,${formatMonth(month)}`)
  lines.push('')

  // サマリーセクション
  lines.push('■ サマリー')
  lines.push('項目,金額')
  lines.push(`収入合計,${result.totalIncome}`)
  lines.push(`支出合計,${Math.abs(result.totalExpense)}`)
  lines.push(`夫の収入,${result.husbandIncome}`)
  lines.push(`妻の収入,${result.wifeIncome}`)
  lines.push(`夫の支出,${Math.abs(result.husbandExpense)}`)
  lines.push(`妻の支出,${Math.abs(result.wifeExpense)}`)
  lines.push(`お小遣い（1人あたり）,${result.allowance}`)
  lines.push(`精算額,${Math.abs(result.settlement)}`)
  lines.push(`精算方向,${result.settlement >= 0 ? '夫 → 妻' : '妻 → 夫'}`)
  lines.push('')

  // 収入セクション
  lines.push('■ 収入')
  lines.push('担当,項目名,金額')
  for (const income of incomes) {
    lines.push(`${personLabel(income.person)},${escapeCsvField(income.label)},${income.amount}`)
  }
  lines.push('')

  // 支出セクション
  lines.push('■ 支出')
  lines.push('担当,項目名,金額')
  for (const expense of expenses) {
    lines.push(`${personLabel(expense.person)},${escapeCsvField(expense.label)},${Math.abs(expense.amount)}`)
  }
  lines.push('')

  // 繰越セクション
  lines.push('■ 繰越')
  lines.push('担当,項目名,金額')
  for (const carryover of carryovers) {
    lines.push(`${personLabel(carryover.person)},${escapeCsvField(carryover.label)},${Math.abs(carryover.amount)}`)
  }

  return BOM + lines.join('\n')
}

export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
