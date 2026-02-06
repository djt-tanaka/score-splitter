'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  onUpdate,
}: EditDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  // 支出と繰越は負の値で保存されているので、表示時は正の値に変換
  const displayAmount = type === 'income' ? amount : Math.abs(amount)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)

    formData.set('month', month)
    const result = await onUpdate(id, formData)

    setIsPending(false)

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
          className="h-8 w-8 text-muted-foreground hover:text-accent"
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
            <label className="text-sm font-medium">項目名</label>
            <Input name="label" defaultValue={label} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">金額</label>
            <Input
              name="amount"
              type="number"
              defaultValue={displayAmount}
              min="1"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">担当者</label>
            <Select name="person" defaultValue={person}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="husband">夫</SelectItem>
                <SelectItem value="wife">妻</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            <Button type="submit" className="flex-1 h-12" disabled={isPending}>
              {isPending ? '更新中...' : '更新'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
