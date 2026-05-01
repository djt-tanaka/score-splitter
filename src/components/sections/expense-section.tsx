'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
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
  const [showForm, setShowForm] = useState(false)
  const carryoverExpenses = expenses.filter((e) => e.isCarryover)
  const actualTotal = expenses.filter((e) => !e.isCarryover).reduce((sum, e) => sum + e.amount, 0)

  return (
    <div data-section="expense">
      <div className="flex items-baseline justify-between border-b border-foreground pb-2.5 mb-1">
        <h3 className="text-[11px] md:text-sm font-bold tracking-[0.16em] uppercase">
          Expense / 支出
        </h3>
        <span className="text-[10px] md:text-xs text-sub-text font-tabular">
          {expenses.length}件{carryoverExpenses.length > 0 && ` — 繰越 ${carryoverExpenses.length}件`}
        </span>
      </div>

      <div>
        <AnimatePresence initial={false}>
          {expenses.map((expense) => (
            <motion.div
              key={expense.id}
              data-testid="item-row"
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: expense.isCarryover ? 0.5 : 1, y: 0 }}
              exit={{ opacity: 0, x: -8, transition: listExit }}
              transition={listSpring}
              className="group grid grid-cols-[24px_1fr_auto] gap-3 py-3 border-b border-border items-baseline"
            >
              <span className="text-[10px] font-bold"
                style={{ color: `var(--${expense.person})` }}
              >
                {expense.person === 'husband' ? '夫' : '妻'}
              </span>
              <span className="text-sm md:text-base font-medium truncate">
                {expense.label}
                {expense.isCarryover && (
                  <span className="ml-2 text-[10px] text-sub-text">繰越</span>
                )}
              </span>
              <div className="flex items-center gap-1">
                <span className={`text-sm md:text-base font-semibold font-tabular ${
                  expense.isCarryover ? 'text-muted-foreground' : 'text-neon-red'
                }`}>
                  {expense.isCarryover ? '' : '−'}{formatCurrency(expense.amount).replace('-', '').replace('¥', '¥')}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <form action={async () => {
                    await toggleExpenseCarryover(expense.id, !expense.isCarryover)
                  }}>
                    <button
                      type="submit"
                      className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                        expense.isCarryover
                          ? 'text-accent bg-accent/10'
                          : 'text-muted-foreground hover:text-accent hover:bg-accent/10'
                      }`}
                      aria-label={expense.isCarryover ? `${expense.label}の繰越を解除` : `${expense.label}を繰越にする`}
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
      </div>

      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 py-3 text-sm text-sub-text hover:text-foreground transition-colors"
        >
          + 項目を追加
        </button>
      )}

      {showForm && (
        <div className="pt-1">
          <EntryForm type="expense" month={month} onSubmit={createExpense} />
        </div>
      )}

      <div className="flex items-baseline justify-between pt-4 border-t-2 border-foreground">
        <span className="text-[10px] md:text-[11px] font-bold tracking-[0.16em] uppercase text-sub-text">
          Total
        </span>
        <span className="text-xl md:text-[28px] font-bold font-tabular tracking-[-0.02em] text-neon-red">
          −{formatCurrency(actualTotal).replace('-', '')}
        </span>
      </div>
    </div>
  )
}
