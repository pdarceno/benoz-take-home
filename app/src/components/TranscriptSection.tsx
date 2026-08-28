import { useEffect, useRef, useState } from "react";
import { transcriptExternalUrl, transcriptFiles } from "../content/config";

const transcriptCache = new Map<string, string>();

function isSafeHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function TranscriptSection() {
  const [activeId, setActiveId] = useState(transcriptFiles[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeFile = transcriptFiles.find((file) => file.id === activeId);
  const safeExternalUrl =
    transcriptExternalUrl && isSafeHttpsUrl(transcriptExternalUrl)
      ? transcriptExternalUrl
      : null;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !activeFile) {
      if (!activeFile) {
        setContent("");
        setLoading(false);
      }
      return;
    }

    const cached = transcriptCache.get(activeFile.filename);
    if (cached !== undefined) {
      setContent(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();

    fetch(`/transcripts/${activeFile.filename}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Transcript file not found");
        return response.text();
      })
      .then((text) => {
        transcriptCache.set(activeFile.filename, text);
        setContent(text);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setContent("");
        setLoading(false);
      });

    return () => controller.abort();
  }, [activeFile, visible]);

  return (
    <div ref={rootRef} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {transcriptFiles.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {transcriptFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setActiveId(file.id)}
                className={`min-h-11 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                  activeId === file.id
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {file.label}
              </button>
            ))}
          </div>
        )}

        {activeFile && (
          <a
            href={`/transcripts/${activeFile.filename}`}
            download={activeFile.filename}
            className="btn-secondary"
          >
            Download
          </a>
        )}

        {safeExternalUrl && (
          <a
            href={safeExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            External link
          </a>
        )}
      </div>

      <div className="max-h-[480px] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4">
        {!visible && (
          <p className="text-sm text-slate-400">Scroll here to load transcript…</p>
        )}
        {visible && loading && (
          <p className="text-sm text-slate-400">Loading transcript…</p>
        )}
        {visible && error && (
          <p className="text-sm text-red-400">
            {error}. Add your file to <code>public/transcripts/</code>.
          </p>
        )}
        {visible && !loading && !error && (
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-100">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}
