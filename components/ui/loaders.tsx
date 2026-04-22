import { Skeleton } from '@/components/ui/skeleton'
import { BrandLogo } from '@/components/brand/brand-logo'

export function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-background grid place-items-center page-enter">
      <div className="flex flex-col items-center gap-4">
        <BrandLogo iconOnly />
        <div className="relative h-10 w-10">
          <span className="absolute inset-0 rounded-full border-2 border-primary/25" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary loader-spin" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2 w-28 mx-auto" />
          <Skeleton className="h-2 w-20 mx-auto" />
        </div>
      </div>
    </div>
  )
}

export function DashboardContentLoader() {
  return (
    <div className="p-8 space-y-6 page-enter">
      <div className="flex items-center justify-end">
        <div className="relative h-7 w-7">
          <span className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary loader-spin" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <Skeleton className="h-20 w-full rounded-xl" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl lg:col-span-2" />
      </div>
    </div>
  )
}

export function DashboardShellLoader() {
  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-card border-r flex-col">
        <div className="h-16 border-b px-6 flex items-center">
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <div className="p-4 space-y-2 flex-1">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <div className="border-t p-4 space-y-2">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <DashboardContentLoader />
      </main>
    </div>
  )
}
