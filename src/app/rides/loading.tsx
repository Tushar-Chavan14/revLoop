import { RideCardSkeleton } from "@/components/design-system/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
      <main className="flex flex-1 flex-col gap-6 px-6 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
          <Skeleton className="h-8 w-56 rounded" />
          <Skeleton className="h-4 w-80 rounded" />
        </div>
        <div className="mx-auto w-full max-w-6xl">
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RideCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
