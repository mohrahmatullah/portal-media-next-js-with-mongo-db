"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/context";
import { can } from "@/lib/auth/rbac";
import type { Role } from "@prisma/client";

const ALL_ROLES: Role[] = ["superadmin", "admin", "publisher", "seo", "user"];

export async function changeUserRole(id: string, role: Role): Promise<void> {
  const actor = await requirePermission("users.manage");
  if (!ALL_ROLES.includes(role)) return;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;

  // Admins cannot manage superadmin accounts, nor promote anyone to superadmin.
  const touchingSuperadmin = target.role === "superadmin" || role === "superadmin";
  if (touchingSuperadmin && !can(actor.role, "users.manage_superadmin")) return;

  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/dashboard/users");
}

export async function deleteUser(id: string): Promise<void> {
  const actor = await requirePermission("users.manage");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;

  // Admins cannot delete superadmins; nobody deletes themselves here.
  if (target.role === "superadmin" && !can(actor.role, "users.manage_superadmin")) return;
  if (target.id === actor.id) return;

  await prisma.comment.deleteMany({ where: { userId: id } });
  // Reassign or block? For safety, only delete users with no authored articles.
  const articleCount = await prisma.article.count({ where: { authorId: id } });
  if (articleCount > 0) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/dashboard/users");
}
