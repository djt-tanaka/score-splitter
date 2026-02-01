'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { formatMonth, formatCurrency } from '@/lib/utils/format'
import type { CopyMonthPreview, CopyMode, CopyItem } from '@/types'

interface CopyMonthDialogProps {
  currentMonth: string
  previousMonth: string
}

const typeLabels = {
  income: '収入',
  expense: '支出',
  carryover: '繰越',
}

const personLabels = {
  husband: '夫',
  wife: '妻',
}

export function CopyMonthDialog({
  currentMonth,
  previousMonth,
}: CopyMonthDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [preview, setPreview] = useState<CopyMonthPreview | null>(null)
  const [mode, setMode] = useState<CopyMode>('add')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // ダイアログを開いた時にプレビューを取得
  useEffect(() => {
    if (open) {
      setPreview(null)
      setSelectedIds(new Set())
      getCopyMonthPreview(previousMonth, currentMonth).then((data) => {
        setPreview(data)
        // デフォルトで全項目を選択
        setSelectedIds(new Set(data.items.map((item) => item.id)))
      })
    }
  }, [open, previousMonth, currentMonth])

  // 項目をタイプ別にグループ化
  const groupedItems = useMemo(() => {
    if (!preview) return { income: [], expense: [], carryover: [] }
    return {
      income: preview.items.filter((i) => i.type === 'income'),
      expense: preview.items.filter((i) => i.type === 'expense'),
      carryover: preview.items.filter((i) => i.type === 'carryover'),
    }
  }, [preview])

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleAllInType(type: 'income' | 'expense' | 'carryover') {
    const items = groupedItems[type]
    const allSelected = items.every((item) => selectedIds.has(item.id))

    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        items.forEach((item) => next.delete(item.id))
      } else {
        items.forEach((item) => next.add(item.id))
      }
      return next
    })
  }

  function selectAll() {
    if (!preview) return
    setSelectedIds(new Set(preview.items.map((item) => item.id)))
  }

  function deselectAll() {
    setSelectedIds(new Set())
  }

  async function handleCopy() {
    if (!preview) return

    const selectedItems = preview.items.filter((item) =>
      selectedIds.has(item.id)
    )

    if (selectedItems.length === 0) {
      toast.error('コピーする項目を選択してください')
      return
    }

    setIsPending(true)

    const result = await copyMonthData({
      sourceMonth: previousMonth,
      targetMonth: currentMonth,
      mode,
      selectedItems,
    })

    setIsPending(false)

    if (result.success) {
      const total =
        result.copied.incomes +
        result.copied.expenses +
        result.copied.carryovers
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

  const hasSourceData = preview && preview.items.length > 0
  const hasExistingData = preview && preview.existingCount > 0

  function renderItemGroup(
    type: 'income' | 'expense' | 'carryover',
    items: CopyItem[]
  ) {
    if (items.length === 0) return null

    const allSelected = items.every((item) => selectedIds.has(item.id))
    const someSelected = items.some((item) => selectedIds.has(item.id))

    return (
      <div key={type} className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected
            }}
            onChange={() => toggleAllInType(type)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="font-medium">{typeLabels[type]}</span>
          <span className="text-sm text-gray-500">({items.length}件)</span>
        </label>
        <div className="ml-6 space-y-1">
          {items.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="flex-1 text-sm">{item.label}</span>
              <span className="text-xs text-gray-500">
                {personLabels[item.person]}
              </span>
              <span className="text-sm tabular-nums">
                {formatCurrency(item.amount)}
              </span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Copy className="h-4 w-4" />
          前月からコピー
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>前月からデータをコピー</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div className="py-8 text-center text-gray-500">読み込み中...</div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* 月情報 */}
            <div className="text-sm text-gray-600">
              {formatMonth(previousMonth)} → {formatMonth(currentMonth)}
              {hasExistingData && (
                <span className="ml-2 text-yellow-600">
                  （コピー先に{preview.existingCount}件の既存データあり）
                </span>
              )}
            </div>

            {/* コピー対象選択 */}
            {hasSourceData ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="font-medium">コピー対象を選択</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      すべて選択
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      すべて解除
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {renderItemGroup('income', groupedItems.income)}
                  {renderItemGroup('expense', groupedItems.expense)}
                  {renderItemGroup('carryover', groupedItems.carryover)}
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
              </>
            ) : (
              <p className="py-4 text-center text-gray-500">
                コピー元の月にデータがありません
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button
            onClick={handleCopy}
            disabled={isPending || !hasSourceData || selectedIds.size === 0}
          >
            {isPending
              ? 'コピー中...'
              : `コピーする (${selectedIds.size}件)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
