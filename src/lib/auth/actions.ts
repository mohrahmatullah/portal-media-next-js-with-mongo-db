"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { canUseDashboard } from "@/lib/auth/rbac";

export type FormState = { error?: string } | undefined;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerReader(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!emailRe.test(email)) return { error: "Email tidak valid." };
  if (password.length < 6) return { error: "Password minimal 6 karakter." };
  if (!displayName) return { error: "Nama tampilan wajib diisi." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email sudah terdaftar." };

  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password), displayName, role: "user" },
  });
  await createSession("reader", { userId: user.id, role: user.role });
  redirect("/");
}

export async function loginReader(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  // Only the `user` role may use the public login.
  if (!user || user.role !== "user" || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email atau password salah." };
  }
  await createSession("reader", { userId: user.id, role: user.role });
  redirect("/");
}

export async function logoutReader(): Promise<void> {
  await destroySession("reader");
  redirect("/");
}

export async function loginAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email atau password salah." };
  }
  // Reject the frontend `user` role from the dashboard.
  if (!canUseDashboard(user.role)) {
    return { error: "Akun ini tidak memiliki akses dashboard." };
  }
  await createSession("admin", { userId: user.id, role: user.role });
  redirect("/dashboard");
}

export async function logoutAdmin(): Promise<void> {
  await destroySession("admin");
  redirect("/dashboard/login");
}
