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

      <main id="main" className="container mx-auto px-4 py-8 space-y-6 max-w-4xl animate-fade-in">
        {/* 月セレクター */}
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-[140px]" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>

        {/* 精算額カード */}
        <Card className="relative overflow-hidden border-accent/30 glow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-3">
              <Skeleton className="h-4 w-12 mx-auto" />
              <Skeleton className="h-14 w-48 mx-auto" />
              <Skeleton className="h-5 w-16 mx-auto" />
            </div>
            <div className="mt-8">
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* 収入・支出カード */}
        <div className="grid gap-6 md:grid-cols-2">
          {[0, 1].map((i) => (
            <Card key={i} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-8 rounded-full" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
