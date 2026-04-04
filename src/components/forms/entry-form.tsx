'use client'

import { useRef, useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/submit-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EntryFormProps {
  type: 'income' | 'expense' | 'carryover'
  month: string
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}

const typeLabels = {
  income: '収入',
  expense: '支出',
  carryover: '繰越',
}

export function EntryForm({ type, month, onSubmit }: EntryFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const uniqueId = useId()

  async function handleSubmit(formData: FormData) {
    formData.set('month', month)
    const result = await onSubmit(formData)
    if (result.success) {
      formRef.current?.reset()
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3 pt-4 border-t border-border/50">
      <div>
        <Label htmlFor={`${uniqueId}-label`} className="sr-only">項目名</Label>
        <Input id={`${uniqueId}-label`} name="label" placeholder="項目名" required />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Label htmlFor={`${uniqueId}-amount`} className="sr-only">金額</Label>
          <Input
            id={`${uniqueId}-amount`}
            name="amount"
            type="number"
            placeholder="金額"
            min="1"
            required
          />
        </div>
        <div className="w-24">
          <Label htmlFor={`${uniqueId}-person`} className="sr-only">担当者</Label>
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
      </div>
      {type === 'expense' && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input type="hidden" name="is_carryover" value="false" />
          <input
            type="checkbox"
            name="is_carryover"
            value="true"
            className="rounded border-border"
          />
          繰越扱いにする
        </label>
      )}
      {type === 'carryover' && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input type="hidden" name="is_cleared" value="false" />
          <input
            type="checkbox"
            name="is_cleared"
            value="true"
            className="rounded border-border"
          />
          今月で清算する
        </label>
      )}
      <SubmitButton
        className="w-full h-12 glow-sm hover:glow-md transition-shadow"
        pendingChildren="追加中..."
      >
        {typeLabels[type]}を追加
      </SubmitButton>
    </form>
  )
}
