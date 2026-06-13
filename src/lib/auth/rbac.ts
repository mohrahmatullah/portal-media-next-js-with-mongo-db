import type { Role } from "@prisma/client";

/** Roles that may authenticate on the dashboard route. */
export const DASHBOARD_ROLES: Role[] = ["superadmin", "admin", "publisher", "seo"];

/** The single role used by the public frontend (readers/commenters). */
export const FRONTEND_ROLE: Role = "user";

export function isDashboardRole(role: Role): boolean {
  return DASHBOARD_ROLES.includes(role);
}

/**
 * Permission keys used across dashboard features. The matrix below is the
 * single source of truth for what each role may do.
 */
export type Permission =
  | "users.manage"
  | "users.manage_superadmin"
  | "articles.manage"
  | "articles.publish"
  | "categories.manage"
  | "comments.moderate"
  | "seo.manage"
  | "pages.manage"
  | "analytics.view";

const MATRIX: Record<Role, Permission[]> = {
  superadmin: [
    "users.manage",
    "users.manage_superadmin",
    "articles.manage",
    "articles.publish",
    "categories.manage",
    "comments.moderate",
    "seo.manage",
    "pages.manage",
    "analytics.view",
  ],
  admin: [
    "users.manage",
    "articles.manage",
    "articles.publish",
    "categories.manage",
    "comments.moderate",
    "seo.manage",
    "pages.manage",
    "analytics.view",
  ],
  publisher: [
    "articles.manage",
    "articles.publish",
    "categories.manage",
    "comments.moderate",
    "analytics.view",
  ],
  seo: ["seo.manage", "pages.manage", "analytics.view"],
  user: [],
};

export function can(role: Role, permission: Permission): boolean {
  return MATRIX[role]?.includes(permission) ?? false;
}

/** Roles allowed to log in to the dashboard. */
export function canUseDashboard(role: Role): boolean {
  return isDashboardRole(role);
}
