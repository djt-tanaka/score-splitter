'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

  async function handleSubmit(formData: FormData) {
    formData.set('month', month)
    const result = await onSubmit(formData)
    if (result.success) {
      formRef.current?.reset()
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <Input name="label" placeholder="項目名" required />
      </div>
      <div className="w-32">
        <Input
          name="amount"
          type="number"
          placeholder="金額"
          min="1"
          required
        />
      </div>
      <div className="w-24">
        <Select name="person" defaultValue="husband">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="husband">夫</SelectItem>
            <SelectItem value="wife">妻</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="sm">
        {typeLabels[type]}追加
      </Button>
    </form>
  )
}
