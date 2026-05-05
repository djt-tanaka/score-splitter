'use server'

import {
  generateRegistrationOptions as generateRegOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions as generateAuthOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server'
import { createClient } from '@/lib/supabase/server'
import { getWebAuthnConfig } from '@/lib/webauthn/config'
import { createSession, isAuthenticated } from '@/lib/webauthn/session'
import type { ActionResult, Person } from '@/types'

const CHALLENGE_TTL_MINUTES = 5

export interface PasskeyInfo {
  id: string
  person: Person
  deviceName: string | null
  createdAt: string
}

// --- 登録 ---

export async function generateRegistrationOptions(
  person: Person
): Promise<ActionResult<PublicKeyCredentialCreationOptionsJSON>> {
  if (!(await isAuthenticated())) {
    return { success: false, error: '認証が必要です' }
  }

  const config = getWebAuthnConfig()
  const supabase = await createClient()

  // 既存のパスキーを取得（同一personの重複登録防止のため excludeCredentials に含める）
  const { data: existingCredentials } = await supabase
    .from('passkey_credentials')
    .select('id, transports')
    .eq('person', person)

  const userID = new TextEncoder().encode(person)

  const options = await generateRegOptions({
    rpName: config.rpName,
    rpID: config.rpID,
    userName: person === 'husband' ? '夫' : '妻',
    userDisplayName: person === 'husband' ? '夫' : '妻',
    userID,
    attestationType: 'none',
    excludeCredentials: (existingCredentials ?? []).map((cred) => ({
      id: cred.id,
      transports: (cred.transports ?? []) as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
  })

  // チャレンジをDBに保存
  await supabase.from('webauthn_challenges').insert({
    challenge: options.challenge,
    type: 'registration',
    person,
    expires_at: new Date(
      Date.now() + CHALLENGE_TTL_MINUTES * 60 * 1000
    ).toISOString(),
  })

  // 期限切れチャレンジを掃除
  await supabase
    .from('webauthn_challenges')
    .delete()
    .lt('expires_at', new Date().toISOString())

  return { success: true, data: options }
}

export async function verifyRegistration(
  person: Person,
  credential: RegistrationResponseJSON,
  deviceName?: string
): Promise<ActionResult<{ credentialId: string }>> {
  if (!(await isAuthenticated())) {
    return { success: false, error: '認証が必要です' }
  }

  const config = getWebAuthnConfig()
  const supabase = await createClient()

  // チャレンジを取得
  const { data: challengeRecord } = await supabase
    .from('webauthn_challenges')
    .select('challenge, expires_at')
    .eq('type', 'registration')
    .eq('person', person)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!challengeRecord) {
    return { success: false, error: 'チャレンジが見つかりません。もう一度お試しください' }
  }

  if (new Date(challengeRecord.expires_at) < new Date()) {
    return { success: false, error: 'チャレンジの有効期限が切れました。もう一度お試しください' }
  }

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: challengeRecord.challenge,
    expectedOrigin: config.origin,
    expectedRPID: config.rpID,
    requireUserVerification: false,
  })

  if (!verification.verified || !verification.registrationInfo) {
    return { success: false, error: 'パスキーの検証に失敗しました' }
  }

  const { credential: registeredCredential, credentialBackedUp } =
    verification.registrationInfo

  // 資格情報を保存
  const { error } = await supabase.from('passkey_credentials').insert({
    id: registeredCredential.id,
    person,
    public_key: Buffer.from(registeredCredential.publicKey).toString('base64'),
    counter: registeredCredential.counter,
    device_name: deviceName ?? (credentialBackedUp ? 'クラウド同期' : 'デバイス'),
    transports: credential.response.transports ?? [],
  })

  if (error) {
    return { success: false, error: `パスキーの保存に失敗しました: ${error.message}` }
  }

  // 使用済みチャレンジを削除
  await supabase
    .from('webauthn_challenges')
    .delete()
    .eq('type', 'registration')
    .eq('person', person)

  return { success: true, data: { credentialId: registeredCredential.id } }
}

// --- 認証 ---

export async function generateAuthenticationOptions(): Promise<
  ActionResult<PublicKeyCredentialRequestOptionsJSON>
> {
  const config = getWebAuthnConfig()
  const supabase = await createClient()

  const options = await generateAuthOptions({
    rpID: config.rpID,
    userVerification: 'preferred',
    // allowCredentials を空にして discoverable credentials を使う
  })

  await supabase.from('webauthn_challenges').insert({
    challenge: options.challenge,
    type: 'authentication',
    person: null,
    expires_at: new Date(
      Date.now() + CHALLENGE_TTL_MINUTES * 60 * 1000
    ).toISOString(),
  })

  // 期限切れチャレンジを掃除
  await supabase
    .from('webauthn_challenges')
    .delete()
    .lt('expires_at', new Date().toISOString())

  return { success: true, data: options }
}

export async function verifyAuthentication(
  credential: AuthenticationResponseJSON
): Promise<ActionResult<{ person: Person }>> {
  const config = getWebAuthnConfig()
  const supabase = await createClient()

  // 資格情報をIDで検索
  const { data: storedCredential } = await supabase
    .from('passkey_credentials')
    .select('id, person, public_key, counter, transports')
    .eq('id', credential.id)
    .single()

  if (!storedCredential) {
    return { success: false, error: '登録されていないパスキーです' }
  }

  // 最新のチャレンジを取得
  const { data: challengeRecord } = await supabase
    .from('webauthn_challenges')
    .select('challenge, expires_at')
    .eq('type', 'authentication')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!challengeRecord) {
    return { success: false, error: 'チャレンジが見つかりません。もう一度お試しください' }
  }

  if (new Date(challengeRecord.expires_at) < new Date()) {
    return { success: false, error: 'チャレンジの有効期限が切れました。もう一度お試しください' }
  }

  const publicKeyBytes = Buffer.from(storedCredential.public_key, 'base64')

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge: challengeRecord.challenge,
    expectedOrigin: config.origin,
    expectedRPID: config.rpID,
    requireUserVerification: false,
    credential: {
      id: storedCredential.id,
      publicKey: new Uint8Array(publicKeyBytes),
      counter: storedCredential.counter,
      transports: (storedCredential.transports ?? []) as AuthenticatorTransportFuture[],
    },
  })

  if (!verification.verified) {
    return { success: false, error: 'パスキーの認証に失敗しました' }
  }

  // カウンターを更新
  await supabase
    .from('passkey_credentials')
    .update({ counter: verification.authenticationInfo.newCounter })
    .eq('id', storedCredential.id)

  // 使用済みチャレンジを削除
  await supabase
    .from('webauthn_challenges')
    .delete()
    .eq('type', 'authentication')

  const person = storedCredential.person as Person

  // セッション作成
  await createSession(person, 'passkey')

  return { success: true, data: { person } }
}

// --- 管理 ---

export async function listPasskeys(): Promise<ActionResult<PasskeyInfo[]>> {
  if (!(await isAuthenticated())) {
    return { success: false, error: '認証が必要です' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('passkey_credentials')
    .select('id, person, device_name, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    return { success: false, error: `パスキー一覧の取得に失敗しました: ${error.message}` }
  }

  const passkeys: PasskeyInfo[] = (data ?? []).map((row) => ({
    id: row.id,
    person: row.person as Person,
    deviceName: row.device_name,
    createdAt: row.created_at,
  }))

  return { success: true, data: passkeys }
}

export async function deletePasskey(
  credentialId: string
): Promise<ActionResult> {
  if (!(await isAuthenticated())) {
    return { success: false, error: '認証が必要です' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('passkey_credentials')
    .delete()
    .eq('id', credentialId)

  if (error) {
    return { success: false, error: `パスキーの削除に失敗しました: ${error.message}` }
  }

  return { success: true }
}
