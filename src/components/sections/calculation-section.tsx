'use client'

import { MiniBarChart } from '@/components/charts/mini-bar-chart'
import { AnimatedYen } from '@/components/animations/animated-number'
import { calculateSettlement, filterCarryoverExpenses, filterClearedCarryovers } from '@/lib/utils/calculation'
import { calculateMonthBalance } from '@/lib/utils/monthly-summary'
import { formatCurrency } from '@/lib/utils/format'
import type { Income, Expense, Carryover, MonthlySummary } from '@/types'

interface CalculationSectionProps {
  incomes: Income[]
  expenses: Expense[]
  carryovers: Carryover[]
  currentMonth: string
  recentSummaries: MonthlySummary[]
}

function formatMonthDot(month: string): string {
  const year = month.slice(0, 4)
  const m = month.slice(4, 6)
  return `${year}.${m}`
}

function getDaysInMonth(month: string): number {
  const year = parseInt(month.slice(0, 4), 10)
  const m = parseInt(month.slice(4, 6), 10)
  return new Date(year, m, 0).getDate()
}

export function CalculationSection({
  incomes,
  expenses,
  carryovers,
  currentMonth,
  recentSummaries,
}: CalculationSectionProps) {
  const result = calculateSettlement(incomes, expenses, carryovers)

  const { expenseTotal: allExpenseTotal, balance: monthlyBalance } =
    calculateMonthBalance(incomes, expenses)

  const carryoverExpenses = filterCarryoverExpenses(expenses)
  const clearedCarryovers = filterClearedCarryovers(carryovers)
  const carryoverExpenseTotal = carryoverExpenses.reduce((sum, e) => sum + e.amount, 0)
  const clearedCarryoverTotal = clearedCarryovers.reduce((sum, c) => sum + c.amount, 0)
  const hasAdjustments = carryoverExpenses.length > 0 || clearedCarryovers.length > 0

  const totalItems = incomes.length + expenses.length
  const days = getDaysInMonth(currentMonth)
  const m = parseInt(currentMonth.slice(4, 6), 10)


  return (
    <div data-section="calculation" className="space-y-4">
      {/* ヒーロー: 月表示 + 収支 + チャート */}
      <section className="rounded-[22px] gradient-hero-card shadow-soft-lg p-5 md:p-6">
        <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-accent">
          Balance / 月の収支
        </div>
        <div className="text-[30px] md:text-[44px] font-bold tracking-[-0.03em] leading-[0.95] font-tabular mt-2">
          {formatMonthDot(currentMonth)}
        </div>
        <div className="text-xs text-sub-text mt-1.5">
          {m}月度 — {days}日間 / {totalItems}件の取引
        </div>

        <div className="mt-5 md:mt-6">
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-sub-text">
            月の収支
          </div>
          <div className="mt-1.5 flex items-baseline">
            <AnimatedYen
              value={monthlyBalance}
              className={`text-[44px] md:text-[64px] font-bold tracking-[-0.04em] leading-[0.9] font-tabular ${
                monthlyBalance >= 0
                  ? 'text-neon-green'
                  : 'text-neon-red'
              }`}
            />
          </div>
          <div className="text-xs text-sub-text mt-2.5 leading-relaxed">
            収入 {formatCurrency(result.totalIncome)} − 支出 {formatCurrency(Math.abs(allExpenseTotal))}
          </div>
        </div>

        {recentSummaries.length > 0 && (
          <div className="mt-5">
            <MiniBarChart summaries={recentSummaries} currentMonth={currentMonth} />
          </div>
        )}
      </section>

      {/* 第2階層: お小遣い + 精算 */}
      <section className="flex flex-col gap-3">
        <div className="rounded-[18px] bg-card shadow-soft p-4">
          <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-sub-text">
            Allowance / お小遣い（1人あたり）
          </div>
          <AnimatedYen
            value={result.allowance}
            className="text-[26px] md:text-[36px] font-bold tracking-[-0.03em] leading-[0.95] font-tabular mt-2"
          />
          <div className="text-[11px] text-sub-text mt-2 leading-relaxed">
            {hasAdjustments
              ? `収支 ${formatCurrency(monthlyBalance)} ＋ 調整 ${formatCurrency(carryoverExpenseTotal + clearedCarryoverTotal)} の余剰を等分`
              : '余剰を2人で等分'}
          </div>
        </div>

        <div className="rounded-[18px] bg-card shadow-soft p-4">
          <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-sub-text">
            Settlement / 精算額
          </div>
          {result.settlement !== 0 ? (
            <div className="flex items-center justify-between mt-2">
              <AnimatedYen
                value={result.settlement}
                absolute
                className="text-[22px] md:text-[28px] font-bold tracking-[-0.02em] leading-[0.95] font-tabular text-accent"
              />
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-husband-light text-[11px] font-bold text-husband">
                  夫
                </span>
                <span className="text-sub-text text-xs">→</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-wife-light text-[11px] font-bold text-wife">
                  妻
                </span>
              </div>
            </div>
          ) : (
            <span className="text-[22px] md:text-[28px] font-bold text-muted-foreground mt-2 block">
              精算なし
            </span>
          )}
        </div>
      </section>
    </div>
  )
}
