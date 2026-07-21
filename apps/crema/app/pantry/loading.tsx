import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <Skeleton className="h-9 w-32" />
      <div className="card mt-6 divide-y divide-[#eee7dd]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-8 h-6 w-24" />
      <div className="card mt-3 space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
    </main>
  );
}
