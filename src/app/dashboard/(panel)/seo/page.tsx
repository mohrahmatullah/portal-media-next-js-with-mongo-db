import { requirePermission } from "@/lib/auth/context";
import { getSiteSeo } from "@/lib/seo";
import SeoForm from "@/components/dashboard/SeoForm";

export const dynamic = "force-dynamic";

export default async function SeoSettingsPage() {
  await requirePermission("seo.manage");
  const seo = await getSiteSeo();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Pengaturan SEO</h1>
      <p className="mb-5 text-sm text-gray-500">
        Default SEO situs. Setiap berita/halaman dapat menimpa nilai ini.
      </p>
      <SeoForm defaults={seo} />
    </div>
  );
}
