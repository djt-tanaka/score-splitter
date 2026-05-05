import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { Person } from '@/types'

const SESSION_COOKIE_NAME = 'household_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7日間

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function createSession(
  person: Person | null,
  authMethod: 'password' | 'passkey'
): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)

  const supabase = await createClient()
  const { error } = await supabase.from('sessions').insert({
    token,
    person,
    auth_method: authMethod,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    throw new Error(`セッション作成に失敗しました: ${error.message}`)
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return token
}

export interface SessionInfo {
  person: Person | null
  authMethod: 'password' | 'passkey'
}

export async function getSession(): Promise<SessionInfo | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!cookie?.value) {
    return null
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('sessions')
    .select('person, auth_method, expires_at')
    .eq('token', cookie.value)
    .single()

  if (!data) {
    return null
  }

  if (new Date(data.expires_at) < new Date()) {
    await deleteSession()
    return null
  }

  return {
    person: data.person as Person | null,
    authMethod: data.auth_method as 'password' | 'passkey',
  }
}

export async function getSessionPerson(): Promise<Person | null> {
  const session = await getSession()
  return session?.person ?? null
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (cookie?.value) {
    const supabase = await createClient()
    await supabase.from('sessions').delete().eq('token', cookie.value)
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!cookie?.value) {
    return false
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('sessions')
    .select('expires_at')
    .eq('token', cookie.value)
    .single()

  if (!data) {
    return false
  }

  return new Date(data.expires_at) > new Date()
}
