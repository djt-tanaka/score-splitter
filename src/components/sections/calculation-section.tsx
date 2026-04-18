'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedYen } from '@/components/animations/animated-number'
import { barSpring } from '@/components/animations/tokens'
import { useMotionPrefs } from '@/components/animations/use-motion-prefs'
import { calculateSettlement, filterCarryoverExpenses, filterClearedCarryovers } from '@/lib/utils/calculation'
import type { Income, Expense, Carryover } from '@/types'

interface CalculationSectionProps {
  incomes: Income[]
  expenses: Expense[]
  carryovers: Carryover[]
}

export function CalculationSection({
  incomes,
  expenses,
  carryovers,
}: CalculationSectionProps) {
  const result = calculateSettlement(incomes, expenses, carryovers)

  const allExpenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0)
  const monthlyBalance = result.totalIncome + allExpenseTotal

  const carryoverExpenses = filterCarryoverExpenses(expenses)
  const clearedCarryovers = filterClearedCarryovers(carryovers)
  const carryoverExpenseTotal = carryoverExpenses.reduce((sum, e) => sum + e.amount, 0)
  const clearedCarryoverTotal = clearedCarryovers.reduce((sum, c) => sum + c.amount, 0)
  const adjustedBalance = monthlyBalance + carryoverExpenseTotal + clearedCarryoverTotal
  const hasAdjustments = carryoverExpenses.length > 0 || clearedCarryovers.length > 0

  const totalContribution = Math.abs(result.husbandTotal) + Math.abs(result.wifeTotal)
  const husbandRatio = totalContribution > 0
    ? (Math.abs(result.husbandTotal) / totalContribution) * 100
    : 50
  const wifeRatio = totalContribution > 0
    ? (Math.abs(result.wifeTotal) / totalContribution) * 100
    : 50

  const settlementSign = result.settlement > 0 ? 'plus' : result.settlement < 0 ? 'minus' : 'zero'
  const { reduced } = useMotionPrefs()
  const barTransition = reduced ? { duration: 0 } : barSpring

  return (
    <div className="space-y-4">
      {/* 精算額ヒーローカード */}
      <Card className="relative overflow-hidden border-accent/30 glow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-hero-from)] via-[var(--gradient-hero-via)] to-[var(--gradient-hero-to)]" />
        <CardContent className="relative pt-8 pb-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
              精算額
            </p>
            <div className="space-y-2">
              <AnimatePresence mode="wait" initial={false}>
                {result.settlement !== 0 ? (
                  <motion.div
                    key={`settlement-${settlementSign}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="space-y-2"
                  >
                    <AnimatedYen
                      value={result.settlement}
                      absolute
                      className="text-5xl md:text-6xl font-bold text-neon-cyan font-mono font-tabular leading-none inline-block"
                    />
                    <p className="text-base text-muted-foreground font-medium">
                      {result.settlement > 0 ? '夫 → 妻' : '妻 → 夫'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="settlement-zero"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="text-3xl md:text-4xl font-bold text-muted-foreground"
                  >
                    精算なし
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* バランスバー */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-husband">夫</span>
              <span className="text-wife">妻</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-husband rounded-l-full"
                initial={false}
                animate={{ width: `${husbandRatio}%` }}
                transition={barTransition}
              />
              <motion.div
                className="absolute right-0 top-0 h-full bg-wife rounded-r-full"
                initial={false}
                animate={{ width: `${wifeRatio}%` }}
                transition={barTransition}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono font-tabular">
              <AnimatedYen value={result.husbandTotal} />
              <AnimatedYen value={result.wifeTotal} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 月の実績カード */}
      <Card className="shadow-card card-interactive">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">月の実績</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">収入合計</span>
              <AnimatedYen
                value={result.totalIncome}
                className="font-medium text-neon-green font-mono font-tabular"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">支出合計</span>
              <AnimatedYen
                value={allExpenseTotal}
                className="font-medium text-neon-red font-mono font-tabular"
              />
            </div>
            <div className="col-span-2 pt-3 border-t">
              <div className="flex justify-between">
                <span className="text-muted-foreground">月の収支</span>
                <AnimatedYen
                  value={monthlyBalance}
                  className={`font-semibold font-mono font-tabular ${monthlyBalance >= 0 ? 'text-neon-green' : 'text-neon-red'}`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 調整カード（調整がある場合のみ表示） */}
      {hasAdjustments && (
        <Card className="shadow-card card-interactive">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">調整</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {carryoverExpenses.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">繰越に回した支出</span>
                  <AnimatedYen
                    value={carryoverExpenseTotal}
                    className="font-medium font-mono font-tabular"
                  />
                </div>
              )}
              {clearedCarryovers.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">清算した繰越</span>
                  <AnimatedYen
                    value={clearedCarryoverTotal}
                    className="font-medium font-mono font-tabular"
                  />
                </div>
              )}
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">調整後の収支</span>
                  <AnimatedYen
                    value={adjustedBalance}
                    className={`font-semibold font-mono font-tabular ${adjustedBalance >= 0 ? 'text-neon-green' : 'text-neon-red'}`}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 収支詳細カード */}
      <Card className="shadow-card card-interactive">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">収支詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">夫の支出</span>
              <AnimatedYen
                value={result.husbandExpense}
                className="font-medium font-mono font-tabular"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">妻の支出</span>
              <AnimatedYen
                value={result.wifeExpense}
                className="font-medium font-mono font-tabular"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">夫の合計</span>
              <AnimatedYen
                value={result.husbandTotal}
                className="font-semibold text-husband font-mono font-tabular"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">妻の合計</span>
              <AnimatedYen
                value={result.wifeTotal}
                className="font-semibold text-wife font-mono font-tabular"
              />
            </div>
            <div className="col-span-2 pt-3 border-t">
              <div className="flex justify-between">
                <span className="text-muted-foreground">お小遣い（1人あたり）</span>
                <AnimatedYen
                  value={result.allowance}
                  className="font-semibold font-mono font-tabular"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
