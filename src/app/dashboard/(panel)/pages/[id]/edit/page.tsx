import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/context";
import prisma from "@/lib/prisma";
import StaticPageForm from "@/components/dashboard/StaticPageForm";
import { updateStaticPage } from "@/lib/actions/pages";

export const dynamic = "force-dynamic";

export default async function EditStaticPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("pages.manage");
  const { id } = await params;
  const page = await prisma.staticPage.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Edit halaman</h1>
      <StaticPageForm
        action={updateStaticPage.bind(null, page.id)}
        submitLabel="Simpan perubahan"
        defaults={{
          title: page.title,
          slug: page.slug,
          body: page.body,
          published: page.published,
          metaTitle: page.metaTitle ?? "",
          metaDescription: page.metaDescription ?? "",
          ogImage: page.ogImage ?? "",
        }}
      />
    </div>
  );
}
