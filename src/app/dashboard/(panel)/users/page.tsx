import { requirePermission } from "@/lib/auth/context";
import prisma from "@/lib/prisma";
import { can } from "@/lib/auth/rbac";
import { changeUserRole, deleteUser } from "@/lib/actions/users";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

const ROLES: Role[] = ["superadmin", "admin", "publisher", "seo", "user"];

export default async function UsersPage() {
  const actor = await requirePermission("users.manage");
  const canManageSuper = can(actor.role, "users.manage_superadmin");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Pengguna</h1>
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Peran</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => {
              const locked = u.role === "superadmin" && !canManageSuper;
              const roleOptions = ROLES.filter((r) => (r === "superadmin" ? canManageSuper : true));
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.displayName}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    {locked ? (
                      <span className="capitalize text-gray-400">{u.role} (terkunci)</span>
                    ) : (
                      <form action={changeRoleForm} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={u.id} />
                        <select name="role" defaultValue={u.role} className="rounded border px-2 py-1 text-sm">
                          {roleOptions.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <button className="text-brand-600 hover:underline">Simpan</button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!locked && u.id !== actor.id && (
                      <form action={deleteUser.bind(null, u.id)}>
                        <button className="text-red-600 hover:underline">Hapus</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Admin tidak dapat mengubah atau menghapus akun superadmin. Pengguna dengan berita tidak bisa dihapus.
      </p>
    </div>
  );
}

async function changeRoleForm(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (id && role) await changeUserRole(id, role);
}
