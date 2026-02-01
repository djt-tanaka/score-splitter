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
import type {
  CopyMonthPreview,
  CopyMode,
  CopyItem,
  ItemCopyMode,
  SelectedCopyItem,
} from '@/types'

interface CopyMonthDialogProps {
  currentMonth: string
  previousMonth: string
}

const personLabels = {
  husband: '夫',
  wife: '妻',
}

// 項目の選択状態（未選択 | 金額込み | 項目名のみ）
type ItemSelection = 'none' | 'withAmount' | 'labelOnly'

export function CopyMonthDialog({
  currentMonth,
  previousMonth,
}: CopyMonthDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [preview, setPreview] = useState<CopyMonthPreview | null>(null)
  const [mode, setMode] = useState<CopyMode>('add')
  // 各項目の選択状態を管理（id -> selection）
  const [itemSelections, setItemSelections] = useState<Map<string, ItemSelection>>(
    new Map()
  )
  const [includeCarryover, setIncludeCarryover] = useState(true)

  // ダイアログを開いた時にプレビューを取得
  useEffect(() => {
    if (open) {
      setPreview(null)
      setItemSelections(new Map())
      setIncludeCarryover(true)
      getCopyMonthPreview(previousMonth, currentMonth).then((data) => {
        setPreview(data)
        // デフォルトで全項目を「金額込み」で選択
        const selections = new Map<string, ItemSelection>()
        data.items.forEach((item) => {
          selections.set(item.id, 'withAmount')
        })
        setItemSelections(selections)
      })
    }
  }, [open, previousMonth, currentMonth])

  // 項目をタイプ別にグループ化
  const groupedItems = useMemo(() => {
    if (!preview) return { income: [], expense: [] }
    return {
      income: preview.items.filter((i) => i.type === 'income'),
      expense: preview.items.filter((i) => i.type === 'expense'),
    }
  }, [preview])

  function setItemSelection(id: string, selection: ItemSelection) {
    setItemSelections((prev) => {
      const next = new Map(prev)
      next.set(id, selection)
      return next
    })
  }

  function toggleAllInType(type: 'income' | 'expense') {
    const items = groupedItems[type]
    const allSelected = items.every(
      (item) => itemSelections.get(item.id) !== 'none'
    )

    setItemSelections((prev) => {
      const next = new Map(prev)
      items.forEach((item) => {
        next.set(item.id, allSelected ? 'none' : 'withAmount')
      })
      return next
    })
  }

  function selectAll() {
    if (!preview) return
    const selections = new Map<string, ItemSelection>()
    preview.items.forEach((item) => {
      selections.set(item.id, 'withAmount')
    })
    setItemSelections(selections)
    setIncludeCarryover(true)
  }

  function deselectAll() {
    if (!preview) return
    const selections = new Map<string, ItemSelection>()
    preview.items.forEach((item) => {
      selections.set(item.id, 'none')
    })
    setItemSelections(selections)
    setIncludeCarryover(false)
  }

  async function handleCopy() {
    if (!preview) return

    // 選択された項目をSelectedCopyItemに変換
    const selectedItems: SelectedCopyItem[] = preview.items
      .filter((item) => {
        const selection = itemSelections.get(item.id)
        return selection && selection !== 'none'
      })
      .map((item) => ({
        ...item,
        itemCopyMode: (itemSelections.get(item.id) as ItemCopyMode) || 'withAmount',
      }))

    if (selectedItems.length === 0 && !includeCarryover) {
      toast.error('コピーする項目を選択してください')
      return
    }

    setIsPending(true)

    const result = await copyMonthData({
      sourceMonth: previousMonth,
      targetMonth: currentMonth,
      mode,
      selectedItems,
      includeCarryover,
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

  const hasSourceData =
    preview && (preview.items.length > 0 || preview.carryoverCount > 0)
  const hasExistingData = preview && preview.existingCount > 0

  // 選択されている項目数を計算
  const selectedCount = Array.from(itemSelections.values()).filter(
    (s) => s !== 'none'
  ).length
  const canCopy = selectedCount > 0 || includeCarryover
  const totalSelected =
    selectedCount + (includeCarryover && preview ? preview.carryoverCount : 0)

  function renderItemGroup(type: 'income' | 'expense', items: CopyItem[]) {
    if (items.length === 0) return null

    const typeLabel = type === 'income' ? '収入' : '支出'
    const selectedInGroup = items.filter(
      (item) => itemSelections.get(item.id) !== 'none'
    ).length
    const allSelected = selectedInGroup === items.length
    const someSelected = selectedInGroup > 0 && selectedInGroup < items.length

    return (
      <div key={type} className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected
            }}
            onChange={() => toggleAllInType(type)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="font-medium">{typeLabel}</span>
          <span className="text-sm text-gray-500">({items.length}件)</span>
        </label>
        <div className="ml-6 space-y-1">
          {items.map((item) => {
            const selection = itemSelections.get(item.id) || 'none'
            const isSelected = selection !== 'none'

            return (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() =>
                    setItemSelection(
                      item.id,
                      isSelected ? 'none' : 'withAmount'
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="flex-1 text-sm">{item.label}</span>
                <span className="text-xs text-gray-500">
                  {personLabels[item.person]}
                </span>
                <span className="text-sm tabular-nums w-20 text-right">
                  {formatCurrency(item.amount)}
                </span>
                {isSelected && (
                  <select
                    value={selection}
                    onChange={(e) =>
                      setItemSelection(item.id, e.target.value as ItemSelection)
                    }
                    className="text-xs border rounded px-1 py-0.5 bg-white"
                  >
                    <option value="withAmount">金額込み</option>
                    <option value="labelOnly">項目名のみ</option>
                  </select>
                )}
              </div>
            )
          })}
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

                  {/* 繰越（一括選択のみ） */}
                  {preview.carryoverCount > 0 && (
                    <div>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeCarryover}
                          onChange={(e) => setIncludeCarryover(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="font-medium">繰越</span>
                        <span className="text-sm text-gray-500">
                          ({preview.carryoverCount}件)
                        </span>
                      </label>
                    </div>
                  )}
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
            disabled={isPending || !hasSourceData || !canCopy}
          >
            {isPending ? 'コピー中...' : `コピーする (${totalSelected}件)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
