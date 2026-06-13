"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/context";
import { uniqueSlug, slugify } from "@/lib/slug";

export type PageFormState = { error?: string } | undefined;

function readForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? ""),
    published: formData.get("published") === "on",
    metaTitle: String(formData.get("metaTitle") ?? "").trim() || null,
    metaDescription: String(formData.get("metaDescription") ?? "").trim() || null,
    ogImage: String(formData.get("ogImage") ?? "").trim() || null,
  };
}

export async function createStaticPage(
  _prev: PageFormState,
  formData: FormData
): Promise<PageFormState> {
  await requirePermission("pages.manage");
  const data = readForm(formData);
  if (!data.title) return { error: "Judul wajib diisi." };

  const slug = await uniqueSlug(
    String(formData.get("slug") || data.title),
    async (s) => !!(await prisma.staticPage.findUnique({ where: { slug: s } }))
  );
  await prisma.staticPage.create({ data: { ...data, slug } });
  redirect("/dashboard/pages");
}

export async function updateStaticPage(
  id: string,
  _prev: PageFormState,
  formData: FormData
): Promise<PageFormState> {
  await requirePermission("pages.manage");
  const existing = await prisma.staticPage.findUnique({ where: { id } });
  if (!existing) return { error: "Halaman tidak ditemukan." };
  const data = readForm(formData);
  if (!data.title) return { error: "Judul wajib diisi." };

  const wantedSlug = slugify(String(formData.get("slug") || ""));
  let slug = existing.slug;
  if (wantedSlug && wantedSlug !== existing.slug) {
    slug = await uniqueSlug(wantedSlug, async (s) =>
      s !== existing.slug && !!(await prisma.staticPage.findUnique({ where: { slug: s } }))
    );
  }
  await prisma.staticPage.update({ where: { id }, data: { ...data, slug } });
  revalidatePath(`/${slug}`);
  redirect("/dashboard/pages");
}

export async function deleteStaticPage(id: string): Promise<void> {
  await requirePermission("pages.manage");
  await prisma.staticPage.delete({ where: { id } });
  revalidatePath("/dashboard/pages");
}
