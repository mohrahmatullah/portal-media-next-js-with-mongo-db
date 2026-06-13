import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { registerReader } from "@/lib/auth/actions";
import { getCurrentReader } from "@/lib/auth/context";

export const metadata = { title: "Daftar" };

export default async function RegisterPage() {
  if (await getCurrentReader()) redirect("/");
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <Link href="/" className="mb-6 block text-center text-xl font-bold text-brand-700">
          Portal Media
        </Link>
        <h1 className="mb-1 text-2xl font-bold">Daftar</h1>
        <p className="mb-6 text-sm text-gray-500">Buat akun pembaca untuk berkomentar.</p>
        <AuthForm
          action={registerReader}
          submitLabel="Daftar"
          fields={[
            { name: "displayName", label: "Nama tampilan", placeholder: "Nama Anda" },
            { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { name: "password", label: "Password", type: "password", placeholder: "min. 6 karakter" },
          ]}
        />
        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
