'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MonthRow } from '@/components/features/month-row'
import { YearlyBarChart } from '@/components/charts/yearly-bar-chart'
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

  const availableYears = [...new Set(summaries.map((s) => Number(s.month.slice(0, 4))))].sort()

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

  const maxBalance = Math.max(
    ...yearSummaries.map((s) => Math.abs(s.balance)),
    1
  )

  const isBalancePositive = balanceYTD >= 0

  return (
    <section aria-label="月の一覧">
      {/* セクションヘッド */}
      <div className="pb-4">
        <div className="text-[11px] font-medium tracking-[0.5px] text-[#999999] uppercase">
          Months / 月一覧
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="text-4xl font-bold leading-none">
            {selectedYear}
          </div>
          {/* pill型セレクター */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-sm font-medium bg-transparent appearance-none cursor-pointer"
            aria-label="年を選択"
            style={{ backgroundImage: 'none' }}
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-sm text-[#999999]">▾</span>
        </div>
        <p className="text-[13px] text-[#999999] mt-2">
          {recordedCount > 0
            ? `${recordedCount}ヶ月分の記録があります`
            : 'この年の記録はまだありません'}
        </p>
      </div>

      {/* Year-to-Date カード */}
      {recordedCount > 0 && (
        <div className="rounded-[16px] shadow-soft p-5">
          <div className="text-[10px] font-medium tracking-[0.5px] text-[#999999] uppercase">
            Year-to-Date / 年間収支
          </div>
          <div className="mt-1">
            <span
              className={`font-mono text-[28px] font-bold ${
                isBalancePositive ? 'text-[#2563EB]' : 'text-[#E2483D]'
              }`}
            >
              {isBalancePositive ? '+' : ''}
              {balanceYTD.toLocaleString('ja-JP')}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-[11px] font-medium text-[#666666]">
              Income {formatCurrency(incomeYTD)}
            </span>
            <span className="font-mono text-[11px] font-medium text-[#666666]">
              Expense {formatCurrency(expenseYTD)}
            </span>
          </div>

          {/* 年間バーチャート */}
          <div className="mt-4">
            <YearlyBarChart summaries={yearSummaries} year={selectedYear} />
          </div>
        </div>
      )}

      {/* 注記 */}
      <p className="text-xs text-muted-foreground py-3">
        ※各月の収支は繰越に回す前の金額です
      </p>

      {/* BY MONTH ヘッダー */}
      <div className="flex items-baseline justify-between py-2">
        <span className="text-[11px] font-medium tracking-[0.5px] text-[#999999] uppercase">
          By Month / 月別
        </span>
        <span className="text-[11px] text-[#999999]">
          12ヶ月
        </span>
      </div>

      {/* 月リスト */}
      <div className="flex flex-col">
        {allMonths.map((m) => (
          <MonthRow
            key={m.month}
            month={m.month}
            index={m.index}
            summary={m.summary}
            isCurrentMonth={m.month === currentMonth}
            maxBalance={maxBalance}
          />
        ))}
      </div>
    </section>
  )
}
