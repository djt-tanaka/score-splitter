'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PersonBadge } from '@/components/ui/person-badge'
import { DeleteButton } from '@/components/ui/delete-button'
import { EntryForm } from '@/components/forms/entry-form'
import { EditDialog } from '@/components/forms/edit-dialog'
import { LottiePlayer } from '@/components/animations/lottie-player'
import { listExit, listSpring } from '@/components/animations/tokens'
import { createExpense, updateExpense, deleteExpense, toggleExpenseCarryover } from '@/app/actions/expense'
import { formatCurrency } from '@/lib/utils/format'
import type { Expense } from '@/types'

interface ExpenseSectionProps {
  expenses: Expense[]
  month: string
}

export function ExpenseSection({ expenses, month }: ExpenseSectionProps) {
  const actualExpenses = expenses.filter((e) => !e.isCarryover)
  const carryoverExpenses = expenses.filter((e) => e.isCarryover)
  const actualTotal = actualExpenses.reduce((sum, e) => sum + e.amount, 0)
  const carryoverTotal = carryoverExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card className="shadow-card card-interactive">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>支出</span>
          <div className="flex items-center gap-2">
            {carryoverExpenses.length > 0 && (
              <span className="text-xs text-muted-foreground font-mono font-tabular">
                繰越 {formatCurrency(carryoverTotal)}
              </span>
            )}
            <span className="text-neon-red font-mono font-tabular">{formatCurrency(actualTotal)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {expenses.map((expense) => (
              <motion.div
                key={expense.id}
                data-testid="item-row"
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: expense.isCarryover ? 0.6 : 1, y: 0 }}
                exit={{ opacity: 0, x: -8, transition: listExit }}
                transition={listSpring}
                className="py-2 px-2 -mx-2 border-b last:border-0 rounded-lg transition-colors hover:bg-muted/30"
              >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <PersonBadge person={expense.person} />
                  <span className="truncate">{expense.label}</span>
                  {expense.isCarryover && (
                    <span className="text-xs px-1 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                      繰越
                    </span>
                  )}
                </div>
                <span className={`font-medium font-mono font-tabular shrink-0 ml-2 ${expense.isCarryover ? 'text-muted-foreground' : 'text-neon-red'}`}>
                  {formatCurrency(expense.amount)}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1 mt-1">
                <form action={async () => {
                  await toggleExpenseCarryover(expense.id, !expense.isCarryover)
                }}>
                  <button
                    type="submit"
                    className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                      expense.isCarryover
                        ? 'text-accent bg-accent/10'
                        : 'text-muted-foreground hover:text-accent hover:bg-accent/10'
                    }`}
                    aria-label={expense.isCarryover ? `${expense.label}の繰越を解除` : `${expense.label}を繰越にする`}
                    title={expense.isCarryover ? '繰越を解除' : '繰越にする'}
                  >
                    {expense.isCarryover ? '↩' : '↪'}
                  </button>
                </form>
                <EditDialog
                  id={expense.id}
                  month={month}
                  label={expense.label}
                  amount={expense.amount}
                  person={expense.person}
                  type="expense"
                  isCarryover={expense.isCarryover}
                  onUpdate={updateExpense}
                />
                <form action={async () => { await deleteExpense(expense.id) }}>
                  <DeleteButton label={`${expense.label}を削除`} />
                </form>
              </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {expenses.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground animate-fade-in">
              <LottiePlayer
                src="/lottie/empty-box.json"
                className="w-16 h-16"
                ariaLabel="支出がありません"
              />
              <p className="text-sm">支出がありません</p>
            </div>
          )}
        </div>
        <EntryForm type="expense" month={month} onSubmit={createExpense} />
      </CardContent>
    </Card>
  )
}
