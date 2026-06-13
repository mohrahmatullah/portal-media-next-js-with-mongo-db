// Passthrough layout for the /dashboard segment. The login page lives directly
// under /dashboard/login and must NOT be wrapped by the authenticated chrome,
// so the guard + sidebar live in the (panel) route group instead.
export default function DashboardSegmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
