import { requirePermission } from "@/lib/auth/context";
import StaticPageForm from "@/components/dashboard/StaticPageForm";
import { createStaticPage } from "@/lib/actions/pages";

export const dynamic = "force-dynamic";

export default async function NewStaticPage() {
  await requirePermission("pages.manage");
  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Halaman baru</h1>
      <StaticPageForm action={createStaticPage} submitLabel="Simpan halaman" />
    </div>
  );
}
