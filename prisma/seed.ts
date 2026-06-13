import { PrismaClient, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function env(key: string, fallback: string): string {
  return process.env[key] && process.env[key]!.length > 0 ? process.env[key]! : fallback;
}

async function hash(p: string) {
  return bcrypt.hash(p, 10);
}

type SeedAccount = { role: Role; email: string; password: string; displayName: string; photoUrl: string };

const DASHBOARD_ACCOUNTS: SeedAccount[] = [
  {
    role: "superadmin",
    email: env("SEED_SUPERADMIN_EMAIL", "superadmin@portal.test"),
    password: env("SEED_SUPERADMIN_PASSWORD", "superadmin123"),
    displayName: "Super Admin",
    photoUrl: "https://i.pravatar.cc/150?img=12",
  },
  {
    role: "admin",
    email: env("SEED_ADMIN_EMAIL", "admin@portal.test"),
    password: env("SEED_ADMIN_PASSWORD", "admin123"),
    displayName: "Administrator",
    photoUrl: "https://i.pravatar.cc/150?img=32",
  },
  {
    role: "publisher",
    email: env("SEED_PUBLISHER_EMAIL", "publisher@portal.test"),
    password: env("SEED_PUBLISHER_PASSWORD", "publisher123"),
    displayName: "Rina Publisher",
    photoUrl: "https://i.pravatar.cc/150?img=45",
  },
  {
    role: "seo",
    email: env("SEED_SEO_EMAIL", "seo@portal.test"),
    password: env("SEED_SEO_PASSWORD", "seo123"),
    displayName: "SEO Specialist",
    photoUrl: "https://i.pravatar.cc/150?img=15",
  },
];

const READERS: { email: string; password: string; displayName: string }[] = [
  {
    email: env("SEED_USER_EMAIL", "reader@portal.test"),
    password: env("SEED_USER_PASSWORD", "reader123"),
    displayName: "Pembaca Setia",
  },
  { email: "reader2@portal.test", password: "reader123", displayName: "Budi Pembaca" },
];

const CATEGORIES = [
  { name: "Politik", slug: "politik", image: "https://picsum.photos/seed/politik/600/400" },
  { name: "Ekonomi", slug: "ekonomi", image: "https://picsum.photos/seed/ekonomi/600/400" },
  { name: "Teknologi", slug: "teknologi", image: "https://picsum.photos/seed/teknologi/600/400" },
  { name: "Olahraga", slug: "olahraga", image: "https://picsum.photos/seed/olahraga/600/400" },
];

async function main() {
  console.log("Seeding…");

  // 1) SeoSettings (default singleton)
  await prisma.seoSettings.upsert({
    where: { singleton: true },
    create: { singleton: true },
    update: {},
  });

  // 2) Dashboard accounts (one per role) + readers — idempotent by email
  for (const acc of DASHBOARD_ACCOUNTS) {
    await prisma.user.upsert({
      where: { email: acc.email },
      create: {
        email: acc.email,
        passwordHash: await hash(acc.password),
        displayName: acc.displayName,
        photoUrl: acc.photoUrl,
        role: acc.role,
      },
      update: { displayName: acc.displayName, photoUrl: acc.photoUrl, role: acc.role },
    });
    console.log(`  ✓ ${acc.role}: ${acc.email}`);
  }

  for (const r of READERS) {
    await prisma.user.upsert({
      where: { email: r.email },
      create: {
        email: r.email,
        passwordHash: await hash(r.password),
        displayName: r.displayName,
        role: "user",
      },
      update: { displayName: r.displayName, role: "user" },
    });
    console.log(`  ✓ user: ${r.email}`);
  }

  // 3) Categories — idempotent by slug
  const categoryBySlug: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, image: c.image },
    });
    categoryBySlug[c.slug] = cat.id;
  }

  // 4) Sample articles (with cover + related images), authored by the publisher
  const publisher = await prisma.user.findUnique({
    where: { email: env("SEED_PUBLISHER_EMAIL", "publisher@portal.test") },
  });
  if (publisher) {
    const samples = [
      {
        slug: "ekonomi-tumbuh-positif",
        title: "Ekonomi Nasional Tumbuh Positif di Kuartal Ini",
        category: "ekonomi",
        isHeadline: true,
        isFeatured: true,
        video: null as null | { type: "embed"; url: string; provider: string },
      },
      {
        slug: "inovasi-teknologi-ai-lokal",
        title: "Inovasi Teknologi AI Buatan Anak Bangsa",
        category: "teknologi",
        isHeadline: false,
        isFeatured: true,
        video: { type: "embed" as const, url: "https://www.youtube.com/embed/dQw4w9WgXcQ", provider: "youtube" },
      },
      {
        slug: "timnas-menang-telak",
        title: "Timnas Menang Telak di Laga Persahabatan",
        category: "olahraga",
        isHeadline: false,
        isFeatured: false,
        video: null,
      },
      {
        slug: "kebijakan-baru-pemerintah",
        title: "Kebijakan Baru Pemerintah Soal Tata Kota",
        category: "politik",
        isHeadline: false,
        isFeatured: true,
        video: null,
      },
    ];

    for (const s of samples) {
      await prisma.article.upsert({
        where: { slug: s.slug },
        update: {},
        create: {
          title: s.title,
          slug: s.slug,
          excerpt: "Ringkasan singkat berita untuk keperluan demo dan pengembangan.",
          body: `<p>Ini adalah konten contoh untuk berita <strong>${s.title}</strong>. Konten ini dihasilkan oleh seeder untuk keperluan demo.</p><p>Paragraf kedua menjelaskan detail tambahan agar tampilan artikel terlihat realistis.</p>`,
          coverImage: `https://picsum.photos/seed/${s.slug}/1200/675`,
          relatedImages: [
            { url: `https://picsum.photos/seed/${s.slug}-1/800/600`, caption: "Foto pendukung 1", alt: s.title, order: 0 },
            { url: `https://picsum.photos/seed/${s.slug}-2/800/600`, caption: "Foto pendukung 2", alt: s.title, order: 1 },
          ],
          video: s.video ?? undefined,
          status: "published",
          publishedAt: new Date(),
          isHeadline: s.isHeadline,
          isFeatured: s.isFeatured,
          authorId: publisher.id,
          categoryId: categoryBySlug[s.category],
        },
      });
      console.log(`  ✓ article: ${s.slug}`);
    }
  }

  // 5) Sample static pages
  for (const p of [
    { slug: "about-us", title: "Tentang Kami", body: "<p>Portal Media adalah situs berita demo.</p>" },
    { slug: "contact", title: "Kontak", body: "<p>Hubungi kami di redaksi@portal.test.</p>" },
    { slug: "privacy", title: "Kebijakan Privasi", body: "<p>Kebijakan privasi contoh.</p>" },
  ]) {
    await prisma.staticPage.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, published: true },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
