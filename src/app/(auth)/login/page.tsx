import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { loginReader } from "@/lib/auth/actions";
import { getCurrentReader } from "@/lib/auth/context";

export const metadata = { title: "Masuk" };

export default async function ReaderLoginPage() {
  if (await getCurrentReader()) redirect("/");
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <Link href="/" className="mb-6 block text-center text-xl font-bold text-brand-700">
          Portal Media
        </Link>
        <h1 className="mb-1 text-2xl font-bold">Masuk</h1>
        <p className="mb-6 text-sm text-gray-500">Masuk untuk ikut berkomentar.</p>
        <AuthForm
          action={loginReader}
          submitLabel="Masuk"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { name: "password", label: "Password", type: "password" },
          ]}
        />
        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
