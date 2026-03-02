'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { PersonBadge } from '@/components/ui/person-badge'
import { DeleteButton } from '@/components/ui/delete-button'
import { EntryForm } from '@/components/forms/entry-form'
import { EditDialog } from '@/components/forms/edit-dialog'
import { createCarryover, updateCarryover, deleteCarryover } from '@/app/actions/carryover'
import { formatCurrency } from '@/lib/utils/format'
import type { Carryover } from '@/types'

interface CarryoverSectionProps {
  carryovers: Carryover[]
  month: string
}

export function CarryoverSection({ carryovers, month }: CarryoverSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const total = carryovers.reduce((sum, c) => sum + c.amount, 0)

  return (
    <Card className="shadow-card card-interactive">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <CardTitle className="flex justify-between items-center cursor-pointer hover:bg-muted/50 -mx-6 -my-4 px-6 py-4 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>繰越（参照用）</span>
                <span className="text-xs text-muted-foreground">
                  ※精算額には含まれません
                </span>
              </div>
              <span className="text-muted-foreground font-mono font-tabular">{formatCurrency(total)}</span>
            </CardTitle>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {carryovers.map((carryover) => (
                <div
                  key={carryover.id}
                  className="flex items-center justify-between py-2.5 px-2 -mx-2 border-b last:border-0 rounded-lg transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <PersonBadge person={carryover.person} />
                    <span>{carryover.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-muted-foreground font-mono font-tabular">
                      {formatCurrency(carryover.amount)}
                    </span>
                    <EditDialog
                      id={carryover.id}
                      month={month}
                      label={carryover.label}
                      amount={carryover.amount}
                      person={carryover.person}
                      type="carryover"
                      onUpdate={updateCarryover}
                    />
                    <form action={async () => { await deleteCarryover(carryover.id) }}>
                      <DeleteButton label={`${carryover.label}を削除`} />
                    </form>
                  </div>
                </div>
              ))}
              {carryovers.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg opacity-50">+</span>
                  </div>
                  <p className="text-sm">繰越がありません</p>
                </div>
              )}
            </div>
            <EntryForm
              type="carryover"
              month={month}
              onSubmit={createCarryover}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
