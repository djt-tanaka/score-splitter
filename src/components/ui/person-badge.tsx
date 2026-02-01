import type { Person } from '@/types'

interface PersonBadgeProps {
  person: Person
}

const personConfig = {
  husband: {
    label: '夫',
    className: 'bg-blue-100 text-blue-700',
  },
  wife: {
    label: '妻',
    className: 'bg-pink-100 text-pink-700',
  },
} as const

export function PersonBadge({ person }: PersonBadgeProps) {
  const config = personConfig[person]

  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
