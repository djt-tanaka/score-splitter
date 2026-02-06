'use client'

import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PersonBadge } from '@/components/ui/person-badge'
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
    <Card className="glow-sm">
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
              className="flex items-center justify-between py-2 border-b last:border-0"
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
          {incomes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              収入がありません
            </p>
          )}
        </div>
        <EntryForm type="income" month={month} onSubmit={createIncome} />
      </CardContent>
    </Card>
  )
}
