import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="min-h-screen gradient-page">
      {/* ヘッダースケルトン */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-4xl">
          <Skeleton className="h-7 w-40" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="container mx-auto px-4 py-8 space-y-4 max-w-4xl animate-fade-in"
      >
        {/* 汎用カードグリッド（一覧・詳細どちらでも違和感の少ない表現） */}
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="shadow-card">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-end justify-between border-b pb-3">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-7 w-28" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
