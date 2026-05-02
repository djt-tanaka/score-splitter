'use client'

import type { Person } from '@/types'

interface PersonSelectorProps {
  value: Person
  onChange: (person: Person) => void
  name?: string
}

export function PersonSelector({ value, onChange, name }: PersonSelectorProps) {
  return (
    <div className="flex gap-2">
      {name && <input type="hidden" name={name} value={value} />}
      {(['husband', 'wife'] as const).map((p) => {
        const active = value === p
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`flex-1 py-3 rounded-[14px] text-sm font-semibold text-center transition-colors border ${
              active
                ? 'bg-[#DBEAFE] text-[#3B82F6] border-[#3B82F6]'
                : 'bg-[var(--card)] text-[var(--sub-text)] border-[var(--border)]'
            }`}
          >
            {p === 'husband' ? '夫' : '妻'}
          </button>
        )
      })}
    </div>
  )
}
