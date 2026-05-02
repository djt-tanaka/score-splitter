'use client'

import { motion } from 'motion/react'
import { barSpring } from '@/components/animations/tokens'
import type { MonthlySummary } from '@/types'

interface YearlyBarChartProps {
  summaries: MonthlySummary[]
  year: number
}

export function YearlyBarChart({ summaries, year }: YearlyBarChartProps) {
  const summaryMap = new Map(summaries.map((s) => [s.month, s]))

  const maxVal = summaries.reduce((max, s) => {
    return Math.max(max, Math.abs(s.balance))
  }, 1)

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthStr = `${year}${String(i + 1).padStart(2, '0')}`
    return { month: monthStr, label: String(i + 1), summary: summaryMap.get(monthStr) }
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-[#999999]">
          月次推移 / 1月〜12月
        </span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#E2483D]" />
        </div>
      </div>

      <div className="flex items-end gap-1">
        {months.map(({ month, summary }) => {
          if (!summary) {
            return (
              <div key={month} className="flex-1 flex items-end justify-center h-[80px]">
                <div className="w-full rounded-sm bg-[#E5E7EB] h-2" />
              </div>
            )
          }

          const h = Math.max((Math.abs(summary.balance) / maxVal) * 80, 4)
          const isPositive = summary.balance >= 0

          return (
            <div key={month} className="flex-1 flex items-end justify-center h-[80px]">
              <motion.div
                className="w-full rounded-sm"
                style={{ backgroundColor: isPositive ? '#2563EB' : '#E2483D' }}
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={barSpring}
              />
            </div>
          )
        })}
      </div>

      <div className="flex gap-1">
        {months.map(({ month, label }) => (
          <span
            key={month}
            className="flex-1 text-center text-[8px] font-mono font-medium text-[#999999]"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
