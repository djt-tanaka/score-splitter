import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { MonthToolbar } from '@/components/layout/month-toolbar'
import { IncomeSection } from '@/components/sections/income-section'
import { ExpenseSection } from '@/components/sections/expense-section'
import { CarryoverSection } from '@/components/sections/carryover-section'
import { CalculationSection } from '@/components/sections/calculation-section'
import { MonthlyListSection } from '@/components/sections/monthly-list-section'
import { AddEntryFab } from '@/components/features/add-entry-fab'
import { getIncomesByMonth } from '@/app/actions/income'
import { getExpensesByMonth } from '@/app/actions/expense'
import { getCarryoversByMonth } from '@/app/actions/carryover'
import { getMonthlySummaries } from '@/app/actions/monthly-summary'
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
          className="container mx-auto px-4 py-4 space-y-0 max-w-4xl"
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
      <Header currentMonth={month} />
      <main id="main" tabIndex={-1} className="container mx-auto px-4 py-4 space-y-0 max-w-4xl">
        <MonthToolbar currentMonth={month} incomes={incomes} expenses={expenses} carryovers={carryovers} />
        <CalculationSection
          incomes={incomes}
          expenses={expenses}
          carryovers={carryovers}
          currentMonth={month}
          recentSummaries={recentSummaries}
        />
        <section className="py-8 md:py-10 md:px-6 grid gap-8 md:gap-16 md:grid-cols-2">
          <IncomeSection incomes={incomes} month={month} />
          <ExpenseSection expenses={expenses} month={month} />
        </section>
        <CarryoverSection carryovers={carryovers} month={month} />
      </main>
      <AddEntryFab month={month} />
    </div>
  )
}
