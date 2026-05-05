import { describe, it, expect, beforeEach } from 'vitest'
import '../../../../tests/mocks/next'
import {
  mockSupabaseClient,
  mockSingleSuccess,
  clearSupabaseMocks,
} from '../../../../tests/mocks/supabase'
import { mockCookies } from '../../../../tests/mocks/next'

import {
  createSession,
  getSession,
  getSessionPerson,
  deleteSession,
  isAuthenticated,
} from '@/lib/webauthn/session'

describe('session module', () => {
  beforeEach(() => {
    clearSupabaseMocks()
    mockCookies.get.mockClear()
    mockCookies.set.mockClear()
    mockCookies.delete.mockClear()
  })

  describe('createSession', () => {
    it('セッションを作成してcookieを設定する', async () => {
      // insert が成功を返すようにモック
      mockSupabaseClient._queryBuilder.insert.mockResolvedValueOnce({
        error: null,
      })

      const token = await createSession('husband', 'passkey')

      expect(token).toHaveLength(64)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions')
      expect(mockCookies.set).toHaveBeenCalledWith(
        'household_session',
        token,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        })
      )
    })

    it('person null（��スワードログイン）でもセッション作成できる', async () => {
      mockSupabaseClient._queryBuilder.insert.mockResolvedValueOnce({
        error: null,
      })

      const token = await createSession(null, 'password')

      expect(token).toHaveLength(64)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions')
    })

    it('DB挿入失敗時にエラーをスローする', async () => {
      mockSupabaseClient._queryBuilder.insert.mockResolvedValueOnce({
        error: { message: 'DB error' },
      })

      await expect(createSession('wife', 'passkey')).rejects.toThrow(
        'セッション作成に失敗しました'
      )
    })
  })

  describe('getSession', () => {
    it('有効なセッションを返す', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'valid-token' })

      const futureDate = new Date(Date.now() + 86400000).toISOString()
      mockSingleSuccess({
        person: 'husband',
        auth_method: 'passkey',
        expires_at: futureDate,
      })

      const session = await getSession()

      expect(session).toEqual({
        person: 'husband',
        authMethod: 'passkey',
      })
    })

    it('cookieが��い場合nullを返す', async () => {
      mockCookies.get.mockReturnValueOnce(undefined)

      const session = await getSession()

      expect(session).toBeNull()
    })

    it('DBにセッ���ョンがない場合nullを返す', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'invalid-token' })
      mockSingleSuccess(null)

      const session = await getSession()

      expect(session).toBeNull()
    })

    it('期限切れセッショ���の場合nullを返しセッションを削除する', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'expired-token' })

      const pastDate = new Date(Date.now() - 86400000).toISOString()
      mockSingleSuccess({
        person: 'wife',
        auth_method: 'password',
        expires_at: pastDate,
      })

      // deleteSession 内の cookie.get も必要
      mockCookies.get.mockReturnValueOnce({ value: 'expired-token' })

      const session = await getSession()

      expect(session).toBeNull()
      expect(mockCookies.delete).toHaveBeenCalledWith('household_session')
    })
  })

  describe('getSessionPerson', () => {
    it('セッションからpersonを返す', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'token' })

      const futureDate = new Date(Date.now() + 86400000).toISOString()
      mockSingleSuccess({
        person: 'wife',
        auth_method: 'passkey',
        expires_at: futureDate,
      })

      const person = await getSessionPerson()

      expect(person).toBe('wife')
    })

    it('セッションがない場合nullを返す', async () => {
      mockCookies.get.mockReturnValueOnce(undefined)

      const person = await getSessionPerson()

      expect(person).toBeNull()
    })
  })

  describe('deleteSession', () => {
    it('DBからセッションを削除しcookieを削除する', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'session-token' })

      await deleteSession()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('sessions')
      expect(mockCookies.delete).toHaveBeenCalledWith('household_session')
    })

    it('cookieがない場合もcookie削除は実行する', async () => {
      mockCookies.get.mockReturnValueOnce(undefined)

      await deleteSession()

      expect(mockCookies.delete).toHaveBeenCalledWith('household_session')
    })
  })

  describe('isAuthenticated', () => {
    it('有効なセッションがあればtrueを返す', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'valid-token' })

      const futureDate = new Date(Date.now() + 86400000).toISOString()
      mockSingleSuccess({ expires_at: futureDate })

      const result = await isAuthenticated()

      expect(result).toBe(true)
    })

    it('cookieがなければfalseを返す', async () => {
      mockCookies.get.mockReturnValueOnce(undefined)

      const result = await isAuthenticated()

      expect(result).toBe(false)
    })

    it('DBにセッションがなければfalseを返す', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'token' })
      mockSingleSuccess(null)

      const result = await isAuthenticated()

      expect(result).toBe(false)
    })

    it('期限切れセッションはfalseを返す', async () => {
      mockCookies.get.mockReturnValueOnce({ value: 'token' })

      const pastDate = new Date(Date.now() - 86400000).toISOString()
      mockSingleSuccess({ expires_at: pastDate })

      const result = await isAuthenticated()

      expect(result).toBe(false)
    })
  })
})
