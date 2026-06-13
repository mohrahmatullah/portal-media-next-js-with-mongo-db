import { requireDashboardUser } from "@/lib/auth/context";
import ProfileForm from "@/components/dashboard/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireDashboardUser();
  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-2xl font-bold">Profil Saya</h1>
      <p className="mb-5 text-sm text-gray-500">
        Foto profil tampil di byline berita yang Anda tulis.
      </p>
      <ProfileForm
        defaults={{ displayName: user.displayName, photoUrl: user.photoUrl ?? "" }}
      />
      <p className="mt-4 text-xs text-gray-400">
        Email: {user.email} · Peran: <span className="capitalize">{user.role}</span>
      </p>
    </div>
  );
}
