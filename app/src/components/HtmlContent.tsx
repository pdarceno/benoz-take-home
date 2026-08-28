import DOMPurify from "dompurify";
import { useMemo } from "react";

const SANITIZE_OPTIONS: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "p",
    "strong",
    "em",
    "a",
    "ul",
    "ol",
    "li",
    "code",
    "h2",
    "h3",
    "br",
  ],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

interface HtmlContentProps {
  html: string;
  className?: string;
}

export function HtmlContent({ html, className }: HtmlContentProps) {
  const sanitized = useMemo(
    () => DOMPurify.sanitize(html, SANITIZE_OPTIONS),
    [html],
  );

  return (
    <div
      className={className ?? "rich-text-content"}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
