'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { DeleteButton } from '@/components/ui/delete-button'
import { EntryForm } from '@/components/forms/entry-form'
import { EditDialog } from '@/components/forms/edit-dialog'
import { LottiePlayer } from '@/components/animations/lottie-player'
import { listExit, listSpring } from '@/components/animations/tokens'
import { createIncome, updateIncome, deleteIncome } from '@/app/actions/income'
import { formatCurrency } from '@/lib/utils/format'
import type { Income } from '@/types'

interface IncomeSectionProps {
  incomes: Income[]
  month: string
}

export function IncomeSection({ incomes, month }: IncomeSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const total = incomes.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div data-section="income">
      <div className="flex items-baseline justify-between border-b border-foreground pb-2.5 mb-1">
        <h3 className="text-[11px] md:text-sm font-bold tracking-[0.16em] uppercase">
          Income / 収入
        </h3>
        <span className="text-[10px] md:text-xs text-sub-text font-tabular">
          {incomes.length}件
        </span>
      </div>

      <div>
        <AnimatePresence initial={false}>
          {incomes.map((income) => (
            <motion.div
              key={income.id}
              data-testid="item-row"
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8, transition: listExit }}
              transition={listSpring}
              className="group grid grid-cols-[24px_1fr_auto] gap-3 py-3 border-b border-border items-baseline"
            >
              <span className="text-[10px] font-bold text-husband group-[:nth-child(odd)]:text-husband group-[:nth-child(even)]:text-wife"
                style={{ color: `var(--${income.person})` }}
              >
                {income.person === 'husband' ? '夫' : '妻'}
              </span>
              <span className="text-sm md:text-base font-medium truncate">{income.label}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm md:text-base font-semibold font-tabular text-neon-green">
                  +{formatCurrency(income.amount).slice(1)}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EditDialog
                    id={income.id}
                    month={month}
                    label={income.label}
                    amount={income.amount}
                    person={income.person}
                    type="income"
                    onUpdate={updateIncome}
                  />
                  <form action={async () => { await deleteIncome(income.id) }}>
                    <DeleteButton label={`${income.label}を削除`} />
                  </form>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {incomes.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground animate-fade-in">
            <LottiePlayer
              src="/lottie/empty-box.json"
              className="w-12 h-12"
              ariaLabel="収入がありません"
            />
            <p className="text-xs">収入がありません</p>
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
        <div className="pt-3">
          <EntryForm type="income" month={month} onSubmit={createIncome} />
        </div>
      )}

      <div className="flex items-baseline justify-between pt-4 border-t-2 border-foreground">
        <span className="text-[10px] md:text-[11px] font-bold tracking-[0.16em] uppercase text-sub-text">
          Total
        </span>
        <span className="text-xl md:text-[28px] font-bold font-tabular tracking-[-0.02em] text-neon-green">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  )
}
