'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { incomeSchema } from '@/lib/validations/income'
import { toDbMonth, fromDbMonth } from '@/lib/utils/format'
import type { Income } from '@/types'

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export async function getIncomesByMonth(month: string): Promise<Income[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('month', toDbMonth(month))
    .order('created_at', { ascending: true })

  if (error) {
    console.error('収入取得エラー:', error)
    return []
  }

  return data.map((row) => ({
    id: row.id,
    month: fromDbMonth(row.month),
    label: row.label,
    amount: row.amount,
    person: row.person,
    createdAt: row.created_at,
  }))
}

export async function createIncome(
  formData: FormData
): Promise<ActionResult<Income>> {
  const rawData = {
    month: formData.get('month') as string,
    label: formData.get('label') as string,
    amount: Number(formData.get('amount')),
    person: formData.get('person') as string,
  }

  const parsed = incomeSchema.safeParse(rawData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('incomes')
    .insert({
      month: toDbMonth(parsed.data.month),
      label: parsed.data.label,
      amount: parsed.data.amount,
      person: parsed.data.person,
    })
    .select()
    .single()

  if (error) {
    console.error('収入作成エラー:', error)
    return { success: false, error: '収入の作成に失敗しました' }
  }

  revalidatePath('/')
  return {
    success: true,
    data: {
      id: data.id,
      month: fromDbMonth(data.month),
      label: data.label,
      amount: data.amount,
      person: data.person,
      createdAt: data.created_at,
    },
  }
}

export async function updateIncome(
  id: string,
  formData: FormData
): Promise<ActionResult<Income>> {
  const rawData = {
    month: formData.get('month') as string,
    label: formData.get('label') as string,
    amount: Number(formData.get('amount')),
    person: formData.get('person') as string,
  }

  const parsed = incomeSchema.safeParse(rawData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('incomes')
    .update({
      label: parsed.data.label,
      amount: parsed.data.amount,
      person: parsed.data.person,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('収入更新エラー:', error)
    return { success: false, error: '収入の更新に失敗しました' }
  }

  revalidatePath('/')
  return {
    success: true,
    data: {
      id: data.id,
      month: fromDbMonth(data.month),
      label: data.label,
      amount: data.amount,
      person: data.person,
      createdAt: data.created_at,
    },
  }
}

export async function deleteIncome(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('incomes').delete().eq('id', id)

  if (error) {
    console.error('収入削除エラー:', error)
    return { success: false, error: '収入の削除に失敗しました' }
  }

  revalidatePath('/')
  return { success: true }
}
