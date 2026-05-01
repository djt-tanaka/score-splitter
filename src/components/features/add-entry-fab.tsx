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
        className="fixed right-4 bottom-5 z-40 md:hidden rounded-full gradient-fab text-white px-5 py-3.5 shadow-fab flex items-center gap-2.5 active:scale-95 transition-transform"
      >
        <span className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center">
          <Plus className="h-4 w-4" />
        </span>
        <span className="text-sm font-bold">項目を追加</span>
      </button>
      <AddEntrySheet open={open} onOpenChange={setOpen} month={month} />
    </>
  )
}
