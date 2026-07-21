import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <Skeleton className="h-9 w-28" />
      <div className="mt-4 flex gap-4 border-b border-[#e7e0d5] pb-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="mt-4 h-10 w-full sm:max-w-xs" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card space-y-2 p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-8 h-6 w-24" />
      <div className="card mt-3 space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
    </main>
  );
}
