import { Header } from '@/components/layout/header'
import { MonthSelector } from '@/components/layout/month-selector'
import { IncomeSection } from '@/components/sections/income-section'
import { ExpenseSection } from '@/components/sections/expense-section'
import { CarryoverSection } from '@/components/sections/carryover-section'
import { CalculationSection } from '@/components/sections/calculation-section'
import { getIncomesByMonth } from '@/app/actions/income'
import { getExpensesByMonth } from '@/app/actions/expense'
import { getCarryoversByMonth } from '@/app/actions/carryover'
import { parseMonth } from '@/lib/utils/format'

interface HomeProps {
  searchParams: Promise<{ month?: string }>
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams
  const month = params.month ?? parseMonth(new Date())

  const [incomes, expenses, carryovers] = await Promise.all([
    getIncomesByMonth(month),
    getExpensesByMonth(month),
    getCarryoversByMonth(month),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
        <MonthSelector currentMonth={month} />
        <CalculationSection incomes={incomes} expenses={expenses} />
        <div className="grid gap-6 md:grid-cols-2">
          <IncomeSection incomes={incomes} month={month} />
          <ExpenseSection expenses={expenses} month={month} />
        </div>
        <CarryoverSection carryovers={carryovers} month={month} />
      </main>
    </div>
  )
}
