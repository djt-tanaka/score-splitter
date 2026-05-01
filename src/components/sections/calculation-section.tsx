'use client'

import { MiniBarChart } from '@/components/charts/mini-bar-chart'
import { AnimatedYen } from '@/components/animations/animated-number'
import { PersonBadge } from '@/components/ui/person-badge'
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
    <div data-section="calculation">
      {/* ヒーロー: 月表示 + 収支 + チャート */}
      <section className="py-8 md:py-10 md:px-6 border-b border-border">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-sub-text">
              Balance / 月の収支
            </div>
            <div className="text-[36px] md:text-[56px] font-bold tracking-[-0.04em] leading-[0.95] font-tabular mt-2">
              {formatMonthDot(currentMonth)}
            </div>
            <div className="text-xs md:text-sm text-sub-text mt-1.5">
              {m}月度 — {days}日間 / {totalItems}件の取引
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8 grid gap-8 md:gap-14 md:grid-cols-[1.5fr_1fr] items-end">
          <div>
            <div className="text-[12px] font-semibold tracking-[0.18em] uppercase text-sub-text">
              月の収支
            </div>
            <div className="mt-2 flex items-baseline">
              <AnimatedYen
                value={monthlyBalance}
                className={`text-[48px] md:text-[88px] font-bold tracking-[-0.04em] leading-[0.9] font-tabular ${
                  monthlyBalance >= 0
                    ? 'text-neon-green'
                    : 'text-neon-red'
                }`}
              />
            </div>
            <div className="text-xs md:text-sm text-sub-text mt-3 leading-relaxed">
              収入 {formatCurrency(result.totalIncome)} − 支出 {formatCurrency(Math.abs(allExpenseTotal))}
            </div>
          </div>

          {recentSummaries.length > 0 && (
            <MiniBarChart summaries={recentSummaries} currentMonth={currentMonth} />
          )}
        </div>
      </section>

      {/* 第2階層: お小遣い + 精算 */}
      <section className="grid md:grid-cols-[1.4fr_1fr] border-b border-border">
        <div className="py-5 md:py-7 md:px-6 flex flex-col gap-1.5 border-b md:border-b-0 border-border">
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.22em] uppercase text-sub-text">
            Allowance / お小遣い（1人あたり）
          </div>
          <AnimatedYen
            value={result.allowance}
            className="text-[28px] md:text-[44px] font-bold tracking-[-0.03em] leading-[0.95] font-tabular"
          />
          <div className="text-[11px] md:text-[13px] text-sub-text mt-1">
            {hasAdjustments
              ? `収支 ${formatCurrency(monthlyBalance)} ＋ 調整 ${formatCurrency(carryoverExpenseTotal + clearedCarryoverTotal)} の余剰を等分`
              : '余剰を2人で等分'}
          </div>
        </div>

        <div className="py-5 md:py-7 md:px-6 flex flex-col gap-1.5 md:border-l border-border md:bg-muted/30">
          <div className="text-[10px] md:text-[11px] font-bold tracking-[0.22em] uppercase text-sub-text">
            Settlement / 精算額
          </div>
          {result.settlement !== 0 ? (
            <>
              <AnimatedYen
                value={result.settlement}
                absolute
                className="text-[22px] md:text-[28px] font-bold tracking-[-0.02em] leading-[0.95] font-tabular text-neon-cyan"
              />
              <div className="flex items-center gap-2.5 mt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] md:text-[13px] font-semibold text-husband">
                  <span className="w-2 h-2 rounded-full bg-husband" />
                  夫
                </span>
                <span className="text-sub-text text-sm">──→</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] md:text-[13px] font-semibold text-wife">
                  <span className="w-2 h-2 rounded-full bg-wife" />
                  妻
                </span>
              </div>
            </>
          ) : (
            <span className="text-[22px] md:text-[28px] font-bold text-muted-foreground">
              精算なし
            </span>
          )}
        </div>
      </section>
    </div>
  )
}
