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

interface RichTextSectionProps {
  content: string;
}

export function RichTextSection({ content }: RichTextSectionProps) {
  const wordCount = countWords(content);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div
        className="rich-text-content px-4 py-4"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
        {wordCount} {wordCount === 1 ? "word" : "words"}
      </div>
    </div>
  );
}
