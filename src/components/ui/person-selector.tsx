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
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-colors"
            style={{
              background: active ? `var(--${p}-light)` : 'var(--card)',
              color: active ? `var(--${p})` : 'var(--sub-text)',
              border: active ? `1.5px solid var(--${p})` : '1px solid var(--border)',
            }}
          >
            {p === 'husband' ? '夫' : '妻'}
          </button>
        )
      })}
    </div>
  )
}
