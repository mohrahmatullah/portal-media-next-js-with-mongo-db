import { redirect } from "next/navigation";
import { getCurrentDashboardUser } from "@/lib/auth/context";
import { can, type Permission } from "@/lib/auth/rbac";
import Sidebar, { type NavItem } from "@/components/dashboard/Sidebar";
import { logoutAdmin } from "@/lib/auth/actions";
import PageTransition from "@/components/ui/PageTransition";

const ALL_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Ringkasan", permission: "analytics.view" },
  { href: "/dashboard/articles", label: "Berita", permission: "articles.manage" },
  { href: "/dashboard/categories", label: "Kategori", permission: "categories.manage" },
  { href: "/dashboard/comments", label: "Komentar", permission: "comments.moderate" },
  { href: "/dashboard/seo", label: "SEO", permission: "seo.manage" },
  { href: "/dashboard/pages", label: "Halaman Statis", permission: "pages.manage" },
  { href: "/dashboard/users", label: "Pengguna", permission: "users.manage" },
  { href: "/dashboard/profile", label: "Profil Saya" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentDashboardUser();
  if (!user) redirect("/dashboard/login");

  const items = ALL_ITEMS.filter(
    (i) => !i.permission || can(user.role, i.permission as Permission)
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} user={{ displayName: user.displayName, role: user.role }} />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <h2 className="text-sm font-medium text-gray-500">Panel Admin</h2>
          <form action={logoutAdmin}>
            <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
              Keluar
            </button>
          </form>
        </header>
        <main className="flex-1 bg-gray-50 p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
