import type { SectionConfig } from "./types";
import { part1Section } from "./part-1";
import { part3Section } from "./part-3";
import { part4Section } from "./part-4";
import { part5Section } from "./part-5-event-stack";
import { part6Section, part7Section } from "./part-6-7";

export const sections: SectionConfig[] = [
  part1Section,
  { id: "part-2", title: "Video Introduction", kind: "video" },
  part3Section,
  part4Section,
  part5Section,
  part6Section,
  part7Section,
  { id: "part-8", title: "AI Transcripts", kind: "transcript" },
];
