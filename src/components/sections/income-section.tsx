'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PersonBadge } from '@/components/ui/person-badge'
import { DeleteButton } from '@/components/ui/delete-button'
import { EntryForm } from '@/components/forms/entry-form'
import { EditDialog } from '@/components/forms/edit-dialog'
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
          {incomes.map((income) => (
            <div
              key={income.id}
              className="flex items-center justify-between py-2.5 px-2 -mx-2 border-b last:border-0 rounded-lg transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <PersonBadge person={income.person} />
                <span>{income.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium font-mono font-tabular">
                  {formatCurrency(income.amount)}
                </span>
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
          ))}
          {incomes.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg opacity-50">+</span>
              </div>
              <p className="text-sm">収入がありません</p>
            </div>
          )}
        </div>
        <EntryForm type="income" month={month} onSubmit={createIncome} />
      </CardContent>
    </Card>
  )
}
