/**
 * Calm content-area placeholder shown while a route segment's server
 * component streams in. Purely presentational, no layout shift.
 */
export default function PageSkeleton() {
  return (
    <div className="container mx-auto py-8" role="status" aria-label="Memuat halaman…">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 rounded-lg bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="aspect-[16/9] w-full rounded-xl bg-gray-200" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-11/12 rounded bg-gray-200" />
          <div className="h-4 w-10/12 rounded bg-gray-200" />
          <div className="h-4 w-9/12 rounded bg-gray-200" />
        </div>
      </div>
      <span className="sr-only">Memuat halaman…</span>
    </div>
  );
}
