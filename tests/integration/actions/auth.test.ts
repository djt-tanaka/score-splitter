import { describe, it, expect, beforeEach, vi } from 'vitest'
import '../../../tests/mocks/next'
import {
  mockSupabaseClient,
  mockSingleSuccess,
  clearSupabaseMocks,
} from '../../../tests/mocks/supabase'
import { mockCookies, mockRedirect } from '../../../tests/mocks/next'
import { createFormData } from '../../../tests/mocks/helpers'

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}))

vi.mock('@/lib/webauthn/session', () => ({
  createSession: vi.fn(async () => 'mock-session-token'),
  deleteSession: vi.fn(async () => undefined),
  isAuthenticated: vi.fn(async () => false),
}))

import bcrypt from 'bcryptjs'
import { login, logout, isAuthenticated } from '@/app/actions/auth'
import {
  createSession,
  deleteSession,
  isAuthenticated as checkSession,
} from '@/lib/webauthn/session'

describe('auth actions', () => {
  beforeEach(() => {
    clearSupabaseMocks()
    mockCookies.get.mockClear()
    mockCookies.set.mockClear()
    mockCookies.delete.mockClear()
    mockRedirect.mockClear()
    vi.clearAllMocks()

    delete process.env.APP_PASSWORD_HASH_BASE64
  })

  describe('login', () => {
    it('パスワード未入��でエラーを返す', async () => {
      const formData = createFormData({ password: '' })

      const result = await login({ error: undefined }, formData)

      expect(result.error).toBe('パスワードを入力してください')
    })

    it('環境変数からハッシュを取得して認証成功', async () => {
      const mockHash = '$2a$10$testHashValue'
      process.env.APP_PASSWORD_HASH_BASE64 = Buffer.from(mockHash).toString(
        'base64'
      )

      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never)

      const formData = createFormData({ password: 'correct-password' })

      await expect(login({ error: undefined }, formData)).rejects.toThrow(
        'NEXT_REDIRECT:/'
      )

      expect(bcrypt.compare).toHaveBeenCalledWith('correct-password', mockHash)
      expect(createSession).toHaveBeenCalledWith(null, 'password')
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
      expect(createSession).not.toHaveBeenCalled()
    })

    it('Supabaseからハッシュを取得して認証成功', async () => {
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
      expect(createSession).toHaveBeenCalledWith(null, 'password')
    })

    it('Supabaseからハッシュを取得して認証失敗', async () => {
      mockSingleSuccess({ value: '$2a$10$supabaseHashValue' })
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never)

      const formData = createFormData({ password: 'wrong-password' })
      const result = await login({ error: undefined }, formData)

      expect(result.error).toBe('パスワードが正しくありません')
    })

    it('認証設定がない場合エラーを返す', async () => {
      mockSingleSuccess(null)

      const formData = createFormData({ password: 'any-password' })
      const result = await login({ error: undefined }, formData)

      expect(result.error).toBe('認証設定が見つかりません')
    })
  })

  describe('logout', () => {
    it('セッションを削除してログインページにリダイレクト', async () => {
      await expect(logout()).rejects.toThrow('NEXT_REDIRECT:/login')

      expect(deleteSession).toHaveBeenCalled()
    })
  })

  describe('isAuthenticated', () => {
    it('セッションモジュールに委譲する', async () => {
      vi.mocked(checkSession).mockResolvedValueOnce(true)

      const result = await isAuthenticated()

      expect(result).toBe(true)
      expect(checkSession).toHaveBeenCalled()
    })

    it('セッションがなければfalseを返す', async () => {
      vi.mocked(checkSession).mockResolvedValueOnce(false)

      const result = await isAuthenticated()

      expect(result).toBe(false)
    })
  })
})
