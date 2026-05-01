import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-4xl">
          <Skeleton className="h-4 w-28" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="container mx-auto px-4 py-4 space-y-0 max-w-4xl animate-fade-in"
      >
        {/* タイトルバー */}
        <div className="pb-4">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-8 w-16 mt-2" />
          <Skeleton className="h-3 w-36 mt-2" />
        </div>

        {/* ヒーロー / サマリー */}
        <div className="py-5 border-y border-border">
          <Skeleton className="h-2.5 w-32" />
          <Skeleton className="h-10 w-48 mt-3" />
          <Skeleton className="h-3 w-56 mt-3" />
          <div className="grid grid-cols-2 mt-4 border-t border-border">
            <div className="py-3 pr-3.5 border-r border-border">
              <Skeleton className="h-2 w-12" />
              <Skeleton className="h-5 w-24 mt-2" />
            </div>
            <div className="py-3 pl-3.5">
              <Skeleton className="h-2 w-12" />
              <Skeleton className="h-5 w-24 mt-2" />
            </div>
          </div>
        </div>

        {/* リストヘッダー */}
        <div className="flex items-baseline justify-between py-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-14" />
        </div>

        {/* リスト行 */}
        <div className="border-t border-foreground/20">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="grid grid-cols-[64px_1fr_auto] items-center gap-3.5 px-5 py-4 border-b border-border/60"
            >
              <Skeleton className="h-3 w-5" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-2.5 w-36" />
              </div>
              <div className="text-right space-y-1.5">
                <Skeleton className="h-5 w-20 ml-auto" />
                <Skeleton className="h-2.5 w-10 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
