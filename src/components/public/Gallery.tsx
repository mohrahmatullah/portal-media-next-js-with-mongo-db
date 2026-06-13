import Image from "next/image";

type Item = { url: string; caption?: string | null; alt?: string | null; order?: number };

/** Related-images gallery. Renders nothing when there are no images. */
export default function Gallery({ images }: { images: Item[] }) {
  if (!images?.length) return null;
  const sorted = [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <figure className="my-8">
      <h3 className="mb-3 text-sm font-semibold uppercase text-gray-400">Galeri</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sorted.map((img, i) => (
          <figure key={i} className="overflow-hidden rounded-lg border bg-gray-50">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={img.url}
                alt={img.alt || img.caption || "Gambar terkait"}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            {img.caption && <figcaption className="p-2 text-xs text-gray-500">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </figure>
  );
}
