'use client'

import { useState, useEffect } from 'react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { getCopyMonthPreview, copyMonthData } from '@/app/actions/copy-month'
import { formatMonth } from '@/lib/utils/format'
import type { CopyMonthPreview, CopyMode } from '@/types'

interface CopyMonthDialogProps {
  currentMonth: string
  previousMonth: string
}

export function CopyMonthDialog({
  currentMonth,
  previousMonth,
}: CopyMonthDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [preview, setPreview] = useState<CopyMonthPreview | null>(null)
  const [mode, setMode] = useState<CopyMode>('add')
  const [includeIncome, setIncludeIncome] = useState(true)
  const [includeExpense, setIncludeExpense] = useState(true)
  const [includeCarryover, setIncludeCarryover] = useState(true)

  // ダイアログを開いた時にプレビューを取得
  useEffect(() => {
    if (open) {
      setPreview(null)
      getCopyMonthPreview(previousMonth, currentMonth).then(setPreview)
    }
  }, [open, previousMonth, currentMonth])

  async function handleCopy() {
    setIsPending(true)

    const result = await copyMonthData({
      sourceMonth: previousMonth,
      targetMonth: currentMonth,
      mode,
      includeIncome,
      includeExpense,
      includeCarryover,
    })

    setIsPending(false)

    if (result.success) {
      const total =
        result.copied.incomes + result.copied.expenses + result.copied.carryovers
      const skippedTotal =
        result.skipped.incomes +
        result.skipped.expenses +
        result.skipped.carryovers
      if (skippedTotal > 0) {
        toast.success(`${total}件コピー、${skippedTotal}件スキップしました`)
      } else {
        toast.success(`${total}件のデータをコピーしました`)
      }
      setOpen(false)
    } else {
      toast.error(result.error ?? 'コピーに失敗しました')
    }
  }

  const hasSourceData =
    preview &&
    (preview.source.incomes > 0 ||
      preview.source.expenses > 0 ||
      preview.source.carryovers > 0)

  const hasExistingData =
    preview &&
    (preview.existing.incomes > 0 ||
      preview.existing.expenses > 0 ||
      preview.existing.carryovers > 0)

  const canCopy = includeIncome || includeExpense || includeCarryover

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Copy className="h-4 w-4" />
          前月からコピー
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>前月からデータをコピー</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div className="py-8 text-center text-gray-500">読み込み中...</div>
        ) : (
          <div className="space-y-4">
            {/* コピー元情報 */}
            <div className="rounded-md bg-gray-50 p-3">
              <p className="mb-2 font-medium">
                コピー元: {formatMonth(previousMonth)}
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>収入: {preview.source.incomes}件</li>
                <li>支出: {preview.source.expenses}件</li>
                <li>繰越: {preview.source.carryovers}件</li>
              </ul>
            </div>

            {/* コピー先情報 */}
            {hasExistingData && (
              <div className="rounded-md bg-yellow-50 p-3">
                <p className="mb-2 font-medium">
                  コピー先: {formatMonth(currentMonth)}（既存データあり）
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>収入: {preview.existing.incomes}件</li>
                  <li>支出: {preview.existing.expenses}件</li>
                  <li>繰越: {preview.existing.carryovers}件</li>
                </ul>
              </div>
            )}

            {/* コピー対象選択 */}
            <div>
              <p className="mb-2 font-medium">コピー対象</p>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={includeIncome}
                    onChange={(e) => setIncludeIncome(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">収入</span>
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={includeExpense}
                    onChange={(e) => setIncludeExpense(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">支出</span>
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={includeCarryover}
                    onChange={(e) => setIncludeCarryover(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">繰越</span>
                </label>
              </div>
            </div>

            {/* 重複時の処理 */}
            {hasExistingData && (
              <div>
                <p className="mb-2 font-medium">既存データの処理</p>
                <Select
                  value={mode}
                  onValueChange={(v) => setMode(v as CopyMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">
                      追加（既存データを残す）
                    </SelectItem>
                    <SelectItem value="skip">
                      スキップ（同じ項目があればスキップ）
                    </SelectItem>
                    <SelectItem value="replace">
                      置換（既存データを削除してコピー）
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!hasSourceData && (
              <p className="text-sm text-gray-500">
                コピー元の月にデータがありません
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button
            onClick={handleCopy}
            disabled={isPending || !hasSourceData || !canCopy}
          >
            {isPending ? 'コピー中...' : 'コピーする'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
