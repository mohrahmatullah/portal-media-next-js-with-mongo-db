import Spinner from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Spinner label="Memuat…" />
    </main>
  );
}
