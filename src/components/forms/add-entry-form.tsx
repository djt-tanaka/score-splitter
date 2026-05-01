'use client'

import { useState, useRef, useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/ui/submit-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createIncome } from '@/app/actions/income'
import { createExpense } from '@/app/actions/expense'
import { createCarryover } from '@/app/actions/carryover'

interface AddEntryFormProps {
  type: 'income' | 'expense' | 'carryover'
  month: string
  onSuccess: () => void
  onCancel: () => void
}

const typeLabels = {
  income: '収入',
  expense: '支出',
  carryover: '繰越',
}

const createActions = {
  income: createIncome,
  expense: createExpense,
  carryover: createCarryover,
}

export function AddEntryForm({ type, month, onSuccess, onCancel }: AddEntryFormProps) {
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const uniqueId = useId()

  async function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('month', month)

    const result = await createActions[type](formData)

    if (result.success) {
      formRef.current?.reset()
      onSuccess()
    } else {
      setError(result.error ?? '追加に失敗しました')
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${uniqueId}-label`}>項目名</Label>
        <Input
          id={`${uniqueId}-label`}
          name="label"
          placeholder="項目名…"
          autoComplete="off"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${uniqueId}-amount`}>金額</Label>
        <Input
          id={`${uniqueId}-amount`}
          name="amount"
          type="number"
          placeholder="金額…"
          autoComplete="off"
          min="1"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${uniqueId}-person`}>担当者</Label>
        <Select name="person" defaultValue="husband">
          <SelectTrigger id={`${uniqueId}-person`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="husband">夫</SelectItem>
            <SelectItem value="wife">妻</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {type === 'expense' && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="hidden" name="is_carryover" value="false" />
          <input
            type="checkbox"
            name="is_carryover"
            value="true"
            className="rounded border-border focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          繰越扱いにする
        </label>
      )}
      {type === 'carryover' && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="hidden" name="is_cleared" value="false" />
          <input
            type="checkbox"
            name="is_cleared"
            value="true"
            className="rounded border-border focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          今月で清算する
        </label>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <SubmitButton className="flex-1 h-12" pendingChildren="追加中...">
          {typeLabels[type]}を追加
        </SubmitButton>
      </div>
    </form>
  )
}
