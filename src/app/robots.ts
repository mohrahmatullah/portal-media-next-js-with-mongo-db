import type { MetadataRoute } from "next";
import { getSiteSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const seo = await getSiteSeo();

  if (!seo.indexingEnabled) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
