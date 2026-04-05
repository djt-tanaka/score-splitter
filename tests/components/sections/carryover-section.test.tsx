import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CarryoverSection } from '@/components/sections/carryover-section'
import type { Carryover } from '@/types'

// Server Actionsのモック
vi.mock('@/app/actions/carryover', () => ({
  createCarryover: vi.fn(),
  updateCarryover: vi.fn(),
  deleteCarryover: vi.fn(),
  toggleCarryoverCleared: vi.fn(),
}))

describe('CarryoverSection', () => {
  const mockCarryovers: Carryover[] = [
    {
      id: '1',
      month: '202601',
      label: '前月繰越',
      amount: -30000, // 繰越は負の値
      person: 'husband',
      isCleared: false,
    },
    {
      id: '2',
      month: '202601',
      label: '貯金から',
      amount: -20000,
      person: 'wife',
      isCleared: false,
    },
  ]

  it('タイトル「繰越」を表示する', () => {
    render(<CarryoverSection carryovers={mockCarryovers} month="202601" />)

    expect(screen.getByText('繰越')).toBeInTheDocument()
  })

  it('注釈「※精算額には含まれません」を表示する', () => {
    render(<CarryoverSection carryovers={mockCarryovers} month="202601" />)

    expect(screen.getByText('※精算額には含まれません')).toBeInTheDocument()
  })

  it('合計金額を表示する', () => {
    render(<CarryoverSection carryovers={mockCarryovers} month="202601" />)

    // 合計は-50,000円
    expect(screen.getByText('-¥50,000')).toBeInTheDocument()
  })

  it('初期状態では折りたたまれている', () => {
    render(<CarryoverSection carryovers={mockCarryovers} month="202601" />)

    // 折りたたまれている状態では項目名が表示されない
    expect(screen.queryByText('前月繰越')).not.toBeInTheDocument()
  })

  it('クリックで展開できる', async () => {
    const user = userEvent.setup()
    render(<CarryoverSection carryovers={mockCarryovers} month="202601" />)

    // タイトルをクリックして展開
    await user.click(screen.getByText('繰越'))

    // 展開後は項目が表示される
    expect(screen.getByText('前月繰越')).toBeInTheDocument()
    expect(screen.getByText('貯金から')).toBeInTheDocument()
  })

  it('繰越がない場合メッセージを表示する（展開時）', async () => {
    const user = userEvent.setup()
    render(<CarryoverSection carryovers={[]} month="202601" />)

    // 展開
    await user.click(screen.getByText('繰越'))

    expect(screen.getByText('繰越がありません')).toBeInTheDocument()
  })

  it('担当者バッジを表示する（展開時）', async () => {
    const user = userEvent.setup()
    render(<CarryoverSection carryovers={mockCarryovers} month="202601" />)

    await user.click(screen.getByText('繰越'))

    // バッジとSelectオプションの両方に「夫」「妻」が存在するのでgetAllByTextを使用
    const husbandElements = screen.getAllByText('夫')
    const wifeElements = screen.getAllByText('妻')
    expect(husbandElements.length).toBeGreaterThanOrEqual(1)
    expect(wifeElements.length).toBeGreaterThanOrEqual(1)
  })

  it('清算済み繰越に「清算済」バッジを表示する', async () => {
    const user = userEvent.setup()
    const carryoversWithCleared: Carryover[] = [
      {
        id: '1',
        month: '202601',
        label: '前月繰越',
        amount: -30000,
        person: 'husband',
        isCleared: true,
      },
      {
        id: '2',
        month: '202601',
        label: '貯金から',
        amount: -20000,
        person: 'wife',
        isCleared: false,
      },
    ]

    render(<CarryoverSection carryovers={carryoversWithCleared} month="202601" />)

    // 展開
    await user.click(screen.getByText('繰越'))

    // 清算済バッジが表示される
    expect(screen.getByText('清算済')).toBeInTheDocument()
  })

  it('清算済み繰越は取り消し線スタイルで表示する', async () => {
    const user = userEvent.setup()
    const carryoversWithCleared: Carryover[] = [
      {
        id: '1',
        month: '202601',
        label: '前月繰越',
        amount: -30000,
        person: 'husband',
        isCleared: true,
      },
    ]

    render(<CarryoverSection carryovers={carryoversWithCleared} month="202601" />)

    // 展開
    await user.click(screen.getByText('繰越'))

    // ラベルに取り消し線クラスが適用される
    const labelElement = screen.getByText('前月繰越')
    expect(labelElement).toHaveClass('line-through')
  })

  it('清算済みがある場合、注釈が更新される', () => {
    const carryoversWithCleared: Carryover[] = [
      {
        id: '1',
        month: '202601',
        label: '前月繰越',
        amount: -30000,
        person: 'husband',
        isCleared: true,
      },
      {
        id: '2',
        month: '202601',
        label: '貯金から',
        amount: -20000,
        person: 'wife',
        isCleared: false,
      },
    ]

    render(<CarryoverSection carryovers={carryoversWithCleared} month="202601" />)

    // 清算済みがある場合の注釈
    expect(screen.getByText('※清算済み 1件 は精算に含まれます')).toBeInTheDocument()
    // 通常の注釈は表示されない
    expect(screen.queryByText('※精算額には含まれません')).not.toBeInTheDocument()
  })
})
