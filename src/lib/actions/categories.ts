"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/context";
import { uniqueSlug, slugify } from "@/lib/slug";
import { invalidateContentCaches } from "@/lib/cache";

export type CategoryFormState = { error?: string; ok?: boolean } | undefined;

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requirePermission("categories.manage");
  const name = String(formData.get("name") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  if (!name) return { error: "Nama kategori wajib diisi." };
  if (!image) return { error: "Gambar kategori wajib diisi." };

  const slug = await uniqueSlug(name, async (s) => !!(await prisma.category.findUnique({ where: { slug: s } })));
  await prisma.category.create({ data: { name, slug, image } });
  await invalidateContentCaches();
  revalidatePath("/dashboard/categories");
  return { ok: true };
}

export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requirePermission("categories.manage");
  const name = String(formData.get("name") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  if (!name) return { error: "Nama kategori wajib diisi." };
  if (!image) return { error: "Gambar kategori wajib diisi." };

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return { error: "Kategori tidak ditemukan." };

  const desired = slugify(name);
  let slug = existing.slug;
  if (desired && desired !== existing.slug) {
    slug = await uniqueSlug(name, async (s) =>
      s !== existing.slug && !!(await prisma.category.findUnique({ where: { slug: s } }))
    );
  }
  await prisma.category.update({ where: { id }, data: { name, slug, image } });
  await invalidateContentCaches();
  revalidatePath("/dashboard/categories");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<void> {
  await requirePermission("categories.manage");
  const count = await prisma.article.count({ where: { categoryId: id } });
  if (count > 0) {
    // Don't orphan articles; surface via redirect param.
    revalidatePath("/dashboard/categories");
    return;
  }
  await prisma.category.delete({ where: { id } });
  await invalidateContentCaches();
  revalidatePath("/dashboard/categories");
}
