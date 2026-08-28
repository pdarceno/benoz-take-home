import { loomEmbedUrl } from "../content/config";

function isAllowedLoomEmbed(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "www.loom.com" &&
      parsed.pathname.startsWith("/embed/")
    );
  } catch {
    return false;
  }
}

export function VideoEmbed() {
  const isConfigured =
    loomEmbedUrl &&
    !loomEmbedUrl.includes("YOUR_VIDEO_ID") &&
    isAllowedLoomEmbed(loomEmbedUrl);

  if (!isConfigured) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-600">
          Set your Loom embed URL in{" "}
          <code className="rounded bg-slate-200 px-1 py-0.5 text-xs">app/src/content/config.ts</code>
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Use format: https://www.loom.com/embed/your-video-id
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-black shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          src={loomEmbedUrl}
          title="Introduction video"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </div>
    </div>
  );
}
