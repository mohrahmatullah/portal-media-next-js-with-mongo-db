import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PageTransition from "@/components/ui/PageTransition";
import { getCategoriesNav } from "@/lib/queries";
import { getCurrentReader } from "@/lib/auth/context";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let categories: { name: string; slug: string }[] = [];
  let reader: { displayName: string } | null = null;
  try {
    categories = await getCategoriesNav();
    const r = await getCurrentReader();
    reader = r ? { displayName: r.displayName } : null;
  } catch {
    /* tolerate DB being unavailable so the shell still renders */
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} reader={reader} />
      <div className="flex-1">
        <PageTransition>{children}</PageTransition>
      </div>
      <Footer categories={categories} />
    </div>
  );
}
