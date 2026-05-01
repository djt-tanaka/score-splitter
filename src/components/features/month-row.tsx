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
      <div className="rounded-[16px] shadow-soft p-3 grid grid-cols-[40px_1fr_auto] items-center gap-3 opacity-55">
        <div className="w-10 h-10 rounded-[12px] bg-muted flex items-center justify-center text-[13px] font-bold font-tabular text-sub-text">
          {String(index).padStart(2, '0')}
        </div>
        <div>
          <span className="text-sm font-semibold">{index}月</span>
          <div className="text-[11px] text-sub-text mt-0.5">未記録</div>
        </div>
        <span className="text-sm text-muted-foreground font-tabular">—</span>
      </div>
    )
  }

  const isPositive = summary.balance >= 0
  const sign = isPositive ? '+' : '−'
  const tone = isPositive ? 'pos' : 'neg'

  return (
    <Link
      href={`/?month=${month}`}
      aria-label={`${formatMonth(month)}の詳細を開く`}
      className={`rounded-[16px] p-3 grid grid-cols-[40px_1fr_auto] items-center gap-3 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
        isCurrentMonth
          ? 'shadow-card-hover ring-1.5 ring-accent'
          : 'shadow-soft hover:shadow-card-hover'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-[12px] flex items-center justify-center text-[13px] font-bold font-tabular ${
          tone === 'pos'
            ? 'bg-[oklch(0.94_0.08_155)] text-[oklch(0.42_0.16_155)]'
            : 'bg-[oklch(0.94_0.07_25)] text-[oklch(0.50_0.18_25)]'
        }`}
      >
        {String(index).padStart(2, '0')}
      </div>
      <div>
        <span className="text-sm font-semibold">
          {index}月
          {isCurrentMonth && (
            <span className="ml-1.5 text-[9px] px-2 py-0.5 rounded-full bg-accent text-white font-bold tracking-[0.04em]">
              NOW
            </span>
          )}
        </span>
        <div className="text-[11px] text-sub-text mt-0.5">
          収入 {formatCurrency(summary.incomeTotal)} · 支出 {formatCurrency(Math.abs(summary.expenseTotal))}
        </div>
        <SparkBars summary={summary} maxIncome={maxIncome} maxExpense={maxExpense} />
      </div>
      <div className="text-right">
        <div
          className={`text-sm font-bold font-tabular ${
            isPositive ? 'text-neon-green' : 'text-neon-red'
          }`}
        >
          {sign}{formatCurrency(Math.abs(summary.balance)).replace('¥', '¥')}
        </div>
        <div className="text-[10px] text-sub-text mt-1">View ›</div>
      </div>
    </Link>
  )
}
