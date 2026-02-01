'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { carryoverSchema } from '@/lib/validations/carryover'
import type { Carryover } from '@/types'

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export async function getCarryoversByMonth(month: string): Promise<Carryover[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('carryovers')
    .select('*')
    .eq('month', month)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('繰越取得エラー:', error)
    return []
  }

  return data.map((row) => ({
    id: row.id,
    month: row.month,
    label: row.label,
    amount: row.amount,
    person: row.person,
    createdAt: row.created_at,
  }))
}

export async function createCarryover(
  formData: FormData
): Promise<ActionResult<Carryover>> {
  const rawData = {
    month: formData.get('month') as string,
    label: formData.get('label') as string,
    amount: Number(formData.get('amount')),
    person: formData.get('person') as string,
  }

  const parsed = carryoverSchema.safeParse(rawData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  // 入力は正の値、保存時に負の値に変換
  const { data, error } = await supabase
    .from('carryovers')
    .insert({
      month: parsed.data.month,
      label: parsed.data.label,
      amount: -parsed.data.amount,
      person: parsed.data.person,
    })
    .select()
    .single()

  if (error) {
    console.error('繰越作成エラー:', error)
    return { success: false, error: '繰越の作成に失敗しました' }
  }

  revalidatePath('/')
  return {
    success: true,
    data: {
      id: data.id,
      month: data.month,
      label: data.label,
      amount: data.amount,
      person: data.person,
      createdAt: data.created_at,
    },
  }
}

export async function updateCarryover(
  id: string,
  formData: FormData
): Promise<ActionResult<Carryover>> {
  const rawData = {
    month: formData.get('month') as string,
    label: formData.get('label') as string,
    amount: Number(formData.get('amount')),
    person: formData.get('person') as string,
  }

  const parsed = carryoverSchema.safeParse(rawData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  // 入力は正の値、保存時に負の値に変換
  const { data, error } = await supabase
    .from('carryovers')
    .update({
      label: parsed.data.label,
      amount: -parsed.data.amount,
      person: parsed.data.person,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('繰越更新エラー:', error)
    return { success: false, error: '繰越の更新に失敗しました' }
  }

  revalidatePath('/')
  return {
    success: true,
    data: {
      id: data.id,
      month: data.month,
      label: data.label,
      amount: data.amount,
      person: data.person,
      createdAt: data.created_at,
    },
  }
}

export async function deleteCarryover(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('carryovers').delete().eq('id', id)

  if (error) {
    console.error('繰越削除エラー:', error)
    return { success: false, error: '繰越の削除に失敗しました' }
  }

  revalidatePath('/')
  return { success: true }
}
