'use client'

import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PersonBadge } from '@/components/ui/person-badge'
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
    <Card className="glow-sm">
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
              className="flex items-center justify-between py-2 border-b last:border-0"
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
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              支出がありません
            </p>
          )}
        </div>
        <EntryForm type="expense" month={month} onSubmit={createExpense} />
      </CardContent>
    </Card>
  )
}
