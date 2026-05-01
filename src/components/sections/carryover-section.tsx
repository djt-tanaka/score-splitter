'use client'

import { AnimatePresence, motion } from 'motion/react'
import { DeleteButton } from '@/components/ui/delete-button'
import { AddEntryModal } from '@/components/forms/add-entry-modal'
import { EditModal } from '@/components/forms/edit-modal'
import { LottiePlayer } from '@/components/animations/lottie-player'
import { listExit, listSpring } from '@/components/animations/tokens'
import { updateCarryover, deleteCarryover, toggleCarryoverCleared } from '@/app/actions/carryover'
import { formatCurrency } from '@/lib/utils/format'
import type { Carryover } from '@/types'

interface CarryoverSectionProps {
  carryovers: Carryover[]
  month: string
}

export function CarryoverSection({ carryovers, month }: CarryoverSectionProps) {
  const clearedCarryovers = carryovers.filter((c) => c.isCleared)
  const total = carryovers.reduce((sum, c) => sum + Math.abs(c.amount), 0)

  return (
    <section data-section="carryover">
      <div className="flex items-baseline justify-between pb-2 mb-1">
        <h3
          data-testid="carryover-title"
          className="text-[12px] font-bold tracking-[0.10em] uppercase"
        >
          Carryover / 繰越
        </h3>
        <span className="text-[10px] text-sub-text font-tabular">
          合計 {formatCurrency(total)}{clearedCarryovers.length > 0 && ` / 清算済み ${clearedCarryovers.length}件`}
        </span>
      </div>

      <div className="rounded-[18px] bg-card shadow-soft overflow-hidden">
        <AnimatePresence initial={false}>
          {carryovers.map((carryover, i) => (
            <motion.div
              key={carryover.id}
              data-testid="item-row"
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: carryover.isCleared ? 0.6 : 1, y: 0 }}
              exit={{ opacity: 0, x: -8, transition: listExit }}
              transition={listSpring}
              className={`group grid grid-cols-[32px_1fr_auto] gap-3 px-3.5 py-3 items-center ${
                i < carryovers.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <span
                className="w-7 h-7 rounded-full text-white text-[11px] font-bold inline-flex items-center justify-center shrink-0"
                style={{
                  background: carryover.person === 'husband'
                    ? 'linear-gradient(135deg, oklch(0.65 0.16 250), oklch(0.55 0.18 260))'
                    : 'linear-gradient(135deg, oklch(0.75 0.16 350), oklch(0.65 0.18 20))',
                }}
              >
                {carryover.person === 'husband' ? '夫' : '妻'}
              </span>
              <span className={`text-sm font-medium truncate ${carryover.isCleared ? 'line-through opacity-60' : ''}`}>
                {carryover.label}
                {carryover.isCleared && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-neon-green/10 text-neon-green font-bold no-underline inline-block">
                    清算済
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-semibold font-tabular ${
                  carryover.isCleared ? 'text-neon-green line-through' : 'text-sub-text'
                }`}>
                  {formatCurrency(Math.abs(carryover.amount))}
                </span>
                <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <form action={async () => {
                    await toggleCarryoverCleared(carryover.id, !carryover.isCleared)
                  }}>
                    <button
                      type="submit"
                      className={`h-7 w-7 flex items-center justify-center rounded-full text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                        carryover.isCleared
                          ? 'text-neon-green bg-neon-green/10'
                          : 'text-muted-foreground hover:text-neon-green hover:bg-neon-green/10'
                      }`}
                      aria-label={carryover.isCleared ? `${carryover.label}の清算を取消` : `${carryover.label}を清算する`}
                    >
                      {carryover.isCleared ? '✓' : '○'}
                    </button>
                  </form>
                  <EditModal
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
            </motion.div>
          ))}
        </AnimatePresence>

        {carryovers.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground animate-fade-in">
            <LottiePlayer
              src="/lottie/empty-box.json"
              className="w-12 h-12"
              ariaLabel="繰越がありません"
            />
            <p className="text-xs">繰越がありません</p>
          </div>
        )}

        <div className="border-t border-border bg-[var(--surface-total)] px-3.5 py-2.5">
          <AddEntryModal type="carryover" month={month} />
        </div>
      </div>
    </section>
  )
}
