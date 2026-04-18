import { describe, it, expect, beforeEach, vi } from 'vitest'
import '../../../tests/mocks/next'
import {
  mockSupabaseClient,
  mockSelectNoOrderSuccess,
  mockSelectNoOrderError,
  clearSupabaseMocks,
} from '../../../tests/mocks/supabase'
import { getMonthlySummaries } from '@/app/actions/monthly-summary'

describe('monthly-summary actions', () => {
  beforeEach(() => {
    clearSupabaseMocks()
    vi.clearAllMocks()
  })

  describe('getMonthlySummaries', () => {
    it('incomes/expensesを並列取得し、月降順のサマリーを返す', async () => {
      // 1回目: incomes
      mockSelectNoOrderSuccess([
        { month: '202602', amount: 200000 },
        { month: '202604', amount: 300000 },
      ])
      // 2回目: expenses
      mockSelectNoOrderSuccess([
        { month: '202602', amount: -50000 },
        { month: '202604', amount: -100000 },
      ])

      const result = await getMonthlySummaries()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('incomes')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('expenses')
      expect(mockSupabaseClient._queryBuilder.select).toHaveBeenCalledWith(
        'month, amount'
      )
      expect(result.success).toBe(true)
      expect(result.data).toEqual([
        {
          month: '202604',
          incomeTotal: 300000,
          expenseTotal: -100000,
          balance: 200000,
        },
        {
          month: '202602',
          incomeTotal: 200000,
          expenseTotal: -50000,
          balance: 150000,
        },
      ])
    })

    it('データがない場合は空配列を返す', async () => {
      mockSelectNoOrderSuccess([])
      mockSelectNoOrderSuccess([])

      const result = await getMonthlySummaries()

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('繰越フラグ付きの支出も全額カードの収支に含まれる（is_carryover関係なし）', async () => {
      // incomesは空、expensesに繰越フラグ付き想定の負値を複数投入
      mockSelectNoOrderSuccess([{ month: '202604', amount: 500000 }])
      mockSelectNoOrderSuccess([
        { month: '202604', amount: -100000 }, // 通常支出
        { month: '202604', amount: -50000 }, // 繰越フラグ付きを想定
      ])

      const result = await getMonthlySummaries()

      expect(result.success).toBe(true)
      expect(result.data?.[0]).toEqual({
        month: '202604',
        incomeTotal: 500000,
        expenseTotal: -150000,
        balance: 350000,
      })
    })

    it('incomes取得エラー時はエラーを返す', async () => {
      mockSelectNoOrderError('Database error')
      mockSelectNoOrderSuccess([])

      const result = await getMonthlySummaries()

      expect(result.success).toBe(false)
      expect(result.error).toBe('月別サマリーの取得に失敗しました')
    })

    it('expenses取得エラー時はエラーを返す', async () => {
      mockSelectNoOrderSuccess([])
      mockSelectNoOrderError('Database error')

      const result = await getMonthlySummaries()

      expect(result.success).toBe(false)
      expect(result.error).toBe('月別サマリーの取得に失敗しました')
    })
  })
})
