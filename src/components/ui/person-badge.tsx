import type { Person } from '@/types'

interface PersonBadgeProps {
  person: Person
}

const personConfig = {
  husband: {
    label: '夫',
    className: 'bg-gradient-to-r from-husband-light to-husband-light/50 text-husband border border-husband/25',
  },
  wife: {
    label: '妻',
    className: 'bg-gradient-to-r from-wife-light to-wife-light/50 text-wife border border-wife/25',
  },
} as const

export function PersonBadge({ person }: PersonBadgeProps) {
  const config = personConfig[person]

  return (
    <span className={`text-xs px-2 py-1 rounded-md font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}
