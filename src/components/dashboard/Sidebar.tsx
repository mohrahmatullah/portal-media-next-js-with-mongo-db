"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Permission } from "@/lib/auth/rbac";

export type NavItem = { href: string; label: string; permission?: Permission };

export default function Sidebar({
  items,
  user,
}: {
  items: NavItem[];
  user: { displayName: string; role: string };
}) {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 flex-col bg-gray-900 text-gray-200">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs uppercase tracking-widest text-brand-400">Dashboard</p>
        <p className="font-bold text-white">Portal Media</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "block rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-brand-600 text-white" : "hover:bg-white/10"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-5 py-4 text-sm">
        <p className="font-medium text-white">{user.displayName}</p>
        <p className="text-xs capitalize text-gray-400">{user.role}</p>
      </div>
    </aside>
  );
}
