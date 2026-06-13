"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireDashboardUser } from "@/lib/auth/context";
import { invalidateContentCaches } from "@/lib/cache";

export type ProfileFormState = { error?: string; ok?: boolean } | undefined;

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireDashboardUser();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim() || null;
  if (!displayName) return { error: "Nama tampilan wajib diisi." };

  await prisma.user.update({ where: { id: user.id }, data: { displayName, photoUrl } });
  await invalidateContentCaches();
  revalidatePath("/dashboard/profile");
  return { ok: true };
}
