'use client'

import { motion } from 'motion/react'
import { barSpring } from '@/components/animations/tokens'
import type { MonthlySummary } from '@/types'

interface TrendCardProps {
  summaries: MonthlySummary[]
  currentMonth: string
}

function formatShortMonth(month: string): string {
  const m = parseInt(month.slice(4, 6), 10)
  return `${m}月`
}

export function TrendCard({ summaries, currentMonth }: TrendCardProps) {
  if (summaries.length === 0) return null

  const maxVal = summaries.reduce((max, s) => {
    return Math.max(max, s.incomeTotal, Math.abs(s.expenseTotal))
  }, 1)

  return (
    <div className="rounded-[16px] bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.8px] text-[#999999] uppercase">
          Trend / 推移
        </span>
        <span className="text-[10px] font-medium text-[#999999]">
          直近{summaries.length}ヶ月
        </span>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
          <span className="text-[9px] text-[#666666]">収入</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          <span className="text-[9px] text-[#666666]">支出</span>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-[100px] mt-3 px-2">
        {summaries.map((s) => {
          const incomeH = (s.incomeTotal / maxVal) * 100
          const expenseH = (Math.abs(s.expenseTotal) / maxVal) * 100
          const isCurrent = s.month === currentMonth

          return (
            <div key={s.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-[3px] h-full w-full justify-center">
                <motion.div
                  className="w-2 rounded-t-[3px]"
                  style={{ backgroundColor: isCurrent ? '#2563EB' : '#3B82F6' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${incomeH}%` }}
                  transition={barSpring}
                />
                <motion.div
                  className="w-2 rounded-t-[3px] bg-[#EF4444]"
                  initial={{ height: 0 }}
                  animate={{ height: `${expenseH}%` }}
                  transition={barSpring}
                />
              </div>
              <span className={`text-[8px] font-mono ${isCurrent ? 'text-[#2563EB] font-bold' : 'text-[#999999]'}`}>
                {formatShortMonth(s.month)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
