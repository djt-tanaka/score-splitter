import { describe, it, expect } from 'vitest'
import { formatCurrency, formatMonth, parseMonth } from '@/lib/utils/format'

describe('formatCurrency', () => {
  it('正の値をカンマ区切りで表示する', () => {
    expect(formatCurrency(1037038)).toBe('¥1,037,038')
  })

  it('負の値をカンマ区切りで表示する', () => {
    expect(formatCurrency(-833778)).toBe('-¥833,778')
  })

  it('0を正しく表示する', () => {
    expect(formatCurrency(0)).toBe('¥0')
  })

  it('小数点以下は切り捨てる', () => {
    expect(formatCurrency(101630.5)).toBe('¥101,630')
  })
})

describe('formatMonth', () => {
  it('ISO日付を年月形式に変換する', () => {
    expect(formatMonth('2026-01-01')).toBe('2026年1月')
  })

  it('月の先頭の0を除去する', () => {
    expect(formatMonth('2026-09-01')).toBe('2026年9月')
  })

  it('12月を正しく表示する', () => {
    expect(formatMonth('2026-12-01')).toBe('2026年12月')
  })
})

describe('parseMonth', () => {
  it('Dateオブジェクトを月初のISO文字列に変換する', () => {
    const date = new Date(2026, 0, 15) // 2026年1月15日
    expect(parseMonth(date)).toBe('2026-01-01')
  })

  it('月末の日付でも月初の文字列を返す', () => {
    const date = new Date(2026, 1, 28) // 2026年2月28日
    expect(parseMonth(date)).toBe('2026-02-01')
  })
})
