import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExpenseSection } from '@/components/sections/expense-section'
import type { Expense } from '@/types'

// Server Actionsのモック
vi.mock('@/app/actions/expense', () => ({
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
}))

describe('ExpenseSection', () => {
  const mockExpenses: Expense[] = [
    {
      id: '1',
      month: '202601',
      label: '食費',
      amount: -50000, // 支出は負の値
      person: 'wife',
    },
    {
      id: '2',
      month: '202601',
      label: '家賃',
      amount: -100000,
      person: 'husband',
    },
  ]

  it('支出一覧を表示する', () => {
    render(<ExpenseSection expenses={mockExpenses} month="202601" />)

    expect(screen.getByText('食費')).toBeInTheDocument()
    expect(screen.getByText('家賃')).toBeInTheDocument()
  })

  it('合計金額を表示する（負の値）', () => {
    render(<ExpenseSection expenses={mockExpenses} month="202601" />)

    // 合計は-150,000円
    expect(screen.getByText('-¥150,000')).toBeInTheDocument()
  })

  it('各項目の金額を表示する', () => {
    render(<ExpenseSection expenses={mockExpenses} month="202601" />)

    expect(screen.getByText('-¥50,000')).toBeInTheDocument()
    expect(screen.getByText('-¥100,000')).toBeInTheDocument()
  })

  it('支出がない場合メッセージを表示する', () => {
    render(<ExpenseSection expenses={[]} month="202601" />)

    expect(screen.getByText('支出がありません')).toBeInTheDocument()
  })

  it('タイトル「支出」を表示する', () => {
    render(<ExpenseSection expenses={mockExpenses} month="202601" />)

    expect(screen.getByText('支出')).toBeInTheDocument()
  })

  it('担当者バッジを表示する', () => {
    render(<ExpenseSection expenses={mockExpenses} month="202601" />)

    // バッジとSelectオプションの両方に「夫」「妻」が存在するのでgetAllByTextを使用
    const husbandElements = screen.getAllByText('夫')
    const wifeElements = screen.getAllByText('妻')
    expect(husbandElements.length).toBeGreaterThanOrEqual(1)
    expect(wifeElements.length).toBeGreaterThanOrEqual(1)
  })
})
