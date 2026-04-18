'use server'

// 単一世帯前提: household_session Cookie + middleware で認証境界を担保している。
// 将来マルチテナント化する際は世帯IDによるスコープ条件を追加すること。
import { createClient } from '@/lib/supabase/server'
import { aggregateMonthlySummaries } from '@/lib/utils/monthly-summary'
import type { ActionResult, MonthlySummary, MonthlyAmountRow } from '@/types'

export async function getMonthlySummaries(): Promise<
  ActionResult<MonthlySummary[]>
> {
  const supabase = await createClient()
  const [incomesResult, expensesResult] = await Promise.all([
    supabase.from('incomes').select('month, amount'),
    supabase.from('expenses').select('month, amount'),
  ])

  if (incomesResult.error) {
    console.error('月別収入取得エラー:', incomesResult.error)
    return { success: false, error: '月別サマリーの取得に失敗しました' }
  }
  if (expensesResult.error) {
    console.error('月別支出取得エラー:', expensesResult.error)
    return { success: false, error: '月別サマリーの取得に失敗しました' }
  }

  const incomes: MonthlyAmountRow[] = (incomesResult.data ?? []).map((row) => ({
    month: row.month,
    amount: row.amount,
  }))
  const expenses: MonthlyAmountRow[] = (expensesResult.data ?? []).map(
    (row) => ({ month: row.month, amount: row.amount })
  )

  return {
    success: true,
    data: aggregateMonthlySummaries(incomes, expenses),
  }
}
