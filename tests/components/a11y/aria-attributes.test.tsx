import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CarryoverSection } from '@/components/sections/carryover-section'
import type { Carryover } from '@/types'

vi.mock('@/app/actions/carryover', () => ({
  createCarryover: vi.fn(),
  updateCarryover: vi.fn(),
  deleteCarryover: vi.fn(),
  toggleCarryoverCleared: vi.fn(),
}))

const mockCarryovers: Carryover[] = [
  {
    id: '1',
    month: '202601',
    label: '前月繰越',
    amount: -30000,
    person: 'husband',
    isCleared: false,
  },
]

describe('CarryoverSection a11y', () => {
  it('折りたたみトリガーが button 要素である', () => {
    render(<CarryoverSection carryovers={mockCarryovers} month="202601" />)

    const trigger = screen.getByTestId('carryover-title')
    expect(trigger.tagName).toBe('BUTTON')
  })

  it('折りたたみトリガーに aria-expanded 属性がある', () => {
    render(<CarryoverSection carryovers={mockCarryovers} month="202601" />)

    const trigger = screen.getByTestId('carryover-title')
    expect(trigger).toHaveAttribute('aria-expanded')
  })

  it('Enter キーで折りたたみを開閉できる', async () => {
    const user = userEvent.setup()
    render(<CarryoverSection carryovers={mockCarryovers} month="202601" />)

    const trigger = screen.getByTestId('carryover-title')

    expect(screen.queryByText('前月繰越')).not.toBeInTheDocument()

    trigger.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByText('前月繰越')).toBeInTheDocument()
  })

  it('Space キーで折りたたみを開閉できる', async () => {
    const user = userEvent.setup()
    render(<CarryoverSection carryovers={mockCarryovers} month="202601" />)

    const trigger = screen.getByTestId('carryover-title')

    trigger.focus()
    await user.keyboard(' ')

    expect(screen.getByText('前月繰越')).toBeInTheDocument()
  })
})
