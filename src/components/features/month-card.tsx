import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatMonth } from '@/lib/utils/format'
import type { MonthlySummary } from '@/types'

interface MonthCardProps {
  summary: MonthlySummary
}

export function MonthCard({ summary }: MonthCardProps) {
  const isPositive = summary.balance >= 0

  return (
    <Link
      href={`/?month=${summary.month}`}
      aria-label={`${formatMonth(summary.month)}の詳細を開く`}
      className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Card className="h-full shadow-card card-interactive">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{formatMonth(summary.month)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-end justify-between border-b pb-3">
              <span className="text-muted-foreground text-xs uppercase tracking-wider">
                収支
              </span>
              <span
                className={`text-2xl font-bold font-mono font-tabular ${
                  isPositive ? 'text-neon-green' : 'text-neon-red'
                }`}
              >
                {formatCurrency(summary.balance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">収入</span>
              <span className="font-medium text-neon-green font-mono font-tabular">
                {formatCurrency(summary.incomeTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">支出</span>
              <span className="font-medium text-neon-red font-mono font-tabular">
                {formatCurrency(summary.expenseTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
