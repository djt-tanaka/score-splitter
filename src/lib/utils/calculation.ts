import type { Income, Expense, CalculationResult } from '@/types'

/**
 * 収入と支出から精算額を計算する
 *
 * 計算ロジック:
 * 1. 収入合計 = SUM(全収入)
 * 2. 支出合計 = SUM(全支出)（負の値）
 * 3. お小遣い = (収入合計 + 支出合計) / 2
 * 4. 精算額 = 夫の合計 - お小遣い
 *    - 正の値: 夫が妻に支払う
 *    - 負の値: 妻が夫に支払う
 */
export function calculateSettlement(
  incomes: Income[],
  expenses: Expense[]
): CalculationResult {
  // 収入合計
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

  // 支出合計（負の値）
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // 担当者別収入
  const husbandIncome = incomes
    .filter((i) => i.person === 'husband')
    .reduce((sum, i) => sum + i.amount, 0)

  const wifeIncome = incomes
    .filter((i) => i.person === 'wife')
    .reduce((sum, i) => sum + i.amount, 0)

  // 担当者別支出（負の値）
  const husbandExpense = expenses
    .filter((e) => e.person === 'husband')
    .reduce((sum, e) => sum + e.amount, 0)

  const wifeExpense = expenses
    .filter((e) => e.person === 'wife')
    .reduce((sum, e) => sum + e.amount, 0)

  // 担当者別合計
  const husbandTotal = husbandIncome + husbandExpense
  const wifeTotal = wifeIncome + wifeExpense

  // お小遣い = (収入合計 + 支出合計) / 2
  const allowance = (totalIncome + totalExpense) / 2

  // 精算額 = 夫の合計 - お小遣い
  const settlement = husbandTotal - allowance

  return {
    totalIncome,
    totalExpense,
    husbandIncome,
    wifeIncome,
    husbandExpense,
    wifeExpense,
    husbandTotal,
    wifeTotal,
    allowance,
    settlement,
  }
}
