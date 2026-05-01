'use client'

import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { AddEntryForm } from '@/components/forms/add-entry-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

interface AddEntryModalProps {
  type: 'income' | 'expense' | 'carryover'
  month: string
}

const typeLabels = {
  income: '収入',
  expense: '支出',
  carryover: '繰越',
}

export function AddEntryModal({ type, month }: AddEntryModalProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const title = `${typeLabels[type]}を追加`

  const trigger = (
    <button
      type="button"
      className="flex items-center gap-2 py-3 text-sm text-sub-text hover:text-foreground transition-colors"
    >
      + 項目を追加
    </button>
  )

  const form = (
    <AddEntryForm
      type={type}
      month={month}
      onSuccess={() => setOpen(false)}
      onCancel={() => setOpen(false)}
    />
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="px-4 pb-safe">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="pb-4">
            {form}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  )
}
