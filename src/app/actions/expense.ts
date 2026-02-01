'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { expenseSchema } from '@/lib/validations/expense'
import type { Expense } from '@/types'

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export async function getExpensesByMonth(month: string): Promise<Expense[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('month', month)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('支出取得エラー:', error)
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

export async function createExpense(
  formData: FormData
): Promise<ActionResult<Expense>> {
  const rawData = {
    month: formData.get('month') as string,
    label: formData.get('label') as string,
    amount: Number(formData.get('amount')),
    person: formData.get('person') as string,
  }

  const parsed = expenseSchema.safeParse(rawData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  // 入力は正の値、保存時に負の値に変換
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      month: parsed.data.month,
      label: parsed.data.label,
      amount: -parsed.data.amount,
      person: parsed.data.person,
    })
    .select()
    .single()

  if (error) {
    console.error('支出作成エラー:', error)
    return { success: false, error: '支出の作成に失敗しました' }
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

export async function updateExpense(
  id: string,
  formData: FormData
): Promise<ActionResult<Expense>> {
  const rawData = {
    month: formData.get('month') as string,
    label: formData.get('label') as string,
    amount: Number(formData.get('amount')),
    person: formData.get('person') as string,
  }

  const parsed = expenseSchema.safeParse(rawData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  // 入力は正の値、保存時に負の値に変換
  const { data, error } = await supabase
    .from('expenses')
    .update({
      label: parsed.data.label,
      amount: -parsed.data.amount,
      person: parsed.data.person,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('支出更新エラー:', error)
    return { success: false, error: '支出の更新に失敗しました' }
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

export async function deleteExpense(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) {
    console.error('支出削除エラー:', error)
    return { success: false, error: '支出の削除に失敗しました' }
  }

  revalidatePath('/')
  return { success: true }
}
