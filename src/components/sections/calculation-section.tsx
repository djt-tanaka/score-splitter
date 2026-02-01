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

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle>計算結果</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* 収支合計 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">収入合計</span>
              <span className="font-medium text-green-600">
                {formatCurrency(result.totalIncome)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">支出合計</span>
              <span className="font-medium text-red-600">
                {formatCurrency(result.totalExpense)}
              </span>
            </div>
          </div>

          {/* 担当者別支出 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">夫の支出</span>
              <span className="font-medium">
                {formatCurrency(result.husbandExpense)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">妻の支出</span>
              <span className="font-medium">
                {formatCurrency(result.wifeExpense)}
              </span>
            </div>
          </div>

          {/* 担当者別合計 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">夫の合計</span>
              <span className="font-medium">
                {formatCurrency(result.husbandTotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">妻の合計</span>
              <span className="font-medium">
                {formatCurrency(result.wifeTotal)}
              </span>
            </div>
          </div>

          {/* お小遣い */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">お小遣い（1人あたり）</span>
              <span className="font-medium text-blue-600">
                {formatCurrency(result.allowance)}
              </span>
            </div>
          </div>
        </div>

        {/* 精算額 */}
        <div className="mt-6 pt-4 border-t border-blue-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">精算額</p>
            <p className="text-2xl font-bold">
              {result.settlement > 0 ? (
                <span className="text-orange-600">
                  夫 → 妻: {formatCurrency(result.settlement)}
                </span>
              ) : result.settlement < 0 ? (
                <span className="text-purple-600">
                  妻 → 夫: {formatCurrency(Math.abs(result.settlement))}
                </span>
              ) : (
                <span className="text-gray-600">精算なし</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
