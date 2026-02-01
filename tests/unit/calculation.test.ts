import { describe, it, expect } from 'vitest'
import { calculateSettlement } from '@/lib/utils/calculation'
import type { Income, Expense } from '@/types'

describe('calculateSettlement', () => {
  // 仕様書のサンプルデータ
  const sampleIncomes: Income[] = [
    { id: '1', month: '2026-01-01', label: '夫手取り＋子育てT', amount: 984590, person: 'husband' },
    { id: '2', month: '2026-01-01', label: '妻手取り', amount: 52448, person: 'wife' },
  ]

  const sampleExpenses: Expense[] = [
    { id: '1', month: '2026-01-01', label: '家賃', amount: -146450, person: 'husband' },
    { id: '2', month: '2026-01-01', label: '駐車場', amount: -13400, person: 'husband' },
    { id: '3', month: '2026-01-01', label: '電気代', amount: -19470, person: 'husband' },
    { id: '4', month: '2026-01-01', label: '食費', amount: -63028, person: 'wife' },
    { id: '5', month: '2026-01-01', label: '備品費', amount: -101196, person: 'wife' },
    { id: '6', month: '2026-01-01', label: '出前＋外食', amount: -60556, person: 'wife' },
    { id: '7', month: '2026-01-01', label: 'タブレット＋Youtube', amount: -4460, person: 'husband' },
    { id: '8', month: '2026-01-01', label: '子供用品', amount: -55442, person: 'wife' },
    { id: '9', month: '2026-01-01', label: '保育園代＋備品', amount: -5500, person: 'husband' },
    { id: '10', month: '2026-01-01', label: 'ガソリン＋高速', amount: -16600, person: 'husband' },
    { id: '11', month: '2026-01-01', label: 'スイミング', amount: -10505, person: 'wife' },
    { id: '12', month: '2026-01-01', label: '婦人科', amount: -10450, person: 'wife' },
    { id: '13', month: '2026-01-01', label: '社会保険＋年金', amount: -43000, person: 'husband' },
    { id: '14', month: '2026-01-01', label: '小規模企業共済', amount: -70000, person: 'husband' },
    { id: '15', month: '2026-01-01', label: '水道代', amount: -9838, person: 'husband' },
    { id: '16', month: '2026-01-01', label: 'ネット代', amount: -4807, person: 'husband' },
    { id: '17', month: '2026-01-01', label: 'ガス代', amount: -9076, person: 'husband' },
    { id: '18', month: '2026-01-01', label: '庸介所得税(2023)', amount: -190000, person: 'husband' },
  ]

  it('収入合計を正しく計算する', () => {
    const result = calculateSettlement(sampleIncomes, sampleExpenses)
    expect(result.totalIncome).toBe(1037038) // 984590 + 52448
  })

  it('支出合計を正しく計算する', () => {
    const result = calculateSettlement(sampleIncomes, sampleExpenses)
    expect(result.totalExpense).toBe(-833778)
  })

  it('担当者別の収入を正しく計算する', () => {
    const result = calculateSettlement(sampleIncomes, sampleExpenses)
    expect(result.husbandIncome).toBe(984590)
    expect(result.wifeIncome).toBe(52448)
  })

  it('担当者別の支出を正しく計算する', () => {
    const result = calculateSettlement(sampleIncomes, sampleExpenses)
    expect(result.husbandExpense).toBe(-532601)
    expect(result.wifeExpense).toBe(-301177)
  })

  it('担当者別の合計を正しく計算する', () => {
    const result = calculateSettlement(sampleIncomes, sampleExpenses)
    expect(result.husbandTotal).toBe(451989) // 984590 + (-532601)
    expect(result.wifeTotal).toBe(-248729) // 52448 + (-301177)
  })

  it('お小遣いを正しく計算する', () => {
    const result = calculateSettlement(sampleIncomes, sampleExpenses)
    expect(result.allowance).toBe(101630) // (1037038 + (-833778)) / 2
  })

  it('精算額を正しく計算する（夫→妻）', () => {
    const result = calculateSettlement(sampleIncomes, sampleExpenses)
    expect(result.settlement).toBe(350359) // 451989 - 101630
  })

  it('空の配列を渡すと全て0を返す', () => {
    const result = calculateSettlement([], [])
    expect(result.totalIncome).toBe(0)
    expect(result.totalExpense).toBe(0)
    expect(result.allowance).toBe(0)
    expect(result.settlement).toBe(0)
  })

  it('収入のみの場合、支出は0で計算する', () => {
    const incomes: Income[] = [
      { id: '1', month: '2026-01-01', label: '給料', amount: 100000, person: 'husband' },
    ]
    const result = calculateSettlement(incomes, [])
    expect(result.totalIncome).toBe(100000)
    expect(result.totalExpense).toBe(0)
    expect(result.allowance).toBe(50000) // 100000 / 2
    expect(result.settlement).toBe(50000) // 100000 - 50000
  })

  it('妻の方が支出が多い場合、精算額が負になる', () => {
    const incomes: Income[] = [
      { id: '1', month: '2026-01-01', label: '給料', amount: 100000, person: 'wife' },
    ]
    const expenses: Expense[] = [
      { id: '1', month: '2026-01-01', label: '支出', amount: -80000, person: 'wife' },
    ]
    const result = calculateSettlement(incomes, expenses)
    expect(result.allowance).toBe(10000) // (100000 - 80000) / 2
    expect(result.wifeTotal).toBe(20000) // 100000 - 80000
    expect(result.husbandTotal).toBe(0)
    expect(result.settlement).toBe(-10000) // 0 - 10000 (妻→夫)
  })
})
