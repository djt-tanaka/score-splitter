import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateSettlement } from '@/lib/utils/calculation'
import { formatCurrency } from '@/lib/utils/format'
import type { Income, Expense } from '@/types'

interface CalculationSectionProps {
  incomes: Income[]
  expenses: Expense[]
}

export function CalculationSection({
  incomes,
  expenses,
}: CalculationSectionProps) {
  const result = calculateSettlement(incomes, expenses)

  // バランスバーの比率計算
  const totalContribution = Math.abs(result.husbandTotal) + Math.abs(result.wifeTotal)
  const husbandRatio = totalContribution > 0
    ? (Math.abs(result.husbandTotal) / totalContribution) * 100
    : 50
  const wifeRatio = totalContribution > 0
    ? (Math.abs(result.wifeTotal) / totalContribution) * 100
    : 50

  return (
    <div className="space-y-4">
      {/* 精算額ヒーローカード */}
      <Card className="relative overflow-hidden border-accent/20 glow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-neon-cyan/5" />
        <CardContent className="relative pt-8 pb-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
              精算額
            </p>
            <div className="space-y-2">
              {result.settlement > 0 ? (
                <>
                  <p className="text-5xl md:text-6xl font-bold text-neon-cyan font-mono font-tabular leading-none">
                    {formatCurrency(result.settlement)}
                  </p>
                  <p className="text-base text-muted-foreground font-medium">
                    夫 → 妻
                  </p>
                </>
              ) : result.settlement < 0 ? (
                <>
                  <p className="text-5xl md:text-6xl font-bold text-neon-cyan font-mono font-tabular leading-none">
                    {formatCurrency(Math.abs(result.settlement))}
                  </p>
                  <p className="text-base text-muted-foreground font-medium">
                    妻 → 夫
                  </p>
                </>
              ) : (
                <p className="text-3xl md:text-4xl font-bold text-muted-foreground">
                  精算なし
                </p>
              )}
            </div>
          </div>

          {/* バランスバー */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-husband">夫</span>
              <span className="text-wife">妻</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-husband rounded-l-full transition-all duration-500 ease-out"
                style={{ width: `${husbandRatio}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-wife rounded-r-full transition-all duration-500 ease-out"
                style={{ width: `${wifeRatio}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono font-tabular">
              <span>{formatCurrency(result.husbandTotal)}</span>
              <span>{formatCurrency(result.wifeTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 収支詳細カード */}
      <Card className="glow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">収支詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">収入合計</span>
              <span className="font-medium text-neon-green font-mono font-tabular">
                {formatCurrency(result.totalIncome)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">支出合計</span>
              <span className="font-medium text-neon-red font-mono font-tabular">
                {formatCurrency(result.totalExpense)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">夫の支出</span>
              <span className="font-medium font-mono font-tabular">
                {formatCurrency(result.husbandExpense)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">妻の支出</span>
              <span className="font-medium font-mono font-tabular">
                {formatCurrency(result.wifeExpense)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">夫の合計</span>
              <span className="font-semibold text-husband font-mono font-tabular">
                {formatCurrency(result.husbandTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">妻の合計</span>
              <span className="font-semibold text-wife font-mono font-tabular">
                {formatCurrency(result.wifeTotal)}
              </span>
            </div>
            <div className="col-span-2 pt-3 border-t">
              <div className="flex justify-between">
                <span className="text-muted-foreground">お小遣い（1人あたり）</span>
                <span className="font-semibold font-mono font-tabular">
                  {formatCurrency(result.allowance)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
