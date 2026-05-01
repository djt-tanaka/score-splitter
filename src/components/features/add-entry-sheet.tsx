'use client'

import { useState, useRef } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { createIncome } from '@/app/actions/income'
import { createExpense } from '@/app/actions/expense'
import { createCarryover } from '@/app/actions/carryover'

type EntryType = 'income' | 'expense' | 'carryover'
type Person = 'husband' | 'wife'

interface AddEntrySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  month: string
}

const typeConfig = {
  income: {
    label: '収入',
    bg: 'oklch(0.45 0.18 155 / 12%)',
    fg: 'oklch(0.42 0.18 155)',
    border: 'oklch(0.45 0.18 155 / 30%)',
  },
  expense: {
    label: '支出',
    bg: 'oklch(0.50 0.20 25 / 12%)',
    fg: 'oklch(0.50 0.20 25)',
    border: 'oklch(0.50 0.20 25 / 30%)',
  },
  carryover: {
    label: '繰越',
    bg: 'oklch(0.50 0.16 195 / 12%)',
    fg: 'oklch(0.45 0.16 195)',
    border: 'oklch(0.50 0.16 195 / 30%)',
  },
} as const

export function AddEntrySheet({ open, onOpenChange, month }: AddEntrySheetProps) {
  const [entryType, setEntryType] = useState<EntryType>('expense')
  const [person, setPerson] = useState<Person>('husband')
  const [isCarryover, setIsCarryover] = useState(false)
  const [isCleared, setIsCleared] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSubmitting(true)

    formData.set('month', month)
    formData.set('person', person)

    try {
      let result
      if (entryType === 'income') {
        result = await createIncome(formData)
      } else if (entryType === 'expense') {
        formData.set('is_carryover', String(isCarryover))
        result = await createExpense(formData)
      } else {
        formData.set('is_cleared', String(isCleared))
        result = await createCarryover(formData)
      }

      if (result && !result.success) {
        setError(result.error ?? '追加に失敗しました')
        return
      }

      formRef.current?.reset()
      setIsCarryover(false)
      setIsCleared(false)
      onOpenChange(false)
    } catch {
      setError('追加に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-[20px] pb-safe">
        <DrawerHeader className="flex flex-row items-center justify-between px-4 py-2">
          <DrawerClose className="text-sm font-semibold text-sub-text">
            キャンセル
          </DrawerClose>
          <DrawerTitle className="text-base font-bold">
            項目を追加
          </DrawerTitle>
          <button
            type="submit"
            form="add-entry-form"
            disabled={submitting}
            className="text-sm font-bold text-neon-cyan disabled:opacity-50"
          >
            保存
          </button>
        </DrawerHeader>

        {/* タイプタブ */}
        <div className="flex gap-1 px-4 pb-3">
          {(['income', 'expense', 'carryover'] as const).map((t) => {
            const active = entryType === t
            const cfg = typeConfig[t]
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setEntryType(t)
                  setIsCarryover(false)
                  setIsCleared(false)
                }}
                className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold text-center transition-colors"
                style={{
                  background: active ? cfg.bg : 'var(--muted)',
                  color: active ? cfg.fg : 'var(--sub-text)',
                  border: active ? `1px solid ${cfg.border}` : '1px solid transparent',
                }}
              >
                {cfg.label}
              </button>
            )
          })}
        </div>

        {/* フォーム */}
        <form
          id="add-entry-form"
          ref={formRef}
          action={handleSubmit}
          className="flex flex-col gap-3 px-4 pb-4"
        >
          <div>
            <label className="text-[11px] font-bold tracking-[0.16em] uppercase text-sub-text mb-1.5 block">
              項目名
            </label>
            <Input
              name="label"
              placeholder="例：食費、家賃、給与"
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-[0.16em] uppercase text-sub-text mb-1.5 block">
              金額
            </label>
            <Input
              name="amount"
              type="number"
              inputMode="numeric"
              placeholder="¥ 0"
              className="h-14 rounded-xl text-[28px] font-bold text-right font-tabular tracking-[-0.02em]"
              min={1}
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold tracking-[0.16em] uppercase text-sub-text mb-1.5 block">
              担当者
            </label>
            <div className="flex gap-2">
              {(['husband', 'wife'] as const).map((p) => {
                const active = person === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPerson(p)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-colors"
                    style={{
                      background: active
                        ? `var(--${p}-light)`
                        : 'var(--card)',
                      color: active
                        ? `var(--${p})`
                        : 'var(--sub-text)',
                      border: active
                        ? `1.5px solid var(--${p})`
                        : '1px solid var(--border)',
                    }}
                  >
                    {p === 'husband' ? '夫' : '妻'}
                  </button>
                )
              })}
            </div>
          </div>

          {entryType === 'expense' && (
            <div
              className="flex items-center justify-between py-3 px-3.5 rounded-xl border border-border bg-card"
            >
              <div>
                <div className="text-sm font-semibold">繰越扱いにする</div>
                <div className="text-[11px] text-sub-text mt-0.5">精算には含めず翌月へ</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isCarryover}
                onClick={() => setIsCarryover(!isCarryover)}
                className="relative w-11 h-[26px] rounded-full transition-colors"
                style={{ background: isCarryover ? 'var(--neon-cyan)' : 'oklch(0.85 0.01 260)' }}
              >
                <span
                  className="absolute top-[2px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-[left]"
                  style={{ left: isCarryover ? 20 : 2 }}
                />
              </button>
            </div>
          )}

          {entryType === 'carryover' && (
            <div
              className="flex items-center justify-between py-3 px-3.5 rounded-xl border border-border bg-card"
            >
              <div>
                <div className="text-sm font-semibold">今月で清算する</div>
                <div className="text-[11px] text-sub-text mt-0.5">精算に含める</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isCleared}
                onClick={() => setIsCleared(!isCleared)}
                className="relative w-11 h-[26px] rounded-full transition-colors"
                style={{ background: isCleared ? 'var(--neon-cyan)' : 'oklch(0.85 0.01 260)' }}
              >
                <span
                  className="absolute top-[2px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-[left]"
                  style={{ left: isCleared ? 20 : 2 }}
                />
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-neon-red">{error}</p>
          )}
        </form>

        <div className="px-4 pb-4">
          <button
            type="submit"
            form="add-entry-form"
            disabled={submitting}
            className="w-full py-4 bg-foreground text-background rounded-xl text-[15px] font-bold text-center disabled:opacity-50 transition-opacity"
          >
            {submitting ? '追加中...' : `${typeConfig[entryType].label}を追加`}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
