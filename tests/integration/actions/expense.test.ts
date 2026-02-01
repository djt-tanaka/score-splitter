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
          amount: -50000, // DBでは負の値
          person: 'wife',
          created_at: '202601T00:00:00Z',
        },
        {
          id: '2',
          month: '202601',
          label: '家賃',
          amount: -100000,
          person: 'husband',
          created_at: '2026-01-02T00:00:00Z',
        },
      ]
      mockSelectSuccess(mockData)

      const result = await getExpensesByMonth('202601')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('expenses')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: '1',
        month: '202601',
        label: '食費',
        amount: -50000, // 負の値のまま返される
        person: 'wife',
        createdAt: '202601T00:00:00Z',
      })
    })

    it('データがない場合は空配列を返す', async () => {
      mockSelectSuccess([])

      const result = await getExpensesByMonth('202601')

      expect(result).toEqual([])
    })

    it('エラー時は空配列を返す', async () => {
      mockSelectError('Database error')

      const result = await getExpensesByMonth('202601')

      expect(result).toEqual([])
    })
  })

  describe('createExpense', () => {
    it('有効なデータで支出を作成する（金額は負の値に変換）', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト支出',
        amount: 50000, // 入力は正の値
        person: 'husband',
      })

      const mockRow = {
        id: 'new-id',
        month: '202601',
        label: 'テスト支出',
        amount: -50000, // DBには負の値で保存
        person: 'husband',
        created_at: '202601T00:00:00Z',
      }
      mockSingleSuccess(mockRow)

      const result = await createExpense(formData)

      expect(result.success).toBe(true)
      expect(result.data?.amount).toBe(-50000)
      // insertに渡される値が負であることを確認
      expect(mockSupabaseClient._queryBuilder.insert).toHaveBeenCalledWith({
        month: '202601',
        label: 'テスト支出',
        amount: -50000, // 負の値で保存
        person: 'husband',
      })
    })

    it('作成後にrevalidatePathが呼ばれる', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 10000,
        person: 'husband',
      })
      mockSingleSuccess({
        id: '1',
        month: '202601',
        label: 'テスト',
        amount: -10000,
        person: 'husband',
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
      })
      const mockRow = {
        id: 'existing-id',
        month: '202601',
        label: '更新後の支出',
        amount: -80000, // DBには負の値
        person: 'wife',
        created_at: '202601T00:00:00Z',
      }
      mockSingleSuccess(mockRow)

      const result = await updateExpense('existing-id', formData)

      expect(result.success).toBe(true)
      expect(result.data?.amount).toBe(-80000)
      expect(mockSupabaseClient._queryBuilder.update).toHaveBeenCalledWith({
        label: '更新後の支出',
        amount: -80000, // 負の値で更新
        person: 'wife',
      })
    })

    it('更新後にrevalidatePathが呼ばれる', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 10000,
        person: 'husband',
      })
      mockSingleSuccess({
        id: '1',
        month: '202601',
        label: 'テスト',
        amount: -10000,
        person: 'husband',
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
      })
      mockSingleError('Record not found')

      const result = await updateExpense('non-existent-id', formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('支出の更新に失敗しました')
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
