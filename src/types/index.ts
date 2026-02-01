// 担当者
export type Person = 'husband' | 'wife'

// 収入
export interface Income {
  id: string
  month: string // YYYY-MM-DD形式（月初日）
  label: string
  amount: number // 正の値
  person: Person
  createdAt?: string
}

// 支出
export interface Expense {
  id: string
  month: string
  label: string
  amount: number // 負の値
  person: Person
  createdAt?: string
}

// 繰越（記録用、計算には含めない）
export interface Carryover {
  id: string
  month: string
  label: string
  amount: number // 負の値
  person: Person
  createdAt?: string
}

// 計算結果
export interface CalculationResult {
  totalIncome: number // 収入合計
  totalExpense: number // 支出合計（負の値）
  husbandIncome: number // 夫の収入
  wifeIncome: number // 妻の収入
  husbandExpense: number // 夫の支出（負の値）
  wifeExpense: number // 妻の支出（負の値）
  husbandTotal: number // 夫の収支合計
  wifeTotal: number // 妻の収支合計
  allowance: number // お小遣い（1人あたり）
  settlement: number // 精算額（正: 夫→妻、負: 妻→夫）
}
