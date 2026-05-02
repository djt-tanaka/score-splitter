import type { Person } from '@/types'

interface PersonBadgeProps {
  person: Person
  className?: string
}

const personConfig = {
  husband: {
    label: '夫',
    className: 'bg-husband',
  },
  wife: {
    label: '妻',
    className: 'bg-wife',
  },
} as const

export function PersonBadge({ person, className = '' }: PersonBadgeProps) {
  const config = personConfig[person]

  return (
    <span className={`w-[22px] h-[22px] rounded-full text-[8px] font-bold text-white inline-flex items-center justify-center shrink-0 ${config.className} ${className}`}>
      {config.label}
    </span>
  )
}
