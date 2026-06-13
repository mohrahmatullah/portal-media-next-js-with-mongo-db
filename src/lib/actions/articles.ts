"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/context";
import { uniqueSlug, slugify } from "@/lib/slug";
import { parseVideoInput } from "@/lib/video";
import { invalidateContentCaches } from "@/lib/cache";
import type { Prisma } from "@prisma/client";

export type ArticleFormState = { error?: string } | undefined;

type RelatedImageInput = { url: string; caption?: string; alt?: string; order?: number };

function parseRelated(raw: string): RelatedImageInput[] {
  if (!raw.trim()) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x.url === "string" && x.url)
      .map((x, i) => ({
        url: x.url,
        caption: x.caption || null,
        alt: x.alt || null,
        order: typeof x.order === "number" ? x.order : i,
      }));
  } catch {
    return [];
  }
}

async function resolveTags(raw: string): Promise<string[]> {
  const names = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const ids: string[] = [];
  for (const name of names) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
    ids.push(tag.id);
  }
  return ids;
}

function buildData(formData: FormData, related: RelatedImageInput[], tagIds: string[]) {
  const videoRaw = String(formData.get("video") ?? "");
  const video = parseVideoInput(videoRaw); // throws on invalid; null when empty

  const data: Prisma.ArticleUncheckedCreateInput = {
    title: String(formData.get("title") ?? "").trim(),
    slug: "", // set by caller
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? ""),
    coverImage: String(formData.get("coverImage") ?? "").trim() || null,
    relatedImages: related,
    video: video ?? undefined,
    categoryId: String(formData.get("categoryId") ?? ""),
    tagIds,
    seo: {
      metaTitle: String(formData.get("metaTitle") ?? "").trim() || null,
      metaDescription: String(formData.get("metaDescription") ?? "").trim() || null,
      canonicalUrl: String(formData.get("canonicalUrl") ?? "").trim() || null,
      ogImage: String(formData.get("ogImage") ?? "").trim() || null,
    },
    authorId: "", // set by caller
  };
  return data;
}

export async function createArticle(
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const user = await requirePermission("articles.manage");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Judul wajib diisi." };
  if (!String(formData.get("categoryId") ?? "")) return { error: "Kategori wajib dipilih." };

  let data;
  try {
    data = buildData(formData, parseRelated(String(formData.get("relatedImages") ?? "")), await resolveTags(String(formData.get("tags") ?? "")));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Data tidak valid." };
  }

  data.slug = await uniqueSlug(title, async (s) => !!(await prisma.article.findUnique({ where: { slug: s } })));
  data.authorId = user.id;

  await prisma.article.create({ data });
  await invalidateContentCaches();
  redirect("/dashboard/articles");
}

export async function updateArticle(
  id: string,
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requirePermission("articles.manage");

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return { error: "Artikel tidak ditemukan." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Judul wajib diisi." };

  let data;
  try {
    data = buildData(formData, parseRelated(String(formData.get("relatedImages") ?? "")), await resolveTags(String(formData.get("tags") ?? "")));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Data tidak valid." };
  }

  // keep slug stable unless title changed enough to need a new unique slug
  const desired = slugify(title);
  let slug = existing.slug;
  if (desired && desired !== existing.slug) {
    slug = await uniqueSlug(title, async (s) =>
      s !== existing.slug && !!(await prisma.article.findUnique({ where: { slug: s } }))
    );
  }

  await prisma.article.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      body: data.body,
      coverImage: data.coverImage,
      relatedImages: data.relatedImages,
      video: data.video ?? { unset: true },
      categoryId: data.categoryId,
      tagIds: data.tagIds,
      seo: data.seo,
    },
  });
  await invalidateContentCaches();
  redirect("/dashboard/articles");
}

export async function setPublishStatus(id: string, publish: boolean): Promise<void> {
  await requirePermission("articles.publish");
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return;

  if (publish && !article.coverImage) {
    // Enforced at publish time: cannot publish without a cover image.
    redirect(`/dashboard/articles/${id}/edit?error=cover`);
  }

  await prisma.article.update({
    where: { id },
    data: {
      status: publish ? "published" : "draft",
      publishedAt: publish ? article.publishedAt ?? new Date() : article.publishedAt,
    },
  });
  await invalidateContentCaches();
  revalidatePath("/dashboard/articles");
}

export async function setHeadline(id: string): Promise<void> {
  await requirePermission("articles.publish");
  // Single-headline invariant: clear any existing headline first.
  await prisma.article.updateMany({ where: { isHeadline: true }, data: { isHeadline: false } });
  await prisma.article.update({ where: { id }, data: { isHeadline: true } });
  await invalidateContentCaches();
  revalidatePath("/dashboard/articles");
}

export async function toggleFeatured(id: string): Promise<void> {
  await requirePermission("articles.publish");
  const a = await prisma.article.findUnique({ where: { id } });
  if (!a) return;
  await prisma.article.update({ where: { id }, data: { isFeatured: !a.isFeatured } });
  await invalidateContentCaches();
  revalidatePath("/dashboard/articles");
}

export async function deleteArticle(id: string): Promise<void> {
  await requirePermission("articles.manage");
  await prisma.comment.deleteMany({ where: { articleId: id } });
  await prisma.article.delete({ where: { id } });
  await invalidateContentCaches();
  revalidatePath("/dashboard/articles");
}
