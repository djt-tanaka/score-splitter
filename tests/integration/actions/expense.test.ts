import { describe, it, expect, beforeEach, vi } from 'vitest'
import '../../../tests/mocks/next'
import {
  mockSupabaseClient,
  mockSelectSuccess,
  mockSelectError,
  mockSingleSuccess,
  mockSingleError,
  mockDeleteSuccess,
  mockDeleteError,
  clearSupabaseMocks,
} from '../../../tests/mocks/supabase'
import { mockRevalidatePath } from '../../../tests/mocks/next'
import { createFormData, toSupabaseRow } from '../../../tests/mocks/helpers'
import {
  getExpensesByMonth,
  createExpense,
  updateExpense,
  deleteExpense,
  toggleExpenseCarryover,
} from '@/app/actions/expense'

describe('expense actions', () => {
  beforeEach(() => {
    clearSupabaseMocks()
    mockRevalidatePath.mockClear()
    vi.clearAllMocks()
  })

  describe('getExpensesByMonth', () => {
    it('指定月の支出を取得する', async () => {
      const mockData = [
        {
          id: '1',
          month: '202601',
          label: '食費',
          amount: -50000,
          person: 'wife',
          is_carryover: false,
          created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          month: '202601',
          label: '家賃',
          amount: -100000,
          person: 'husband',
          is_carryover: false,
          created_at: '2026-01-02T00:00:00Z',
        },
      ]
      mockSelectSuccess(mockData)

      const result = await getExpensesByMonth('202601')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('expenses')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data?.[0]).toEqual({
        id: '1',
        month: '202601',
        label: '食費',
        amount: -50000,
        person: 'wife',
        isCarryover: false,
        createdAt: '2026-01-01T00:00:00Z',
      })
    })

    it('is_carryoverがtrueの場合isCarryoverにマッピングされる', async () => {
      const mockData = [
        {
          id: '1',
          month: '202601',
          label: '前月未払い',
          amount: -30000,
          person: 'husband',
          is_carryover: true,
          created_at: '2026-01-01T00:00:00Z',
        },
      ]
      mockSelectSuccess(mockData)

      const result = await getExpensesByMonth('202601')

      expect(result.success).toBe(true)
      expect(result.data?.[0]?.isCarryover).toBe(true)
    })

    it('データがない場合は空配列を返す', async () => {
      mockSelectSuccess([])

      const result = await getExpensesByMonth('202601')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('エラー時はエラーを返す', async () => {
      mockSelectError('Database error')

      const result = await getExpensesByMonth('202601')

      expect(result.success).toBe(false)
      expect(result.error).toBe('支出データの取得に失敗しました')
    })
  })

  describe('createExpense', () => {
    it('有効なデータで支出を作成する（金額は負の値に変換）', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト支出',
        amount: 50000, // 入力は正の値
        person: 'husband',
        is_carryover: 'false',
      })

      const mockRow = {
        id: 'new-id',
        month: '202601',
        label: 'テスト支出',
        amount: -50000, // DBには負の値で保存
        person: 'husband',
        is_carryover: false,
        created_at: '2026-01-01T00:00:00Z',
      }
      mockSingleSuccess(mockRow)

      const result = await createExpense(formData)

      expect(result.success).toBe(true)
      expect(result.data?.amount).toBe(-50000)
      expect(result.data?.isCarryover).toBe(false)
      expect(mockSupabaseClient._queryBuilder.insert).toHaveBeenCalledWith({
        month: '202601',
        label: 'テスト支出',
        amount: -50000, // 負の値で保存
        person: 'husband',
        is_carryover: false,
      })
    })

    it('is_carryover=trueで支出を作成する', async () => {
      const formData = createFormData({
        month: '202601',
        label: '前月未払い',
        amount: 30000,
        person: 'wife',
        is_carryover: 'true',
      })

      const mockRow = {
        id: 'new-id',
        month: '202601',
        label: '前月未払い',
        amount: -30000,
        person: 'wife',
        is_carryover: true,
        created_at: '2026-01-01T00:00:00Z',
      }
      mockSingleSuccess(mockRow)

      const result = await createExpense(formData)

      expect(result.success).toBe(true)
      expect(result.data?.isCarryover).toBe(true)
      expect(mockSupabaseClient._queryBuilder.insert).toHaveBeenCalledWith({
        month: '202601',
        label: '前月未払い',
        amount: -30000,
        person: 'wife',
        is_carryover: true,
      })
    })

    it('作成後にrevalidatePathが呼ばれる', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 10000,
        person: 'husband',
        is_carryover: 'false',
      })
      mockSingleSuccess({
        id: '1',
        month: '202601',
        label: 'テスト',
        amount: -10000,
        person: 'husband',
        is_carryover: false,
        created_at: new Date().toISOString(),
      })

      await createExpense(formData)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('バリデーションエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: '202601',
        label: '',
        amount: 50000,
        person: 'husband',
        is_carryover: 'false',
      })

      const result = await createExpense(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('項目名を入力してください')
    })

    it('金額が不正な場合エラーを返す', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: -100, // 入力時に負の値は不正
        person: 'husband',
        is_carryover: 'false',
      })

      const result = await createExpense(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('金額は正の整数を入力してください')
    })

    it('DBエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 50000,
        person: 'husband',
        is_carryover: 'false',
      })
      mockSingleError('Database error')

      const result = await createExpense(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('支出の作成に失敗しました')
    })
  })

  describe('updateExpense', () => {
    it('支出を更新する（金額は負の値に変換）', async () => {
      const formData = createFormData({
        month: '202601',
        label: '更新後の支出',
        amount: 80000, // 入力は正の値
        person: 'wife',
        is_carryover: 'false',
      })
      const mockRow = {
        id: 'existing-id',
        month: '202601',
        label: '更新後の支出',
        amount: -80000, // DBには負の値
        person: 'wife',
        is_carryover: false,
        created_at: '2026-01-01T00:00:00Z',
      }
      mockSingleSuccess(mockRow)

      const result = await updateExpense('existing-id', formData)

      expect(result.success).toBe(true)
      expect(result.data?.amount).toBe(-80000)
      expect(result.data?.isCarryover).toBe(false)
      expect(mockSupabaseClient._queryBuilder.update).toHaveBeenCalledWith({
        label: '更新後の支出',
        amount: -80000, // 負の値で更新
        person: 'wife',
        is_carryover: false,
      })
    })

    it('更新後にrevalidatePathが呼ばれる', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 10000,
        person: 'husband',
        is_carryover: 'false',
      })
      mockSingleSuccess({
        id: '1',
        month: '202601',
        label: 'テスト',
        amount: -10000,
        person: 'husband',
        is_carryover: false,
        created_at: new Date().toISOString(),
      })

      await updateExpense('1', formData)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('バリデーションエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: 'invalid-date',
        label: 'テスト',
        amount: 50000,
        person: 'husband',
        is_carryover: 'false',
      })

      const result = await updateExpense('1', formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('月形式が不正です')
    })

    it('DBエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 50000,
        person: 'husband',
        is_carryover: 'false',
      })
      mockSingleError('Record not found')

      const result = await updateExpense('non-existent-id', formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('支出の更新に失敗しました')
    })
  })

  describe('toggleExpenseCarryover', () => {
    it('繰越フラグをtrueに更新する', async () => {
      // toggleExpenseCarryover uses .update().eq() without .select().single()
      // So eq resolves with the final result (like delete pattern)
      mockSupabaseClient._queryBuilder.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await toggleExpenseCarryover('expense-1', true)

      expect(result.success).toBe(true)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('expenses')
      expect(mockSupabaseClient._queryBuilder.update).toHaveBeenCalledWith({
        is_carryover: true,
      })
      expect(mockSupabaseClient._queryBuilder.eq).toHaveBeenCalledWith(
        'id',
        'expense-1'
      )
    })

    it('繰越フラグをfalseに更新する', async () => {
      mockSupabaseClient._queryBuilder.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const result = await toggleExpenseCarryover('expense-1', false)

      expect(result.success).toBe(true)
      expect(mockSupabaseClient._queryBuilder.update).toHaveBeenCalledWith({
        is_carryover: false,
      })
    })

    it('更新後にrevalidatePathが呼ばれる', async () => {
      mockSupabaseClient._queryBuilder.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      await toggleExpenseCarryover('expense-1', true)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('DBエラー時はエラーを返す', async () => {
      mockSupabaseClient._queryBuilder.eq.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      })

      const result = await toggleExpenseCarryover('expense-1', true)

      expect(result.success).toBe(false)
      expect(result.error).toBe('繰越フラグの更新に失敗しました')
    })
  })

  describe('deleteExpense', () => {
    it('支出を削除する', async () => {
      mockDeleteSuccess()

      const result = await deleteExpense('existing-id')

      expect(result.success).toBe(true)
      expect(mockSupabaseClient._queryBuilder.delete).toHaveBeenCalled()
      expect(mockSupabaseClient._queryBuilder.eq).toHaveBeenCalledWith(
        'id',
        'existing-id'
      )
    })

    it('削除後にrevalidatePathが呼ばれる', async () => {
      mockDeleteSuccess()

      await deleteExpense('1')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('DBエラー時はエラーを返す', async () => {
      mockDeleteError('Delete failed')

      const result = await deleteExpense('1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('支出の削除に失敗しました')
    })
  })
})
