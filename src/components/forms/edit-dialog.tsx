'use client'

import { useState, useId } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/submit-button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Person } from '@/types'

interface EditDialogProps {
  id: string
  month: string
  label: string
  amount: number
  person: Person
  type: 'income' | 'expense' | 'carryover'
  isCarryover?: boolean
  isCleared?: boolean
  onUpdate: (
    id: string,
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>
}

const typeLabels = {
  income: '収入',
  expense: '支出',
  carryover: '繰越',
}

export function EditDialog({
  id,
  month,
  label,
  amount,
  person,
  type,
  isCarryover,
  isCleared,
  onUpdate,
}: EditDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const uniqueId = useId()

  // 支出と繰越は負の値で保存されているので、表示時は正の値に変換
  const displayAmount = type === 'income' ? amount : Math.abs(amount)

  async function handleSubmit(formData: FormData) {
    setError(null)

    formData.set('month', month)
    const result = await onUpdate(id, formData)

    if (result.success) {
      setOpen(false)
    } else {
      setError(result.error || '更新に失敗しました')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${label}を編集`}
          className="h-9 w-9 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{typeLabels[type]}を編集</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${uniqueId}-label`}>項目名</Label>
            <Input id={`${uniqueId}-label`} name="label" defaultValue={label} autoComplete="off" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uniqueId}-amount`}>金額</Label>
            <Input
              id={`${uniqueId}-amount`}
              name="amount"
              type="number"
              defaultValue={displayAmount}
              autoComplete="off"
              min="1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${uniqueId}-person`}>担当者</Label>
            <Select name="person" defaultValue={person}>
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
                defaultChecked={isCarryover}
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
                defaultChecked={isCleared}
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
              onClick={() => setOpen(false)}
            >
              キャンセル
            </Button>
            <SubmitButton className="flex-1 h-12" pendingChildren="更新中...">
              更新
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
