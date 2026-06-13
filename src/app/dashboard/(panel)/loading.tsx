/**
 * Panel content placeholder. Rendered inside (panel)/layout.tsx, so the
 * sidebar and top header stay visible while the page streams in.
 */
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Memuat…">
      <div className="h-7 w-48 rounded-lg bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-xl bg-gray-200" />
        <div className="h-24 rounded-xl bg-gray-200" />
        <div className="h-24 rounded-xl bg-gray-200" />
      </div>
      <div className="h-64 rounded-xl bg-gray-200" />
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
