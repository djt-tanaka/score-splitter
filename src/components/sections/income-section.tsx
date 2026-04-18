'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PersonBadge } from '@/components/ui/person-badge'
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
  const total = incomes.reduce((sum, i) => sum + i.amount, 0)

  return (
    <Card className="shadow-card card-interactive">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>収入</span>
          <span className="text-neon-green font-mono font-tabular">{formatCurrency(total)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
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
                className="py-2 px-2 -mx-2 border-b last:border-0 rounded-lg transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <PersonBadge person={income.person} />
                    <span className="truncate">{income.label}</span>
                  </div>
                  <span className="font-medium font-mono font-tabular shrink-0 ml-2">
                    {formatCurrency(income.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-1">
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
              </motion.div>
            ))}
          </AnimatePresence>
          {incomes.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground animate-fade-in">
              <LottiePlayer
                src="/lottie/empty-box.json"
                className="w-16 h-16"
                ariaLabel="収入がありません"
              />
              <p className="text-sm">収入がありません</p>
            </div>
          )}
        </div>
        <EntryForm type="income" month={month} onSubmit={createIncome} />
      </CardContent>
    </Card>
  )
}
