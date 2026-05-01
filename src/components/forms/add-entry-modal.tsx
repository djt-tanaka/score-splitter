'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { Button } from '@/components/ui/button'
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
    <Button variant="outline" size="sm" className="mt-2 w-full">
      <Plus className="size-3.5" />
      項目を追加
    </Button>
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
