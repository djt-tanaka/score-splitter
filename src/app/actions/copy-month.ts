'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  CopyMonthOptions,
  CopyMonthResult,
  CopyMonthPreview,
  CopyItem,
} from '@/types'

/**
 * コピー操作のプレビューを取得
 * コピー元の全項目リストとコピー先の既存データ件数を返す
 */
export async function getCopyMonthPreview(
  sourceMonth: string,
  targetMonth: string
): Promise<CopyMonthPreview> {
  const supabase = await createClient()

  const [incomes, expenses, carryovers, existingCounts] = await Promise.all([
    supabase
      .from('incomes')
      .select('id, label, amount, person')
      .eq('month', sourceMonth)
      .order('created_at', { ascending: true }),
    supabase
      .from('expenses')
      .select('id, label, amount, person')
      .eq('month', sourceMonth)
      .order('created_at', { ascending: true }),
    supabase
      .from('carryovers')
      .select('id, label, amount, person')
      .eq('month', sourceMonth)
      .order('created_at', { ascending: true }),
    Promise.all([
      supabase
        .from('incomes')
        .select('*', { count: 'exact', head: true })
        .eq('month', targetMonth),
      supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('month', targetMonth),
      supabase
        .from('carryovers')
        .select('*', { count: 'exact', head: true })
        .eq('month', targetMonth),
    ]),
  ])

  const items: CopyItem[] = [
    ...(incomes.data ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      person: item.person,
      type: 'income' as const,
    })),
    ...(expenses.data ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      person: item.person,
      type: 'expense' as const,
    })),
    ...(carryovers.data ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      amount: item.amount,
      person: item.person,
      type: 'carryover' as const,
    })),
  ]

  const existingCount =
    (existingCounts[0].count ?? 0) +
    (existingCounts[1].count ?? 0) +
    (existingCounts[2].count ?? 0)

  return {
    sourceMonth,
    targetMonth,
    items,
    existingCount,
  }
}

/**
 * 月データをコピー
 */
export async function copyMonthData(
  options: CopyMonthOptions
): Promise<CopyMonthResult> {
  const supabase = await createClient()

  const result: CopyMonthResult = {
    success: true,
    copied: { incomes: 0, expenses: 0, carryovers: 0 },
    skipped: { incomes: 0, expenses: 0, carryovers: 0 },
  }

  try {
    // 置換モードの場合、先に既存データを削除
    if (options.mode === 'replace') {
      const hasIncome = options.selectedItems.some((i) => i.type === 'income')
      const hasExpense = options.selectedItems.some((i) => i.type === 'expense')
      const hasCarryover = options.selectedItems.some(
        (i) => i.type === 'carryover'
      )

      if (hasIncome) {
        await supabase
          .from('incomes')
          .delete()
          .eq('month', options.targetMonth)
      }
      if (hasExpense) {
        await supabase
          .from('expenses')
          .delete()
          .eq('month', options.targetMonth)
      }
      if (hasCarryover) {
        await supabase
          .from('carryovers')
          .delete()
          .eq('month', options.targetMonth)
      }
    }

    // スキップモードの場合、既存データのキーを取得
    let existingKeys: Record<string, Set<string>> = {
      income: new Set(),
      expense: new Set(),
      carryover: new Set(),
    }

    if (options.mode === 'skip') {
      const [existingIncomes, existingExpenses, existingCarryovers] =
        await Promise.all([
          supabase
            .from('incomes')
            .select('label, person')
            .eq('month', options.targetMonth),
          supabase
            .from('expenses')
            .select('label, person')
            .eq('month', options.targetMonth),
          supabase
            .from('carryovers')
            .select('label, person')
            .eq('month', options.targetMonth),
        ])

      existingKeys = {
        income: new Set(
          (existingIncomes.data ?? []).map((d) => `${d.label}|${d.person}`)
        ),
        expense: new Set(
          (existingExpenses.data ?? []).map((d) => `${d.label}|${d.person}`)
        ),
        carryover: new Set(
          (existingCarryovers.data ?? []).map((d) => `${d.label}|${d.person}`)
        ),
      }
    }

    // 各タイプごとにバッチ挿入
    const incomeItems: Array<{
      month: string
      label: string
      amount: number
      person: string
    }> = []
    const expenseItems: Array<{
      month: string
      label: string
      amount: number
      person: string
    }> = []
    const carryoverItems: Array<{
      month: string
      label: string
      amount: number
      person: string
    }> = []

    for (const item of options.selectedItems) {
      const key = `${item.label}|${item.person}`

      if (options.mode === 'skip' && existingKeys[item.type].has(key)) {
        if (item.type === 'income') result.skipped.incomes++
        else if (item.type === 'expense') result.skipped.expenses++
        else result.skipped.carryovers++
        continue
      }

      const newItem = {
        month: options.targetMonth,
        label: item.label,
        amount: item.amount,
        person: item.person,
      }

      if (item.type === 'income') {
        incomeItems.push(newItem)
        result.copied.incomes++
      } else if (item.type === 'expense') {
        expenseItems.push(newItem)
        result.copied.expenses++
      } else {
        carryoverItems.push(newItem)
        result.copied.carryovers++
      }
    }

    // バッチ挿入
    if (incomeItems.length > 0) {
      const { error } = await supabase.from('incomes').insert(incomeItems)
      if (error) throw new Error(`収入の挿入に失敗: ${error.message}`)
    }

    if (expenseItems.length > 0) {
      const { error } = await supabase.from('expenses').insert(expenseItems)
      if (error) throw new Error(`支出の挿入に失敗: ${error.message}`)
    }

    if (carryoverItems.length > 0) {
      const { error } = await supabase.from('carryovers').insert(carryoverItems)
      if (error) throw new Error(`繰越の挿入に失敗: ${error.message}`)
    }

    revalidatePath('/')
    return result
  } catch (error) {
    console.error('月データコピーエラー:', error)
    return {
      success: false,
      copied: { incomes: 0, expenses: 0, carryovers: 0 },
      skipped: { incomes: 0, expenses: 0, carryovers: 0 },
      error:
        error instanceof Error ? error.message : 'データのコピーに失敗しました',
    }
  }
}
