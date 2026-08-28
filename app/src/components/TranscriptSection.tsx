import { useEffect, useState } from "react";
import { transcriptExternalUrl, transcriptFiles } from "../content/config";

export function TranscriptSection() {
  const [activeId, setActiveId] = useState(transcriptFiles[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeFile = transcriptFiles.find((file) => file.id === activeId);

  useEffect(() => {
    if (!activeFile) {
      setLoading(false);
      setContent("");
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/transcripts/${activeFile.filename}`)
      .then((response) => {
        if (!response.ok) throw new Error("Transcript file not found");
        return response.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setContent("");
        setLoading(false);
      });
  }, [activeFile]);

  return (
    <div className="space-y-4">
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

        {transcriptExternalUrl && (
          <a
            href={transcriptExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            External link
          </a>
        )}
      </div>

      <div className="max-h-[480px] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4">
        {loading && <p className="text-sm text-slate-400">Loading transcript…</p>}
        {error && (
          <p className="text-sm text-red-400">
            {error}. Add your file to <code>public/transcripts/</code>.
          </p>
        )}
        {!loading && !error && (
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-100">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}
