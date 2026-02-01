'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { toDbMonth } from '@/lib/utils/format'
import type {
  CopyMonthOptions,
  CopyMonthResult,
  CopyMonthPreview,
  CopyItem,
} from '@/types'

/**
 * コピー操作のプレビューを取得
 * 収入・支出の項目リストと繰越件数を返す
 */
export async function getCopyMonthPreview(
  sourceMonth: string,
  targetMonth: string
): Promise<CopyMonthPreview> {
  const supabase = await createClient()
  const dbSourceMonth = toDbMonth(sourceMonth)
  const dbTargetMonth = toDbMonth(targetMonth)

  const [incomes, expenses, carryovers, existingCounts] = await Promise.all([
    supabase
      .from('incomes')
      .select('id, label, amount, person')
      .eq('month', dbSourceMonth)
      .order('created_at', { ascending: true }),
    supabase
      .from('expenses')
      .select('id, label, amount, person')
      .eq('month', dbSourceMonth)
      .order('created_at', { ascending: true }),
    supabase
      .from('carryovers')
      .select('*', { count: 'exact', head: true })
      .eq('month', dbSourceMonth),
    Promise.all([
      supabase
        .from('incomes')
        .select('*', { count: 'exact', head: true })
        .eq('month', dbTargetMonth),
      supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('month', dbTargetMonth),
      supabase
        .from('carryovers')
        .select('*', { count: 'exact', head: true })
        .eq('month', dbTargetMonth),
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
  ]

  const existingCount =
    (existingCounts[0].count ?? 0) +
    (existingCounts[1].count ?? 0) +
    (existingCounts[2].count ?? 0)

  return {
    sourceMonth,
    targetMonth,
    items,
    carryoverCount: carryovers.count ?? 0,
    existingCount,
  }
}

/**
 * 繰越を一括コピー
 */
async function copyCarryovers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sourceMonth: string,
  targetMonth: string,
  mode: 'add' | 'skip' | 'replace'
): Promise<{ copied: number; skipped: number }> {
  const dbSourceMonth = toDbMonth(sourceMonth)
  const dbTargetMonth = toDbMonth(targetMonth)

  const { data: sourceData, error } = await supabase
    .from('carryovers')
    .select('label, amount, person')
    .eq('month', dbSourceMonth)

  if (error || !sourceData) {
    throw new Error('繰越の取得に失敗しました')
  }

  let copied = 0
  let skipped = 0

  let existingKeys = new Set<string>()
  if (mode === 'skip') {
    const { data: existingData } = await supabase
      .from('carryovers')
      .select('label, person')
      .eq('month', dbTargetMonth)

    existingKeys = new Set(
      (existingData ?? []).map((d) => `${d.label}|${d.person}`)
    )
  }

  const itemsToInsert: Array<{
    month: string
    label: string
    amount: number
    person: string
  }> = []

  for (const item of sourceData) {
    const key = `${item.label}|${item.person}`

    if (mode === 'skip' && existingKeys.has(key)) {
      skipped++
      continue
    }

    itemsToInsert.push({
      month: dbTargetMonth,
      label: item.label,
      amount: item.amount,
      person: item.person,
    })
    copied++
  }

  if (itemsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('carryovers')
      .insert(itemsToInsert)

    if (insertError) {
      throw new Error(`繰越の挿入に失敗: ${insertError.message}`)
    }
  }

  return { copied, skipped }
}

/**
 * 月データをコピー
 */
export async function copyMonthData(
  options: CopyMonthOptions
): Promise<CopyMonthResult> {
  const supabase = await createClient()
  const dbTargetMonth = toDbMonth(options.targetMonth)

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

      if (hasIncome) {
        await supabase
          .from('incomes')
          .delete()
          .eq('month', dbTargetMonth)
      }
      if (hasExpense) {
        await supabase
          .from('expenses')
          .delete()
          .eq('month', dbTargetMonth)
      }
      if (options.includeCarryover) {
        await supabase
          .from('carryovers')
          .delete()
          .eq('month', dbTargetMonth)
      }
    }

    // スキップモードの場合、既存データのキーを取得
    let existingKeys: Record<string, Set<string>> = {
      income: new Set(),
      expense: new Set(),
    }

    if (options.mode === 'skip' && options.selectedItems.length > 0) {
      const [existingIncomes, existingExpenses] = await Promise.all([
        supabase
          .from('incomes')
          .select('label, person')
          .eq('month', dbTargetMonth),
        supabase
          .from('expenses')
          .select('label, person')
          .eq('month', dbTargetMonth),
      ])

      existingKeys = {
        income: new Set(
          (existingIncomes.data ?? []).map((d) => `${d.label}|${d.person}`)
        ),
        expense: new Set(
          (existingExpenses.data ?? []).map((d) => `${d.label}|${d.person}`)
        ),
      }
    }

    // 収入・支出の項目をコピー
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

    for (const item of options.selectedItems) {
      const key = `${item.label}|${item.person}`

      if (options.mode === 'skip' && existingKeys[item.type].has(key)) {
        if (item.type === 'income') result.skipped.incomes++
        else result.skipped.expenses++
        continue
      }

      // itemCopyModeに応じて金額を決定
      // labelOnlyの場合、DB制約(収入は正、支出は負)を満たす最小値を設定
      let amount: number
      if (item.itemCopyMode === 'labelOnly') {
        amount = item.type === 'income' ? 1 : -1
      } else {
        amount = item.amount
      }

      const newItem = {
        month: dbTargetMonth,
        label: item.label,
        amount,
        person: item.person,
      }

      if (item.type === 'income') {
        incomeItems.push(newItem)
        result.copied.incomes++
      } else {
        expenseItems.push(newItem)
        result.copied.expenses++
      }
    }

    if (incomeItems.length > 0) {
      const { error } = await supabase.from('incomes').insert(incomeItems)
      if (error) throw new Error(`収入の挿入に失敗: ${error.message}`)
    }

    if (expenseItems.length > 0) {
      const { error } = await supabase.from('expenses').insert(expenseItems)
      if (error) throw new Error(`支出の挿入に失敗: ${error.message}`)
    }

    // 繰越を一括コピー
    if (options.includeCarryover) {
      const carryoverResult = await copyCarryovers(
        supabase,
        options.sourceMonth,
        options.targetMonth,
        options.mode
      )
      result.copied.carryovers = carryoverResult.copied
      result.skipped.carryovers = carryoverResult.skipped
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
