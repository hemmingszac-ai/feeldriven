import { Skeleton } from '@/components/ui/skeleton'

function LoadingCard() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
    </div>
  )
}

export default function ProtectedAppLoading() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LoadingCard />
        <LoadingCard />
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
      </div>
    </div>
  )
}
