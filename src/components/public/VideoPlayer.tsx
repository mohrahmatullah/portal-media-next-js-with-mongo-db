type Video = { type: "embed" | "upload"; url: string; provider?: string | null };

/** Renders an optional article video. Returns null when no video is present. */
export default function VideoPlayer({ video }: { video?: Video | null }) {
  if (!video) return null;

  if (video.type === "embed") {
    return (
      <div className="my-6 aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={video.url}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl bg-black">
      <video src={video.url} controls className="w-full" />
    </div>
  );
}
