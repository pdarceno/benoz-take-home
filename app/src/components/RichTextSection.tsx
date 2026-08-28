import { RichTextSubsection } from "../content/types";
import { HtmlContent } from "./HtmlContent";
import { useMemo } from "react";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(html: string): number {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function RichTextBlock({ content }: { content: string }) {
  const wordCount = useMemo(() => countWords(content), [content]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
      <HtmlContent html={content} className="rich-text-content px-4 py-4" />
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
        {wordCount} {wordCount === 1 ? "word" : "words"}
      </div>
    </div>
  );
}

interface RichTextSectionProps {
  content?: string;
  subsections?: RichTextSubsection[];
  partNumber: number;
}

export function RichTextSection({ content, subsections, partNumber }: RichTextSectionProps) {
  if (subsections && subsections.length > 0) {
    return (
      <div className="space-y-8">
        {subsections.map((subsection, index) => (
          <article
            key={subsection.id}
            id={subsection.id}
            className="scroll-mt-8"
            aria-labelledby={`${subsection.id}-heading`}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Part {partNumber}.{index + 1}
            </p>
            <h3
              id={`${subsection.id}-heading`}
              className="mb-4 text-lg font-semibold text-slate-900"
            >
              {subsection.title}
            </h3>
            <RichTextBlock content={subsection.content} />
          </article>
        ))}
      </div>
    );
  }

  return <RichTextBlock content={content ?? ""} />;
}
