import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <Skeleton className="h-9 w-52" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full max-w-md" />
        ))}
      </div>
    </main>
  );
}
