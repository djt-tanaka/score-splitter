'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'

const SESSION_COOKIE_NAME = 'household_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7日間

function generateSessionToken(): string {
  return crypto.randomUUID()
}

export async function login(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get('password') as string

  if (!password) {
    return { error: 'パスワードを入力してください' }
  }

  // 環境変数からハッシュを取得（Base64デコードが必要）
  const hashBase64 = process.env.APP_PASSWORD_HASH_BASE64
  const storedHash = hashBase64
    ? Buffer.from(hashBase64, 'base64').toString('utf-8')
    : null

  if (!storedHash) {
    // Supabaseからハッシュを取得を試みる
    const supabase = await createClient()
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'app_password_hash')
      .single()

    if (!data) {
      return { error: '認証設定が見つかりません' }
    }

    const isValid = await bcrypt.compare(password, data.value)
    if (!isValid) {
      return { error: 'パスワードが正しくありません' }
    }
  } else {
    const isValid = await bcrypt.compare(password, storedHash)
    if (!isValid) {
      return { error: 'パスワードが正しくありません' }
    }
  }

  // セッションCookie設定
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, generateSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  redirect('/')
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect('/login')
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)
  return !!session
}
