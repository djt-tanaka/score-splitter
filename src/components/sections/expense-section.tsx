'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PersonBadge } from '@/components/ui/person-badge'
import { DeleteButton } from '@/components/ui/delete-button'
import { EntryForm } from '@/components/forms/entry-form'
import { EditDialog } from '@/components/forms/edit-dialog'
import { createExpense, updateExpense, deleteExpense } from '@/app/actions/expense'
import { formatCurrency } from '@/lib/utils/format'
import type { Expense } from '@/types'

interface ExpenseSectionProps {
  expenses: Expense[]
  month: string
}

export function ExpenseSection({ expenses, month }: ExpenseSectionProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card className="shadow-card card-interactive">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>支出</span>
          <span className="text-neon-red font-mono font-tabular">{formatCurrency(total)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between py-2.5 px-2 -mx-2 border-b last:border-0 rounded-lg transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <PersonBadge person={expense.person} />
                <span>{expense.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-neon-red font-mono font-tabular">
                  {formatCurrency(expense.amount)}
                </span>
                <EditDialog
                  id={expense.id}
                  month={month}
                  label={expense.label}
                  amount={expense.amount}
                  person={expense.person}
                  type="expense"
                  onUpdate={updateExpense}
                />
                <form action={async () => { await deleteExpense(expense.id) }}>
                  <DeleteButton label={`${expense.label}を削除`} />
                </form>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg opacity-50">+</span>
              </div>
              <p className="text-sm">支出がありません</p>
            </div>
          )}
        </div>
        <EntryForm type="expense" month={month} onSubmit={createExpense} />
      </CardContent>
    </Card>
  )
}
