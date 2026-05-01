'use client'

import { AnimatePresence, motion } from 'motion/react'
import { DeleteButton } from '@/components/ui/delete-button'
import { AddEntryModal } from '@/components/forms/add-entry-modal'
import { EditModal } from '@/components/forms/edit-modal'
import { LottiePlayer } from '@/components/animations/lottie-player'
import { listExit, listSpring } from '@/components/animations/tokens'
import { updateExpense, deleteExpense, toggleExpenseCarryover } from '@/app/actions/expense'
import { formatCurrency } from '@/lib/utils/format'
import type { Expense } from '@/types'

interface ExpenseSectionProps {
  expenses: Expense[]
  month: string
}

export function ExpenseSection({ expenses, month }: ExpenseSectionProps) {
  const carryoverExpenses = expenses.filter((e) => e.isCarryover)
  const actualTotal = expenses.filter((e) => !e.isCarryover).reduce((sum, e) => sum + e.amount, 0)

  return (
    <div data-section="expense">
      <div className="flex items-baseline justify-between pb-2 mb-1">
        <h3 className="text-[12px] font-bold tracking-[0.10em] uppercase">
          Expense / 支出
        </h3>
        <span className="text-[10px] text-sub-text font-tabular">
          {expenses.length}件{carryoverExpenses.length > 0 && ` — 繰越 ${carryoverExpenses.length}件`}
        </span>
      </div>

      <div className="rounded-[18px] bg-card shadow-soft overflow-hidden">
        <AnimatePresence initial={false}>
          {expenses.map((expense, i) => (
            <motion.div
              key={expense.id}
              data-testid="item-row"
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: expense.isCarryover ? 0.55 : 1, y: 0 }}
              exit={{ opacity: 0, x: -8, transition: listExit }}
              transition={listSpring}
              className={`group grid grid-cols-[32px_1fr_auto] gap-3 px-3.5 py-3 items-center ${
                i < expenses.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span
                className="w-7 h-7 rounded-full text-white text-[11px] font-bold inline-flex items-center justify-center shrink-0"
                style={{
                  background: expense.person === 'husband'
                    ? 'linear-gradient(135deg, oklch(0.65 0.16 250), oklch(0.55 0.18 260))'
                    : 'linear-gradient(135deg, oklch(0.75 0.16 350), oklch(0.65 0.18 20))',
                }}
              >
                {expense.person === 'husband' ? '夫' : '妻'}
              </span>
              <span className="text-sm font-medium truncate">
                {expense.label}
                {expense.isCarryover && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-sub-text font-bold">繰越</span>
                )}
              </span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-semibold font-tabular ${
                  expense.isCarryover ? 'text-muted-foreground' : 'text-neon-red'
                }`}>
                  {expense.isCarryover ? '' : '−'}{formatCurrency(expense.amount).replace('-', '').replace('¥', '¥')}
                </span>
                <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <form action={async () => {
                    await toggleExpenseCarryover(expense.id, !expense.isCarryover)
                  }}>
                    <button
                      type="submit"
                      className={`h-7 w-7 flex items-center justify-center rounded-full text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                        expense.isCarryover
                          ? 'text-accent bg-accent/10'
                          : 'text-muted-foreground hover:text-accent hover:bg-accent/10'
                      }`}
                      aria-label={expense.isCarryover ? `${expense.label}の繰越を解除` : `${expense.label}を繰越にする`}
                    >
                      {expense.isCarryover ? '↩' : '↪'}
                    </button>
                  </form>
                  <EditModal
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
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {expenses.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground animate-fade-in">
            <LottiePlayer
              src="/lottie/empty-box.json"
              className="w-12 h-12"
              ariaLabel="支出がありません"
            />
            <p className="text-xs">支出がありません</p>
          </div>
        )}

        <div className="border-t border-border bg-[var(--surface-total)] px-3.5 py-2.5">
          <AddEntryModal type="expense" month={month} />
        </div>

        <div className="flex items-baseline justify-between px-3.5 py-3 border-t border-border bg-[var(--surface-total)]">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-sub-text">
            Total
          </span>
          <span className="text-lg font-bold font-tabular tracking-[-0.01em] text-neon-red">
            −{formatCurrency(actualTotal).replace('-', '')}
          </span>
        </div>
      </div>
    </div>
  )
}
