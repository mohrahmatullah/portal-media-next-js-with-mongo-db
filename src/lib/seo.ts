import prisma from "@/lib/prisma";

export type SiteSeo = {
  siteName: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultOgImage: string | null;
  indexingEnabled: boolean;
};

const FALLBACK: SiteSeo = {
  siteName: "Portal Media",
  titleTemplate: "%s | Portal Media",
  defaultDescription: "Berita terbaru dan terpercaya.",
  defaultOgImage: null,
  indexingEnabled: true,
};

/** Site-wide SEO defaults, tolerant of an unreachable DB (returns fallback). */
export async function getSiteSeo(): Promise<SiteSeo> {
  try {
    const s = await prisma.seoSettings.findFirst({ where: { singleton: true } });
    if (!s) return FALLBACK;
    return {
      siteName: s.siteName,
      titleTemplate: s.titleTemplate,
      defaultDescription: s.defaultDescription,
      defaultOgImage: s.defaultOgImage,
      indexingEnabled: s.indexingEnabled,
    };
  } catch {
    return FALLBACK;
  }
}
