import Link from 'next/link'
import { MonthCard } from '@/components/features/month-card'
import { parseMonth } from '@/lib/utils/format'
import type { MonthlySummary } from '@/types'

interface MonthlyListSectionProps {
  summaries: MonthlySummary[]
}

export function MonthlyListSection({ summaries }: MonthlyListSectionProps) {
  if (summaries.length === 0) {
    const thisMonth = parseMonth(new Date())
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">まだ記録がありません。</p>
        <Link
          href={`/?month=${thisMonth}`}
          className="text-accent underline-offset-4 hover:underline"
        >
          今月の画面を開く
        </Link>
      </div>
    )
  }

  return (
    <section aria-label="月の一覧" className="space-y-4">
      <p className="text-xs text-muted-foreground">
        ※各月の収支は繰越に回す前の金額です
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaries.map((summary) => (
          <MonthCard key={summary.month} summary={summary} />
        ))}
      </div>
    </section>
  )
}
