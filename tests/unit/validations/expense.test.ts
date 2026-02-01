import { describe, it, expect } from 'vitest'
import { expenseSchema } from '@/lib/validations/expense'

describe('expenseSchema', () => {
  // 入力時は正の値（保存時に負の値に変換される）
  const validData = {
    month: '202601',
    label: 'テスト支出',
    amount: 50000,
    person: 'husband' as const,
  }

  it('有効なデータを受け入れる', () => {
    const result = expenseSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('妻のデータも受け入れる', () => {
    const result = expenseSchema.safeParse({ ...validData, person: 'wife' })
    expect(result.success).toBe(true)
  })

  describe('月形式のバリデーション', () => {
    it('不正な形式（桁数不足）でエラー', () => {
      const result = expenseSchema.safeParse({ ...validData, month: '20261' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('月形式が不正です')
      }
    })

    it('不正な形式（桁数超過）でエラー', () => {
      const result = expenseSchema.safeParse({
        ...validData,
        month: '2026010',
      })
      expect(result.success).toBe(false)
    })

    it('不正な形式（ハイフン付き）でエラー', () => {
      const result = expenseSchema.safeParse({
        ...validData,
        month: '2026-01',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('項目名のバリデーション', () => {
    it('空文字でエラー', () => {
      const result = expenseSchema.safeParse({ ...validData, label: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('項目名を入力してください')
      }
    })

    it('256文字以上でエラー', () => {
      const result = expenseSchema.safeParse({
        ...validData,
        label: 'あ'.repeat(256),
      })
      expect(result.success).toBe(false)
    })

    it('255文字は受け入れる', () => {
      const result = expenseSchema.safeParse({
        ...validData,
        label: 'あ'.repeat(255),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('金額のバリデーション', () => {
    it('0でエラー', () => {
      const result = expenseSchema.safeParse({ ...validData, amount: 0 })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '金額は正の整数を入力してください'
        )
      }
    })

    it('負の値でエラー（入力時は正の値を期待）', () => {
      const result = expenseSchema.safeParse({ ...validData, amount: -100 })
      expect(result.success).toBe(false)
    })

    it('小数でエラー', () => {
      const result = expenseSchema.safeParse({ ...validData, amount: 100.5 })
      expect(result.success).toBe(false)
    })

    it('1は受け入れる', () => {
      const result = expenseSchema.safeParse({ ...validData, amount: 1 })
      expect(result.success).toBe(true)
    })
  })

  describe('担当者のバリデーション', () => {
    it('不正な値でエラー', () => {
      const result = expenseSchema.safeParse({ ...validData, person: 'invalid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('担当者を選択してください')
      }
    })

    it('空文字でエラー', () => {
      const result = expenseSchema.safeParse({ ...validData, person: '' })
      expect(result.success).toBe(false)
    })
  })
})
