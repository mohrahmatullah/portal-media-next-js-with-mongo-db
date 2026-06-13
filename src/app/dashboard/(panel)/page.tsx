import { requirePermission } from "@/lib/auth/context";
import { getDashboardAnalytics } from "@/lib/analyticsQueries";
import {
  PostingActivityChart,
  VisitorChart,
  UsersByRoleChart,
  ArticleVolumeChart,
} from "@/components/dashboard/Charts";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default async function DashboardHome() {
  await requirePermission("analytics.view");
  const { posting, users, visitors, volume } = await getDashboardAnalytics();

  const totalArticles = volume.byStatus.reduce((s, x) => s + x.count, 0);
  const published = volume.byStatus.find((s) => s.status === "published")?.count ?? 0;
  const visits14 = visitors.reduce((s, x) => s + x.visits, 0);

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Ringkasan</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total berita" value={totalArticles} />
        <StatCard label="Terbit" value={published} />
        <StatCard label="Total pengguna" value={users.total} />
        <StatCard label="Pengunjung (14 hari)" value={visits14} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 font-semibold">Aktivitas Posting (30 hari)</h2>
          <PostingActivityChart data={posting} />
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 font-semibold">Pengunjung (14 hari)</h2>
          <VisitorChart data={visitors} />
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 font-semibold">Pengguna per Peran</h2>
          <UsersByRoleChart data={users.byRole} />
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 font-semibold">Jumlah Berita per Kategori</h2>
          <ArticleVolumeChart data={volume.byCategory} />
        </div>
      </div>
    </div>
  );
}
