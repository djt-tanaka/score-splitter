import { describe, it, expect } from 'vitest'
import { generateMonthlyCsv } from '@/lib/utils/csv'
import type { Income, Expense, Carryover } from '@/types'

describe('generateMonthlyCsv', () => {
  const incomes: Income[] = [
    { id: '1', month: '202604', label: '夫手取り', amount: 500000, person: 'husband' },
    { id: '2', month: '202604', label: '妻手取り', amount: 200000, person: 'wife' },
  ]

  const expenses: Expense[] = [
    { id: '1', month: '202604', label: '家賃', amount: -150000, person: 'husband' },
    { id: '2', month: '202604', label: '食費', amount: -80000, person: 'wife' },
  ]

  const carryovers: Carryover[] = [
    { id: '1', month: '202604', label: '前月繰越', amount: -5000, person: 'husband' },
  ]

  it('BOMプレフィックスが付与される', () => {
    const csv = generateMonthlyCsv('202604', incomes, expenses, carryovers)
    expect(csv.charCodeAt(0)).toBe(0xfeff)
  })

  it('ヘッダーに月が日本語形式で含まれる', () => {
    const csv = generateMonthlyCsv('202604', incomes, expenses, carryovers)
    expect(csv).toContain('家計データ,2026年4月')
  })

  it('サマリーセクションに正しい計算結果が含まれる', () => {
    const csv = generateMonthlyCsv('202604', incomes, expenses, carryovers)
    expect(csv).toContain('収入合計,700000')
    expect(csv).toContain('支出合計,230000')
    expect(csv).toContain('夫の収入,500000')
    expect(csv).toContain('妻の収入,200000')
    expect(csv).toContain('夫の支出,150000')
    expect(csv).toContain('妻の支出,80000')
  })

  it('精算方向が正しく表示される', () => {
    const csv = generateMonthlyCsv('202604', incomes, expenses, carryovers)
    // settlement = husbandTotal - allowance = (500000 - 150000) - (700000 - 230000) / 2 = 350000 - 235000 = 115000
    expect(csv).toContain('精算額,115000')
    expect(csv).toContain('精算方向,夫 → 妻')
  })

  it('支出・繰越の金額が正の値で出力される', () => {
    const csv = generateMonthlyCsv('202604', incomes, expenses, carryovers)
    const lines = csv.split('\n')

    // 支出セクションの家賃行
    const rentLine = lines.find((l) => l.includes('家賃'))
    expect(rentLine).toBe('夫,家賃,150000')

    // 繰越セクションの繰越行
    const carryoverLine = lines.find((l) => l.includes('前月繰越'))
    expect(carryoverLine).toBe('夫,前月繰越,5000')
  })

  it('担当者が日本語で表示される', () => {
    const csv = generateMonthlyCsv('202604', incomes, expenses, carryovers)
    const lines = csv.split('\n')
    const incomeLine = lines.find((l) => l.includes('夫手取り'))
    expect(incomeLine).toBe('夫,夫手取り,500000')
  })

  it('カンマを含むラベルがCSVエスケープされる', () => {
    const incomesWithComma: Income[] = [
      { id: '1', month: '202604', label: '手取り,賞与込み', amount: 500000, person: 'husband' },
    ]
    const csv = generateMonthlyCsv('202604', incomesWithComma, [], [])
    expect(csv).toContain('夫,"手取り,賞与込み",500000')
  })

  it('ダブルクォートを含むラベルがエスケープされる', () => {
    const incomesWithQuote: Income[] = [
      { id: '1', month: '202604', label: '手取り"特別"', amount: 500000, person: 'husband' },
    ]
    const csv = generateMonthlyCsv('202604', incomesWithQuote, [], [])
    expect(csv).toContain('夫,"手取り""特別""",500000')
  })

  it('空データでも有効なCSVが生成される', () => {
    const csv = generateMonthlyCsv('202604', [], [], [])
    expect(csv).toContain('家計データ,2026年4月')
    expect(csv).toContain('収入合計,0')
    expect(csv).toContain('支出合計,0')
    expect(csv).toContain('精算額,0')
  })

  it('妻→夫の精算方向が正しく表示される', () => {
    const wifeHigherIncomes: Income[] = [
      { id: '1', month: '202604', label: '夫手取り', amount: 100000, person: 'husband' },
      { id: '2', month: '202604', label: '妻手取り', amount: 500000, person: 'wife' },
    ]
    const csv = generateMonthlyCsv('202604', wifeHigherIncomes, [], [])
    expect(csv).toContain('精算方向,妻 → 夫')
  })
})
