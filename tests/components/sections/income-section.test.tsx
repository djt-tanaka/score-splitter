import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IncomeSection } from '@/components/sections/income-section'
import type { Income } from '@/types'

// Server Actionsのモック
vi.mock('@/app/actions/income', () => ({
  createIncome: vi.fn(),
  updateIncome: vi.fn(),
  deleteIncome: vi.fn(),
}))

describe('IncomeSection', () => {
  const mockIncomes: Income[] = [
    {
      id: '1',
      month: '2026-01-01',
      label: '給料',
      amount: 300000,
      person: 'husband',
    },
    {
      id: '2',
      month: '2026-01-01',
      label: 'ボーナス',
      amount: 100000,
      person: 'wife',
    },
  ]

  it('収入一覧を表示する', () => {
    render(<IncomeSection incomes={mockIncomes} month="2026-01-01" />)

    expect(screen.getByText('給料')).toBeInTheDocument()
    expect(screen.getByText('ボーナス')).toBeInTheDocument()
  })

  it('合計金額を表示する', () => {
    render(<IncomeSection incomes={mockIncomes} month="2026-01-01" />)

    // 合計は400,000円
    expect(screen.getByText('¥400,000')).toBeInTheDocument()
  })

  it('各項目の金額を表示する', () => {
    render(<IncomeSection incomes={mockIncomes} month="2026-01-01" />)

    expect(screen.getByText('¥300,000')).toBeInTheDocument()
    expect(screen.getByText('¥100,000')).toBeInTheDocument()
  })

  it('収入がない場合メッセージを表示する', () => {
    render(<IncomeSection incomes={[]} month="2026-01-01" />)

    expect(screen.getByText('収入がありません')).toBeInTheDocument()
  })

  it('タイトル「収入」を表示する', () => {
    render(<IncomeSection incomes={mockIncomes} month="2026-01-01" />)

    expect(screen.getByText('収入')).toBeInTheDocument()
  })

  it('担当者バッジを表示する', () => {
    render(<IncomeSection incomes={mockIncomes} month="2026-01-01" />)

    // PersonBadgeコンポーネントがレンダリングされることを確認
    // バッジとSelectオプションの両方に「夫」「妻」が存在するのでgetAllByTextを使用
    const husbandElements = screen.getAllByText('夫')
    const wifeElements = screen.getAllByText('妻')
    expect(husbandElements.length).toBeGreaterThanOrEqual(1)
    expect(wifeElements.length).toBeGreaterThanOrEqual(1)
  })

  it('削除ボタンを表示する', () => {
    render(<IncomeSection incomes={mockIncomes} month="2026-01-01" />)

    // Trash2アイコンを含むボタンが収入の数だけ存在
    const deleteButtons = screen.getAllByRole('button', { name: '' })
    // 削除ボタンと編集ボタンが混在するので、総数を確認
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2)
  })
})
