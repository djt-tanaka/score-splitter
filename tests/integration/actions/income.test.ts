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
  getIncomesByMonth,
  createIncome,
  updateIncome,
  deleteIncome,
} from '@/app/actions/income'

describe('income actions', () => {
  beforeEach(() => {
    clearSupabaseMocks()
    mockRevalidatePath.mockClear()
    vi.clearAllMocks()
  })

  describe('getIncomesByMonth', () => {
    it('指定月の収入を取得する', async () => {
      const mockData = [
        {
          id: '1',
          month: '202601',
          label: '給料',
          amount: 300000,
          person: 'husband',
          created_at: '202601T00:00:00Z',
        },
        {
          id: '2',
          month: '202601',
          label: 'ボーナス',
          amount: 100000,
          person: 'wife',
          created_at: '2026-01-02T00:00:00Z',
        },
      ]
      mockSelectSuccess(mockData)

      const result = await getIncomesByMonth('202601')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('incomes')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: '1',
        month: '202601',
        label: '給料',
        amount: 300000,
        person: 'husband',
        createdAt: '202601T00:00:00Z',
      })
    })

    it('データがない場合は空配列を返す', async () => {
      mockSelectSuccess([])

      const result = await getIncomesByMonth('202601')

      expect(result).toEqual([])
    })

    it('エラー時は空配列を返す', async () => {
      mockSelectError('Database error')

      const result = await getIncomesByMonth('202601')

      expect(result).toEqual([])
    })
  })

  describe('createIncome', () => {
    it('有効なデータで収入を作成する', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト収入',
        amount: 100000,
        person: 'husband',
      })

      const mockRow = {
        id: 'new-id',
        month: '202601',
        label: 'テスト収入',
        amount: 100000,
        person: 'husband',
        created_at: '202601T00:00:00Z',
      }
      mockSingleSuccess(mockRow)

      const result = await createIncome(formData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        id: 'new-id',
        month: '202601',
        label: 'テスト収入',
        amount: 100000,
        person: 'husband',
        createdAt: '202601T00:00:00Z',
      })
      expect(mockSupabaseClient._queryBuilder.insert).toHaveBeenCalledWith({
        month: '202601',
        label: 'テスト収入',
        amount: 100000,
        person: 'husband',
      })
    })

    it('作成後にrevalidatePathが呼ばれる', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 100000,
        person: 'husband',
      })
      mockSingleSuccess(toSupabaseRow({ id: '1', month: '202601', label: 'テスト', amount: 100000, person: 'husband' }))

      await createIncome(formData)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('バリデーションエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: '202601',
        label: '', // 空の項目名
        amount: 100000,
        person: 'husband',
      })

      const result = await createIncome(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('項目名を入力してください')
    })

    it('金額が不正な場合エラーを返す', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 0, // 0は不正
        person: 'husband',
      })

      const result = await createIncome(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('金額は正の整数を入力してください')
    })

    it('DBエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 100000,
        person: 'husband',
      })
      mockSingleError('Database error')

      const result = await createIncome(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('収入の作成に失敗しました')
    })
  })

  describe('updateIncome', () => {
    it('収入を更新する', async () => {
      const formData = createFormData({
        month: '202601',
        label: '更新後の収入',
        amount: 200000,
        person: 'wife',
      })
      const mockRow = {
        id: 'existing-id',
        month: '202601',
        label: '更新後の収入',
        amount: 200000,
        person: 'wife',
        created_at: '202601T00:00:00Z',
      }
      mockSingleSuccess(mockRow)

      const result = await updateIncome('existing-id', formData)

      expect(result.success).toBe(true)
      expect(result.data?.label).toBe('更新後の収入')
      expect(result.data?.amount).toBe(200000)
      expect(mockSupabaseClient._queryBuilder.update).toHaveBeenCalledWith({
        label: '更新後の収入',
        amount: 200000,
        person: 'wife',
      })
    })

    it('更新後にrevalidatePathが呼ばれる', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 100000,
        person: 'husband',
      })
      mockSingleSuccess(toSupabaseRow({ id: '1', month: '202601', label: 'テスト', amount: 100000, person: 'husband' }))

      await updateIncome('1', formData)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('バリデーションエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: 'invalid-date',
        label: 'テスト',
        amount: 100000,
        person: 'husband',
      })

      const result = await updateIncome('1', formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('月形式が不正です')
    })

    it('DBエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: '202601',
        label: 'テスト',
        amount: 100000,
        person: 'husband',
      })
      mockSingleError('Record not found')

      const result = await updateIncome('non-existent-id', formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('収入の更新に失敗しました')
    })
  })

  describe('deleteIncome', () => {
    it('収入を削除する', async () => {
      mockDeleteSuccess()

      const result = await deleteIncome('existing-id')

      expect(result.success).toBe(true)
      expect(mockSupabaseClient._queryBuilder.delete).toHaveBeenCalled()
      expect(mockSupabaseClient._queryBuilder.eq).toHaveBeenCalledWith(
        'id',
        'existing-id'
      )
    })

    it('削除後にrevalidatePathが呼ばれる', async () => {
      mockDeleteSuccess()

      await deleteIncome('1')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('DBエラー時はエラーを返す', async () => {
      mockDeleteError('Delete failed')

      const result = await deleteIncome('1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('収入の削除に失敗しました')
    })
  })
})
