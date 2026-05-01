'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthRow } from '@/components/features/month-row'
import { formatCurrency, parseMonth } from '@/lib/utils/format'
import type { MonthlySummary } from '@/types'

interface MonthlyListSectionProps {
  summaries: MonthlySummary[]
}

export function MonthlyListSection({ summaries }: MonthlyListSectionProps) {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const currentMonth = parseMonth(new Date())

  if (summaries.length === 0) {
    const thisMonth = currentMonth
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">まだ記録がありません。</p>
        <Link
          href={`/?month=${thisMonth}`}
          className="text-accent underline-offset-4 hover:underline"
        >
          今月の画面を開く
        </Link>
      </div>
    )
  }

  const yearSummaries = summaries.filter((s) =>
    s.month.startsWith(String(selectedYear))
  )
  const recordedCount = yearSummaries.length
  const balanceYTD = yearSummaries.reduce((sum, s) => sum + s.balance, 0)
  const incomeYTD = yearSummaries.reduce((sum, s) => sum + s.incomeTotal, 0)
  const expenseYTD = yearSummaries.reduce(
    (sum, s) => sum + Math.abs(s.expenseTotal),
    0
  )

  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const m = `${selectedYear}${String(i + 1).padStart(2, '0')}`
    return {
      month: m,
      index: i + 1,
      summary: yearSummaries.find((s) => s.month === m) ?? null,
    }
  })

  const maxIncome = Math.max(...yearSummaries.map((s) => s.incomeTotal), 1)
  const maxExpense = Math.max(
    ...yearSummaries.map((s) => Math.abs(s.expenseTotal)),
    1
  )

  const isBalancePositive = balanceYTD >= 0

  return (
    <section aria-label="月の一覧">
      {/* タイトルバー */}
      <div className="pb-4">
        <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-sub-text">
          Months / 月一覧
        </div>
        <div className="text-[32px] font-bold tracking-[-0.03em] font-tabular mt-1.5 leading-none">
          {selectedYear}
        </div>
        <p className="text-xs text-sub-text mt-2">
          {recordedCount > 0
            ? `${recordedCount}ヶ月分の記録があります`
            : 'この年の記録はまだありません'}
        </p>
      </div>

      {/* 年ナビゲーション */}
      <div className="flex items-center justify-between pb-4">
        <button
          type="button"
          onClick={() => setSelectedYear((y) => y - 1)}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm text-accent transition-colors"
          aria-label="前年に移動"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div className="px-4 py-1.5 rounded-full bg-card shadow-soft text-sm font-semibold font-tabular">
          {selectedYear}
        </div>
        <button
          type="button"
          onClick={() => setSelectedYear((y) => y + 1)}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm text-accent transition-colors"
          aria-label="翌年に移動"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 年間サマリー */}
      {recordedCount > 0 && (
        <div className="rounded-[18px] shadow-soft p-4">
          <div className="text-[11px] text-sub-text font-medium">Year-to-date</div>
          <div className="flex items-baseline mt-1">
            <span
              className={`text-[26px] font-bold tracking-[-0.03em] font-tabular ${
                isBalancePositive ? 'text-accent' : 'text-neon-red'
              }`}
            >
              {isBalancePositive ? '+' : ''}
              {balanceYTD.toLocaleString('ja-JP')}
            </span>
            <span className="text-xs text-sub-text ml-1">円</span>
          </div>
          <div className="text-[11px] text-sub-text mt-1">
            {recordedCount}ヶ月分 · 収入 {formatCurrency(incomeYTD)} · 支出 {formatCurrency(expenseYTD)}
          </div>
        </div>
      )}

      {/* 注記 */}
      <p className="text-xs text-muted-foreground py-3">
        ※各月の収支は繰越に回す前の金額です
      </p>

      {/* 月一覧ヘッダー */}
      <div className="flex items-baseline justify-between py-2">
        <span className="text-[11px] font-bold tracking-[0.16em] uppercase">
          By month / 月別
        </span>
        <span className="text-[10px] text-sub-text font-tabular">
          12 / {recordedCount} 件
        </span>
      </div>

      {/* 月リスト */}
      <div className="flex flex-col gap-2">
        {allMonths.map((m) => (
          <MonthRow
            key={m.month}
            month={m.month}
            index={m.index}
            summary={m.summary}
            isCurrentMonth={m.month === currentMonth}
            maxIncome={maxIncome}
            maxExpense={maxExpense}
          />
        ))}
      </div>
    </section>
  )
}
