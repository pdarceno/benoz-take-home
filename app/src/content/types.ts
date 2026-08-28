export type SectionKind =
  | "richtext"
  | "video"
  | "validation"
  | "transcript"
  | "event-stack";

export type StackCategory =
  | "frontend"
  | "backend"
  | "data"
  | "auth"
  | "payments"
  | "jobs"
  | "email"
  | "infra"
  | "monitoring";

export interface RichTextSubsection {
  id: string;
  title: string;
  content: string;
}

export interface StackDecision {
  id: string;
  category: StackCategory;
  layer: string;
  choice: string;
  rejected: string;
  rationale: string;
}

export interface FlowStep {
  order: number;
  label: string;
  detail: string;
}

export interface EventStackConfig {
  intro: string;
  virnewLesson: string;
  decisions: StackDecision[];
  flowSteps: FlowStep[];
  scalingNotes: string;
}

interface SectionBase {
  id: string;
  title: string;
}

export type SectionConfig =
  | (SectionBase & {
      kind: "richtext";
      content?: string;
      subsections?: RichTextSubsection[];
    })
  | (SectionBase & { kind: "video" })
  | (SectionBase & { kind: "validation" })
  | (SectionBase & { kind: "transcript" })
  | (SectionBase & { kind: "event-stack"; eventStack: EventStackConfig });
