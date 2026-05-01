'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddEntrySheet } from '@/components/features/add-entry-sheet'

interface AddEntryFabProps {
  month: string
}

export function AddEntryFab({ month }: AddEntryFabProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="項目を追加"
        className="fixed right-4 bottom-4 z-40 md:hidden w-[52px] h-[52px] rounded-full bg-foreground text-background flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <Plus className="h-5 w-5" />
      </button>
      <AddEntrySheet open={open} onOpenChange={setOpen} month={month} />
    </>
  )
}
