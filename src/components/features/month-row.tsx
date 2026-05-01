import Link from 'next/link'
import { formatCurrency, formatMonth } from '@/lib/utils/format'
import type { MonthlySummary } from '@/types'

interface MonthRowProps {
  month: string
  index: number
  summary: MonthlySummary | null
  isCurrentMonth: boolean
  maxIncome: number
  maxExpense: number
}

function SparkBars({
  summary,
  maxIncome,
  maxExpense,
}: {
  summary: MonthlySummary
  maxIncome: number
  maxExpense: number
}) {
  const incomeH = Math.round((summary.incomeTotal / maxIncome) * 100)
  const expenseH = Math.round((Math.abs(summary.expenseTotal) / maxExpense) * 100)

  return (
    <div className="flex items-end gap-0.5 h-[22px] mt-1.5">
      <div
        className="w-1 rounded-sm bg-neon-green"
        style={{ height: `${Math.max(incomeH, 8)}%` }}
      />
      <div
        className="w-1 rounded-sm bg-neon-red"
        style={{ height: `${Math.max(expenseH, 8)}%` }}
      />
    </div>
  )
}

export function MonthRow({
  month,
  index,
  summary,
  isCurrentMonth,
  maxIncome,
  maxExpense,
}: MonthRowProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-[64px_1fr_auto] items-center gap-3.5 px-5 py-4 border-b border-border/60 opacity-40">
        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-sub-text font-tabular">
          {String(index).padStart(2, '0')}
        </span>
        <div>
          <span className="text-[18px] font-bold tracking-[-0.02em] font-tabular">
            {index}月
          </span>
          <div className="text-[11px] text-sub-text tracking-[0.06em] mt-0.5">未記録</div>
        </div>
        <span className="text-[18px] font-bold text-muted-foreground text-right font-tabular">
          —
        </span>
      </div>
    )
  }

  const isPositive = summary.balance >= 0
  const sign = isPositive ? '+' : '−'

  return (
    <Link
      href={`/?month=${month}`}
      aria-label={`${formatMonth(month)}の詳細を開く`}
      className={`grid grid-cols-[64px_1fr_auto] items-center gap-3.5 px-5 py-4 border-b border-border/60 transition-colors hover:bg-muted/30 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
        isCurrentMonth ? 'bg-muted/30' : ''
      }`}
    >
      <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-sub-text font-tabular">
        {String(index).padStart(2, '0')}
      </span>
      <div>
        <span className="text-[18px] font-bold tracking-[-0.02em] font-tabular">
          {index}月
        </span>
        <div className="text-[11px] text-sub-text mt-0.5">
          収入 {formatCurrency(summary.incomeTotal)} · 支出 {formatCurrency(Math.abs(summary.expenseTotal))}
        </div>
        <SparkBars summary={summary} maxIncome={maxIncome} maxExpense={maxExpense} />
      </div>
      <div className="text-right">
        <div
          className={`text-[18px] font-bold tracking-[-0.02em] font-tabular ${
            isPositive ? 'text-neon-green' : 'text-neon-red'
          }`}
        >
          {sign}{formatCurrency(Math.abs(summary.balance)).replace('¥', '¥')}
        </div>
        <div className="text-[10px] text-sub-text mt-1 font-tabular tracking-[0.04em]">
          {isCurrentMonth ? 'CURRENT ›' : 'View ›'}
        </div>
      </div>
    </Link>
  )
}
