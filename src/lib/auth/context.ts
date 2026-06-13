import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { readSession } from "@/lib/auth/session";
import { canUseDashboard, can, type Permission } from "@/lib/auth/rbac";
import type { User } from "@prisma/client";

/** Current frontend reader (role `user`), or null. */
export async function getCurrentReader(): Promise<User | null> {
  const session = await readSession("reader");
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== "user") return null;
  return user;
}

/** Current dashboard user (a dashboard role), or null. */
export async function getCurrentDashboardUser(): Promise<User | null> {
  const session = await readSession("admin");
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !canUseDashboard(user.role)) return null;
  return user;
}

/** Require a dashboard session; redirect to dashboard login otherwise. */
export async function requireDashboardUser(): Promise<User> {
  const user = await getCurrentDashboardUser();
  if (!user) redirect("/dashboard/login");
  return user;
}

/** Require a dashboard session that holds a specific permission. */
export async function requirePermission(permission: Permission): Promise<User> {
  const user = await requireDashboardUser();
  if (!can(user.role, permission)) redirect("/dashboard?forbidden=1");
  return user;
}
