'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CopyMonthDialog } from '@/components/features/copy-month-dialog'
import { formatMonth, parseMonth, getPreviousMonth } from '@/lib/utils/format'

interface MonthSelectorProps {
  currentMonth: string
}

export function MonthSelector({ currentMonth }: MonthSelectorProps) {
  const router = useRouter()

  function navigateMonth(offset: number) {
    const [year, month] = currentMonth.split('-').map(Number)
    const date = new Date(year, month - 1 + offset, 1)
    router.push(`/?month=${parseMonth(date)}`)
  }

  function goToCurrentMonth() {
    router.push(`/?month=${parseMonth(new Date())}`)
  }

  const previousMonth = getPreviousMonth(currentMonth)

  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <button
        onClick={goToCurrentMonth}
        className="text-xl font-bold min-w-[150px] hover:text-blue-600"
      >
        {formatMonth(currentMonth)}
      </button>
      <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <CopyMonthDialog
        currentMonth={currentMonth}
        previousMonth={previousMonth}
      />
    </div>
  )
}
