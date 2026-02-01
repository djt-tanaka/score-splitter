'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  CopyMonthOptions,
  CopyMonthResult,
  CopyMonthPreview,
} from '@/types'

/**
 * コピー操作のプレビューを取得
 * コピー元とコピー先のデータ件数を返す
 */
export async function getCopyMonthPreview(
  sourceMonth: string,
  targetMonth: string
): Promise<CopyMonthPreview> {
  const supabase = await createClient()

  const [
    sourceIncomes,
    sourceExpenses,
    sourceCarryovers,
    existingIncomes,
    existingExpenses,
    existingCarryovers,
  ] = await Promise.all([
    supabase
      .from('incomes')
      .select('*', { count: 'exact', head: true })
      .eq('month', sourceMonth),
    supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true })
      .eq('month', sourceMonth),
    supabase
      .from('carryovers')
      .select('*', { count: 'exact', head: true })
      .eq('month', sourceMonth),
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
  ])

  return {
    sourceMonth,
    targetMonth,
    source: {
      incomes: sourceIncomes.count ?? 0,
      expenses: sourceExpenses.count ?? 0,
      carryovers: sourceCarryovers.count ?? 0,
    },
    existing: {
      incomes: existingIncomes.count ?? 0,
      expenses: existingExpenses.count ?? 0,
      carryovers: existingCarryovers.count ?? 0,
    },
  }
}

/**
 * テーブル単位のコピー処理
 */
async function copyTable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: 'incomes' | 'expenses' | 'carryovers',
  sourceMonth: string,
  targetMonth: string,
  mode: 'add' | 'skip' | 'replace'
): Promise<{ copied: number; skipped: number }> {
  // コピー元データを取得
  const { data: sourceData, error } = await supabase
    .from(table)
    .select('label, amount, person')
    .eq('month', sourceMonth)

  if (error || !sourceData) {
    throw new Error(`${table}の取得に失敗しました`)
  }

  let copied = 0
  let skipped = 0

  // スキップモードの場合、既存データのキーを取得
  let existingKeys = new Set<string>()
  if (mode === 'skip') {
    const { data: existingData } = await supabase
      .from(table)
      .select('label, person')
      .eq('month', targetMonth)

    existingKeys = new Set(
      (existingData ?? []).map((d) => `${d.label}|${d.person}`)
    )
  }

  // バッチ挿入用の配列
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
      month: targetMonth,
      label: item.label,
      amount: item.amount,
      person: item.person,
    })
    copied++
  }

  // まとめて挿入
  if (itemsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from(table)
      .insert(itemsToInsert)

    if (insertError) {
      throw new Error(`${table}の挿入に失敗しました: ${insertError.message}`)
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

  const result: CopyMonthResult = {
    success: true,
    copied: { incomes: 0, expenses: 0, carryovers: 0 },
    skipped: { incomes: 0, expenses: 0, carryovers: 0 },
  }

  try {
    // 置換モードの場合、先に既存データを削除
    if (options.mode === 'replace') {
      if (options.includeIncome) {
        await supabase
          .from('incomes')
          .delete()
          .eq('month', options.targetMonth)
      }
      if (options.includeExpense) {
        await supabase
          .from('expenses')
          .delete()
          .eq('month', options.targetMonth)
      }
      if (options.includeCarryover) {
        await supabase
          .from('carryovers')
          .delete()
          .eq('month', options.targetMonth)
      }
    }

    // 各データタイプのコピー処理
    if (options.includeIncome) {
      const copyResult = await copyTable(
        supabase,
        'incomes',
        options.sourceMonth,
        options.targetMonth,
        options.mode
      )
      result.copied.incomes = copyResult.copied
      result.skipped.incomes = copyResult.skipped
    }

    if (options.includeExpense) {
      const copyResult = await copyTable(
        supabase,
        'expenses',
        options.sourceMonth,
        options.targetMonth,
        options.mode
      )
      result.copied.expenses = copyResult.copied
      result.skipped.expenses = copyResult.skipped
    }

    if (options.includeCarryover) {
      const copyResult = await copyTable(
        supabase,
        'carryovers',
        options.sourceMonth,
        options.targetMonth,
        options.mode
      )
      result.copied.carryovers = copyResult.copied
      result.skipped.carryovers = copyResult.skipped
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
