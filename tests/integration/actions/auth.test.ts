import { describe, it, expect, beforeEach, vi } from 'vitest'
import '../../../tests/mocks/next'
import {
  mockSupabaseClient,
  mockSingleSuccess,
  mockSingleError,
  clearSupabaseMocks,
} from '../../../tests/mocks/supabase'
import { mockCookies, mockRedirect } from '../../../tests/mocks/next'
import { createFormData } from '../../../tests/mocks/helpers'

// bcryptのモック
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}))

import bcrypt from 'bcryptjs'
import { login, logout, isAuthenticated } from '@/app/actions/auth'

describe('auth actions', () => {
  beforeEach(() => {
    clearSupabaseMocks()
    mockCookies.get.mockClear()
    mockCookies.set.mockClear()
    mockCookies.delete.mockClear()
    mockRedirect.mockClear()
    vi.clearAllMocks()

    // 環境変数をクリア
    delete process.env.APP_PASSWORD_HASH_BASE64
  })

  describe('login', () => {
    it('パスワード未入力でエラーを返す', async () => {
      const formData = createFormData({ password: '' })

      const result = await login({ error: undefined }, formData)

      expect(result.error).toBe('パスワードを入力してください')
    })

    it('環境変数からハッシュを取得して認証成功', async () => {
      // 環境変数にBase64エンコードされたハッシュを設定
      const mockHash = '$2a$10$testHashValue'
      process.env.APP_PASSWORD_HASH_BASE64 = Buffer.from(mockHash).toString(
        'base64'
      )

      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never)

      const formData = createFormData({ password: 'correct-password' })

      // redirectは例外をスローするので、catchする
      await expect(login({ error: undefined }, formData)).rejects.toThrow(
        'NEXT_REDIRECT:/'
      )

      expect(bcrypt.compare).toHaveBeenCalledWith('correct-password', mockHash)
      expect(mockCookies.set).toHaveBeenCalled()
    })

    it('環境変数からハッシュを取得して認証失敗', async () => {
      const mockHash = '$2a$10$testHashValue'
      process.env.APP_PASSWORD_HASH_BASE64 = Buffer.from(mockHash).toString(
        'base64'
      )

      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never)

      const formData = createFormData({ password: 'wrong-password' })
      const result = await login({ error: undefined }, formData)

      expect(result.error).toBe('パスワードが正しくありません')
      expect(mockCookies.set).not.toHaveBeenCalled()
    })

    it('Supabaseからハッシュを取得して認証成功', async () => {
      // 環境変数なし
      mockSingleSuccess({ value: '$2a$10$supabaseHashValue' })
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never)

      const formData = createFormData({ password: 'correct-password' })

      await expect(login({ error: undefined }, formData)).rejects.toThrow(
        'NEXT_REDIRECT:/'
      )

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('app_settings')
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'correct-password',
        '$2a$10$supabaseHashValue'
      )
    })

    it('Supabaseからハッシュを取得して認証失敗', async () => {
      mockSingleSuccess({ value: '$2a$10$supabaseHashValue' })
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never)

      const formData = createFormData({ password: 'wrong-password' })
      const result = await login({ error: undefined }, formData)

      expect(result.error).toBe('パスワードが正しくありません')
    })

    it('認証設定がない場合エラーを返す', async () => {
      // 環境変数なし、Supabaseもデータなし
      mockSingleSuccess(null)

      const formData = createFormData({ password: 'any-password' })
      const result = await login({ error: undefined }, formData)

      expect(result.error).toBe('認証設定が見つかりません')
    })

    it('認証成功時にセッションCookieが設定される', async () => {
      const mockHash = '$2a$10$testHashValue'
      process.env.APP_PASSWORD_HASH_BASE64 = Buffer.from(mockHash).toString(
        'base64'
      )
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never)

      const formData = createFormData({ password: 'correct-password' })

      try {
        await login({ error: undefined }, formData)
      } catch {
        // redirect例外を無視
      }

      expect(mockCookies.set).toHaveBeenCalledWith(
        'household_session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        })
      )
    })
  })

  describe('logout', () => {
    it('セッションCookieを削除してログインページにリダイレクト', async () => {
      await expect(logout()).rejects.toThrow('NEXT_REDIRECT:/login')

      expect(mockCookies.delete).toHaveBeenCalledWith('household_session')
    })
  })

  describe('isAuthenticated', () => {
    it('セッションCookieがあればtrueを返す', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'session-token' })

      const result = await isAuthenticated()

      expect(result).toBe(true)
      expect(mockCookies.get).toHaveBeenCalledWith('household_session')
    })

    it('セッションCookieがなければfalseを返す', async () => {
      mockCookies.get.mockReturnValueOnce(undefined)

      const result = await isAuthenticated()

      expect(result).toBe(false)
    })
  })
})
