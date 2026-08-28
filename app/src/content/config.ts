export type SectionKind = "richtext" | "video" | "validation" | "transcript";

export interface SectionConfig {
  id: string;
  title: string;
  kind: SectionKind;
  /** HTML content for richtext sections — edit in this file before deploying */
  content?: string;
}

export const sections: SectionConfig[] = [
  {
    id: "part-1",
    title: "Why I Fit This Role",
    kind: "richtext",
    content: `
      <p>Write your answer here. Replace this placeholder in <code>app/src/content/config.ts</code>.</p>
    `,
  },
  { id: "part-2", title: "Video Introduction", kind: "video" },
  { id: "part-3", title: "Validation Demo", kind: "validation" },
  {
    id: "part-4",
    title: "Section 4 — Your Title Here",
    kind: "richtext",
    content: `<p>Section 4 content goes here.</p>`,
  },
  {
    id: "part-5",
    title: "Section 5 — Your Title Here",
    kind: "richtext",
    content: `<p>Section 5 content goes here.</p>`,
  },
  {
    id: "part-6",
    title: "Section 6 — Your Title Here",
    kind: "richtext",
    content: `<p>Section 6 content goes here.</p>`,
  },
  {
    id: "part-7",
    title: "Section 7 — Your Title Here",
    kind: "richtext",
    content: `<p>Section 7 content goes here.</p>`,
  },
  { id: "part-8", title: "AI Transcripts", kind: "transcript" },
];

/** Replace with your Loom embed URL, e.g. https://www.loom.com/embed/abc123 */
export const loomEmbedUrl = "https://www.loom.com/embed/YOUR_VIDEO_ID";

/** Optional external link to transcripts (Google Drive, gist, etc.) */
export const transcriptExternalUrl = "";

/** Local transcript files served from public/transcripts/ */
export const transcriptFiles = [
  { id: "session-1", label: "Session 1", filename: "session-1.md" },
];
