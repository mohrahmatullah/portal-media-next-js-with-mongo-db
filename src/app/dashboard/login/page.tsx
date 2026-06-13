import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { loginAdmin } from "@/lib/auth/actions";
import { getCurrentDashboardUser } from "@/lib/auth/context";

export const metadata = { title: "Dashboard Login" };

export default async function DashboardLoginPage() {
  if (await getCurrentDashboardUser()) redirect("/dashboard");
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold">Portal Media Admin</h1>
          <p className="mt-1 text-sm text-gray-500">
            Khusus superadmin, admin, publisher, dan SEO.
          </p>
        </div>
        <AuthForm
          action={loginAdmin}
          submitLabel="Masuk Dashboard"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "admin@portal.test" },
            { name: "password", label: "Password", type: "password" },
          ]}
        />
      </div>
    </main>
  );
}
