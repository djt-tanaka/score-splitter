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
import { createCarryover, updateCarryover, deleteCarryover, toggleCarryoverCleared } from '@/app/actions/carryover'
import { formatCurrency } from '@/lib/utils/format'
import type { Carryover } from '@/types'

interface CarryoverSectionProps {
  carryovers: Carryover[]
  month: string
}

export function CarryoverSection({ carryovers, month }: CarryoverSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const clearedCarryovers = carryovers.filter((c) => c.isCleared)
  const unclearedCarryovers = carryovers.filter((c) => !c.isCleared)
  const total = carryovers.reduce((sum, c) => sum + c.amount, 0)
  const clearedTotal = clearedCarryovers.reduce((sum, c) => sum + c.amount, 0)

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
                <span>繰越</span>
                <span className="text-xs text-muted-foreground">
                  {clearedCarryovers.length > 0
                    ? `※清算済み ${clearedCarryovers.length}件 は精算に含まれます`
                    : '※精算額には含まれません'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {clearedCarryovers.length > 0 && (
                  <span className="text-xs text-neon-green font-mono font-tabular">
                    清算 {formatCurrency(clearedTotal)}
                  </span>
                )}
                <span className="text-muted-foreground font-mono font-tabular">{formatCurrency(total)}</span>
              </div>
            </CardTitle>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {carryovers.map((carryover) => (
                <div
                  key={carryover.id}
                  className={`flex items-center justify-between py-2.5 px-2 -mx-2 border-b last:border-0 rounded-lg transition-colors hover:bg-muted/30 ${
                    carryover.isCleared ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PersonBadge person={carryover.person} />
                    <span className={carryover.isCleared ? 'line-through' : ''}>
                      {carryover.label}
                    </span>
                    {carryover.isCleared && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green">
                        清算済
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`font-medium font-mono font-tabular ${
                      carryover.isCleared ? 'text-neon-green line-through' : 'text-muted-foreground'
                    }`}>
                      {formatCurrency(carryover.amount)}
                    </span>
                    <form action={async () => {
                      await toggleCarryoverCleared(carryover.id, !carryover.isCleared)
                    }}>
                      <button
                        type="submit"
                        className={`h-9 w-9 flex items-center justify-center rounded-lg text-xs transition-colors ${
                          carryover.isCleared
                            ? 'text-neon-green bg-neon-green/10'
                            : 'text-muted-foreground hover:text-neon-green hover:bg-neon-green/10'
                        }`}
                        aria-label={carryover.isCleared ? `${carryover.label}の清算を取消` : `${carryover.label}を清算する`}
                        title={carryover.isCleared ? '清算を取消' : '清算する'}
                      >
                        {carryover.isCleared ? '✓' : '○'}
                      </button>
                    </form>
                    <EditDialog
                      id={carryover.id}
                      month={month}
                      label={carryover.label}
                      amount={carryover.amount}
                      person={carryover.person}
                      type="carryover"
                      isCleared={carryover.isCleared}
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
