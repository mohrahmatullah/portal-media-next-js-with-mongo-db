import Link from "next/link";

type Cat = { name: string; slug: string };

export default function Footer({ categories }: { categories: Cat[] }) {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="container grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-brand-700">
            Portal<span className="text-gray-900">Media</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Berita terbaru, terpercaya, dan mendalam.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase text-gray-400">Kategori</h4>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/kategori/${c.slug}`} className="text-gray-600 hover:text-brand-600">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase text-gray-400">Perusahaan</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about-us" className="text-gray-600 hover:text-brand-600">Tentang Kami</Link></li>
            <li><Link href="/contact" className="text-gray-600 hover:text-brand-600">Kontak</Link></li>
            <li><Link href="/privacy" className="text-gray-600 hover:text-brand-600">Kebijakan Privasi</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase text-gray-400">Akun</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/login" className="text-gray-600 hover:text-brand-600">Masuk</Link></li>
            <li><Link href="/register" className="text-gray-600 hover:text-brand-600">Daftar</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Portal Media. Semua hak dilindungi.
      </div>
    </footer>
  );
}
