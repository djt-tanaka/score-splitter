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
import { createFormData } from '../../../tests/mocks/helpers'
import {
  getCarryoversByMonth,
  createCarryover,
  updateCarryover,
  deleteCarryover,
} from '@/app/actions/carryover'

describe('carryover actions', () => {
  beforeEach(() => {
    clearSupabaseMocks()
    mockRevalidatePath.mockClear()
    vi.clearAllMocks()
  })

  describe('getCarryoversByMonth', () => {
    it('指定月の繰越を取得する', async () => {
      const mockData = [
        {
          id: '1',
          month: '2026-01-01',
          label: '前月からの繰越',
          amount: -30000, // DBでは負の値
          person: 'husband',
          created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          month: '2026-01-01',
          label: '貯金から',
          amount: -20000,
          person: 'wife',
          created_at: '2026-01-02T00:00:00Z',
        },
      ]
      mockSelectSuccess(mockData)

      const result = await getCarryoversByMonth('2026-01-01')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('carryovers')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: '1',
        month: '2026-01-01',
        label: '前月からの繰越',
        amount: -30000,
        person: 'husband',
        createdAt: '2026-01-01T00:00:00Z',
      })
    })

    it('データがない場合は空配列を返す', async () => {
      mockSelectSuccess([])

      const result = await getCarryoversByMonth('2026-01-01')

      expect(result).toEqual([])
    })

    it('エラー時は空配列を返す', async () => {
      mockSelectError('Database error')

      const result = await getCarryoversByMonth('2026-01-01')

      expect(result).toEqual([])
    })
  })

  describe('createCarryover', () => {
    it('有効なデータで繰越を作成する（金額は負の値に変換）', async () => {
      const formData = createFormData({
        month: '2026-01-01',
        label: 'テスト繰越',
        amount: 10000, // 入力は正の値
        person: 'husband',
      })

      const mockRow = {
        id: 'new-id',
        month: '2026-01-01',
        label: 'テスト繰越',
        amount: -10000, // DBには負の値で保存
        person: 'husband',
        created_at: '2026-01-01T00:00:00Z',
      }
      mockSingleSuccess(mockRow)

      const result = await createCarryover(formData)

      expect(result.success).toBe(true)
      expect(result.data?.amount).toBe(-10000)
      expect(mockSupabaseClient._queryBuilder.insert).toHaveBeenCalledWith({
        month: '2026-01-01',
        label: 'テスト繰越',
        amount: -10000, // 負の値で保存
        person: 'husband',
      })
    })

    it('作成後にrevalidatePathが呼ばれる', async () => {
      const formData = createFormData({
        month: '2026-01-01',
        label: 'テスト',
        amount: 5000,
        person: 'husband',
      })
      mockSingleSuccess({
        id: '1',
        month: '2026-01-01',
        label: 'テスト',
        amount: -5000,
        person: 'husband',
        created_at: new Date().toISOString(),
      })

      await createCarryover(formData)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('バリデーションエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: '2026-01-01',
        label: '',
        amount: 10000,
        person: 'husband',
      })

      const result = await createCarryover(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('項目名を入力してください')
    })

    it('金額が不正な場合エラーを返す', async () => {
      const formData = createFormData({
        month: '2026-01-01',
        label: 'テスト',
        amount: 0,
        person: 'husband',
      })

      const result = await createCarryover(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('金額は正の整数を入力してください')
    })

    it('DBエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: '2026-01-01',
        label: 'テスト',
        amount: 10000,
        person: 'husband',
      })
      mockSingleError('Database error')

      const result = await createCarryover(formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('繰越の作成に失敗しました')
    })
  })

  describe('updateCarryover', () => {
    it('繰越を更新する（金額は負の値に変換）', async () => {
      const formData = createFormData({
        month: '2026-01-01',
        label: '更新後の繰越',
        amount: 15000, // 入力は正の値
        person: 'wife',
      })
      const mockRow = {
        id: 'existing-id',
        month: '2026-01-01',
        label: '更新後の繰越',
        amount: -15000, // DBには負の値
        person: 'wife',
        created_at: '2026-01-01T00:00:00Z',
      }
      mockSingleSuccess(mockRow)

      const result = await updateCarryover('existing-id', formData)

      expect(result.success).toBe(true)
      expect(result.data?.amount).toBe(-15000)
      expect(mockSupabaseClient._queryBuilder.update).toHaveBeenCalledWith({
        label: '更新後の繰越',
        amount: -15000, // 負の値で更新
        person: 'wife',
      })
    })

    it('更新後にrevalidatePathが呼ばれる', async () => {
      const formData = createFormData({
        month: '2026-01-01',
        label: 'テスト',
        amount: 5000,
        person: 'husband',
      })
      mockSingleSuccess({
        id: '1',
        month: '2026-01-01',
        label: 'テスト',
        amount: -5000,
        person: 'husband',
        created_at: new Date().toISOString(),
      })

      await updateCarryover('1', formData)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('バリデーションエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: 'invalid-date',
        label: 'テスト',
        amount: 10000,
        person: 'husband',
      })

      const result = await updateCarryover('1', formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('日付形式が不正です')
    })

    it('DBエラー時はエラーを返す', async () => {
      const formData = createFormData({
        month: '2026-01-01',
        label: 'テスト',
        amount: 10000,
        person: 'husband',
      })
      mockSingleError('Record not found')

      const result = await updateCarryover('non-existent-id', formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('繰越の更新に失敗しました')
    })
  })

  describe('deleteCarryover', () => {
    it('繰越を削除する', async () => {
      mockDeleteSuccess()

      const result = await deleteCarryover('existing-id')

      expect(result.success).toBe(true)
      expect(mockSupabaseClient._queryBuilder.delete).toHaveBeenCalled()
      expect(mockSupabaseClient._queryBuilder.eq).toHaveBeenCalledWith(
        'id',
        'existing-id'
      )
    })

    it('削除後にrevalidatePathが呼ばれる', async () => {
      mockDeleteSuccess()

      await deleteCarryover('1')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('DBエラー時はエラーを返す', async () => {
      mockDeleteError('Delete failed')

      const result = await deleteCarryover('1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('繰越の削除に失敗しました')
    })
  })
})
