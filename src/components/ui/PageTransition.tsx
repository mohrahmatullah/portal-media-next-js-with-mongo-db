"use client";

import { usePathname } from "next/navigation";

/**
 * Re-mounts its subtree on every route change (keyed by pathname) so the
 * `.page-fade-in` animation re-triggers as new page content arrives.
 * Respects prefers-reduced-motion via CSS (see globals.css).
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-fade-in">
      {children}
    </div>
  );
}
