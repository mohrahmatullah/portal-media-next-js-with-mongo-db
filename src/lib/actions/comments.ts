"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentReader, requirePermission } from "@/lib/auth/context";

export type CommentFormState = { error?: string; ok?: boolean } | undefined;

export async function postComment(
  articleId: string,
  slug: string,
  _prev: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  // Only authenticated readers may comment.
  const reader = await getCurrentReader();
  if (!reader) return { error: "Anda harus masuk untuk berkomentar." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Komentar tidak boleh kosong." };
  if (body.length > 2000) return { error: "Komentar terlalu panjang." };

  const article = await prisma.article.findFirst({
    where: { id: articleId, status: "published" },
  });
  if (!article) return { error: "Artikel tidak ditemukan." };

  await prisma.comment.create({
    data: { articleId, userId: reader.id, body, status: "visible" },
  });
  revalidatePath(`/berita/${slug}`);
  return { ok: true };
}

export async function setCommentStatus(id: string, status: "visible" | "hidden"): Promise<void> {
  await requirePermission("comments.moderate");
  await prisma.comment.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/comments");
}

export async function deleteComment(id: string): Promise<void> {
  await requirePermission("comments.moderate");
  await prisma.comment.delete({ where: { id } });
  revalidatePath("/dashboard/comments");
}
