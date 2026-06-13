"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/context";

export type SeoFormState = { error?: string; ok?: boolean } | undefined;

export async function updateSiteSeo(
  _prev: SeoFormState,
  formData: FormData
): Promise<SeoFormState> {
  await requirePermission("seo.manage");

  const siteName = String(formData.get("siteName") ?? "").trim();
  const titleTemplate = String(formData.get("titleTemplate") ?? "").trim() || "%s";
  const defaultDescription = String(formData.get("defaultDescription") ?? "").trim();
  const defaultOgImage = String(formData.get("defaultOgImage") ?? "").trim() || null;
  const indexingEnabled = formData.get("indexingEnabled") === "on";

  if (!siteName) return { error: "Nama situs wajib diisi." };

  await prisma.seoSettings.upsert({
    where: { singleton: true },
    create: { singleton: true, siteName, titleTemplate, defaultDescription, defaultOgImage, indexingEnabled },
    update: { siteName, titleTemplate, defaultDescription, defaultOgImage, indexingEnabled },
  });
  revalidatePath("/dashboard/seo");
  revalidatePath("/", "layout");
  return { ok: true };
}
