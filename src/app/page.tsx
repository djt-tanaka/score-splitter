import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { HeroSection } from '@/components/sections/hero-section'
import { TrendCard } from '@/components/charts/trend-card'
import { IncomeSection } from '@/components/sections/income-section'
import { ExpenseSection } from '@/components/sections/expense-section'
import { CarryoverSection } from '@/components/sections/carryover-section'
import { MonthlyListSection } from '@/components/sections/monthly-list-section'
import { getIncomesByMonth } from '@/app/actions/income'
import { getExpensesByMonth } from '@/app/actions/expense'
import { getCarryoversByMonth } from '@/app/actions/carryover'
import { getMonthlySummaries } from '@/app/actions/monthly-summary'
import { AddEntryFab } from '@/components/features/add-entry-fab'
import { isValidMonth } from '@/lib/utils/format'

interface HomeProps {
  searchParams: Promise<{ month?: string }>
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams

  if (params.month !== undefined && !isValidMonth(params.month)) {
    redirect('/')
  }

  if (!params.month) {
    const summariesResult = await getMonthlySummaries()
    if (!summariesResult.success) {
      throw new Error(summariesResult.error ?? '月別サマリーの取得に失敗しました')
    }
    const summaries = summariesResult.data ?? []

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main
          id="main"
          tabIndex={-1}
          className="px-5 py-5 space-y-6 max-w-4xl mx-auto"
        >
          <MonthlyListSection summaries={summaries} />
        </main>
      </div>
    )
  }

  const month = params.month
  const [incomesResult, expensesResult, carryoversResult, summariesResult] = await Promise.all([
    getIncomesByMonth(month),
    getExpensesByMonth(month),
    getCarryoversByMonth(month),
    getMonthlySummaries(),
  ])

  if (!incomesResult.success || !expensesResult.success || !carryoversResult.success) {
    throw new Error(
      incomesResult.error ?? expensesResult.error ?? carryoversResult.error ?? 'データの取得に失敗しました'
    )
  }

  const incomes = incomesResult.data ?? []
  const expenses = expensesResult.data ?? []
  const carryovers = carryoversResult.data ?? []
  const allSummaries = summariesResult.success ? (summariesResult.data ?? []) : []
  const recentSummaries = allSummaries.slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        currentMonth={month}
        incomes={incomes}
        expenses={expenses}
        carryovers={carryovers}
        recentSummaries={recentSummaries}
      />
      <main id="main" tabIndex={-1} className="px-5 pt-2 pb-8 space-y-4 max-w-4xl mx-auto">
        <TrendCard summaries={recentSummaries} currentMonth={month} />
        <IncomeSection incomes={incomes} month={month} />
        <ExpenseSection expenses={expenses} month={month} />
        <CarryoverSection carryovers={carryovers} month={month} />
      </main>
      <AddEntryFab month={month} />
    </div>
  )
}
