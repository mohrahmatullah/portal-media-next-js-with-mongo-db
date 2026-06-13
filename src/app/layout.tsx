import type { Metadata } from "next";
import "./globals.css";
import { getSiteSeo } from "@/lib/seo";
import NavigationProgress from "@/components/ui/NavigationProgress";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeo();
  return {
    title: {
      default: seo.siteName,
      template: seo.titleTemplate.replace("%s", "%s"),
    },
    description: seo.defaultDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    robots: seo.indexingEnabled ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      siteName: seo.siteName,
      images: seo.defaultOgImage ? [seo.defaultOgImage] : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans" suppressHydrationWarning>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
