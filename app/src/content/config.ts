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

export interface SectionConfig {
  id: string;
  title: string;
  kind: SectionKind;
  /** HTML content for single-block richtext sections */
  content?: string;
  /** Subsections for grouped richtext (e.g. Part 4.1–4.6) */
  subsections?: RichTextSubsection[];
  /** Structured data for event-stack sections (Part 5) */
  eventStack?: EventStackConfig;
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
    title: "Event Platform — Stack & Decisions",
    kind: "event-stack",
    eventStack: {
      intro: `
        <p>This is a separate scenario from the validation library in Part 3: a company runs paid workshops and conferences, organizers publish events, attendees register and pay online, tickets are emailed with QR codes, reminders go out 24 hours before, and organizers see revenue dashboards in a distribution portal. Expected load is modest across the year, but popular events can spike to <strong>2,000 registrations in the first hour</strong>.</p>
        <p>I built something like this before at <a href="https://www.virnew.com/" target="_blank" rel="noopener noreferrer">Virnew</a> (2019–2020), when the pandemic halted face-to-face meetups and we marketed virtual venues as a replacement for crowded physical events. We were a small, relatively inexperienced team on something this complex, and looking back, I would architect it differently. What follows is the stack I would choose today, with one-sentence rejection rationale for every layer.</p>
        <p>This shares Postgres and transactional discipline with my Part 4.1 decision, but it is otherwise an independent system, registration, payments, and ticket delivery, not configurable field validation.</p>
      `,
      virnewLesson: `
        <p>The outage that shaped this stack was not a coding bug, it was a <strong>concurrency problem</strong>. I was the sole developer on call during a multi-country event with a few thousand attendees when the platform buckled under the load of many people joining a live video call and a live quiz at the same time. I was debugging alone in real time with no clear path to add capacity fast.</p>
        <p>FastAPI itself does not fix a concurrent-connection problem, but its async support gives more headroom per server for I/O-bound work, and its background task tooling makes it easy to get deferred work (email, QR generation) off the request path from day one. The deeper lesson: <strong>autoscaling, load balancing, and queue-first design</strong> are non-negotiable, not something to retrofit under pressure when 2,000 people hit register at once.</p>
      `,
      decisions: [
        {
          id: "public-frontend",
          category: "frontend",
          layer: "Public frontend",
          choice: "Next.js App Router (SSR / ISR)",
          rejected: "React SPA (Vite)",
          rationale:
            "Client-only SPAs hydrate too late for SEO and social link previews on public event pages.",
        },
        {
          id: "api",
          category: "backend",
          layer: "API",
          choice: "FastAPI (async)",
          rejected: "Laravel",
          rationale:
            "Poor experience running Laravel under Virnew-style load; FastAPI's async I/O gives more headroom per container and keeps deferred work off the request path.",
        },
        {
          id: "database",
          category: "data",
          layer: "Database",
          choice: "PostgreSQL on RDS (Multi-AZ)",
          rejected: "NoSQL (MongoDB and similar)",
          rationale:
            "Payments, ticket inventory, and revenue reporting always need ACID transactions and relational joins, document stores push that consistency into application code.",
        },
        {
          id: "read-replica",
          category: "data",
          layer: "Read replica",
          choice: "RDS Postgres read replica for organizer revenue dashboards",
          rejected: "All reads on the primary",
          rationale:
            "Heavy dashboard queries should not compete with registration and payment writes on the primary during a spike, a read replica is higher priority than over-specifying the organizer UI stack.",
        },
        {
          id: "cache-broker",
          category: "data",
          layer: "Cache + broker",
          choice: "Redis (ElastiCache)",
          rejected: "RabbitMQ-only",
          rationale:
            "One service for cache and Celery broker reduces moving parts for a small team.",
        },
        {
          id: "connection-pool",
          category: "data",
          layer: "Connection pooling",
          choice: "RDS Proxy or PgBouncer",
          rejected: "Direct Postgres connections",
          rationale:
            "API replicas plus Celery workers exhaust Postgres connection limits during spikes without pooling.",
        },
        {
          id: "background-jobs",
          category: "jobs",
          layer: "Background jobs",
          choice: "Celery + Celery Beat",
          rejected: "FastAPI BackgroundTasks only",
          rationale:
            "BackgroundTasks die with the process and cannot survive a 2,000-job email and QR spike.",
        },
        {
          id: "auth",
          category: "auth",
          layer: "Auth",
          choice:
            "Google / Microsoft social login for attendees; Auth0 for organizer accounts (roles, MFA)",
          rejected: "Roll-your-own auth",
          rationale:
            "Attendees won't create another password for a one-off registration; organizers need RBAC and MFA without us owning credential storage.",
        },
        {
          id: "payments",
          category: "payments",
          layer: "Payments",
          choice: "Stripe Checkout + webhooks (+ Stripe Tax if multi-region)",
          rejected: "Custom card form",
          rationale:
            "PCI-DSS scope and fraud tooling are specialist problems with no defensible DIY version.",
        },
        {
          id: "email",
          category: "email",
          layer: "Email",
          choice: "SendGrid",
          rejected: "Self-hosted SMTP",
          rationale:
            "Deliverability is its own discipline; ticket and reminder emails failing silently or landing in spam is a real business risk I don't want tied to my own mail server.",
        },
        {
          id: "qr",
          category: "backend",
          layer: "QR codes",
          choice: "segno server-side, HMAC-signed payload tied to ticket_id",
          rejected: "Client-side QR library",
          rationale:
            "Ticket QR must represent a record the server has issued and can revoke, not client-trusted data.",
        },
        {
          id: "compute",
          category: "infra",
          layer: "Compute",
          choice: "AWS ECS Fargate (horizontal autoscaling)",
          rejected: "Single VPS / one EC2 instance",
          rationale:
            "Horizontal scale is the direct lesson from Virnew buckling under concurrent load, one server has no fast path to add capacity.",
        },
        {
          id: "load-balancer",
          category: "infra",
          layer: "Load balancing",
          choice: "AWS ALB",
          rejected: "nginx on one box",
          rationale:
            "Distributes across N containers with health checks; one box is a single point of failure.",
        },
        {
          id: "object-storage",
          category: "infra",
          layer: "Object storage",
          choice: "AWS S3 for ticket PDFs and QR assets",
          rejected: "QR bytes in Postgres",
          rationale:
            "If I'm on S3, I commit to the AWS ecosystem rather than mixing clouds, S3 is cheaper and CDN-friendly for email attachments.",
        },
        {
          id: "cdn",
          category: "infra",
          layer: "CDN / edge",
          choice: "Cloudflare, cache, WAF, rate-limit POST /registrations",
          rejected: "No edge layer",
          rationale:
            "Caches static event pages and rate-limits registration endpoints during spikes.",
        },
        {
          id: "monitoring",
          category: "monitoring",
          layer: "Monitoring",
          choice: "Sentry (errors) + AWS CloudWatch (latency, queue depth, webhooks)",
          rejected: "grep logs",
          rationale:
            "You need alerts on queue depth and webhook failures before attendees report an outage.",
        },
      ],
      flowSteps: [
        {
          order: 1,
          label: "Browse event page",
          detail:
            "Attendee lands on an SSR/ISR Next.js page, fast first paint, indexable by search and shareable on social.",
        },
        {
          order: 2,
          label: "Register + authenticate",
          detail:
            "Attendee signs in with Google or Microsoft (lower friction for a one-off registration). Auth0 handles organizer accounts separately. API creates a pending registration row in Postgres.",
        },
        {
          order: 3,
          label: "Pay via Stripe Checkout",
          detail:
            "FastAPI creates a Stripe Checkout Session and redirects. User completes payment on Stripe-hosted UI.",
        },
        {
          order: 4,
          label: "Webhook confirms payment",
          detail:
            "Stripe webhook hits FastAPI. Idempotency key prevents duplicate tickets on retry. Registration marked paid.",
        },
        {
          order: 5,
          label: "Enqueue ticket issuance",
          detail:
            "API returns 200 immediately. Celery job enqueued in Redis, spike hits the queue, not the request cycle.",
        },
        {
          order: 6,
          label: "Generate QR + send email",
          detail:
            "Worker loads ticket, generates QR with segno (signed token), stores asset in S3, sends ticket via SendGrid.",
        },
        {
          order: 7,
          label: "Schedule 24h reminder",
          detail:
            "Celery Beat schedules a SendGrid reminder email 24 hours before the event starts.",
        },
        {
          order: 8,
          label: "Check-in at venue",
          detail:
            "Organizer scans QR. API verifies HMAC token against ticket record, instant validation, no client trust.",
        },
      ],
      scalingNotes: `
        <p><strong>2000 registrations in the first hour:</strong> HTTP handlers stay thin, create pending row, redirect to Stripe, return. The burst lands on Celery after webhooks fire, not on synchronous request threads. Monitor Redis queue depth and scale worker count independently of API replicas.</p>
        <p><strong>AWS throughout:</strong> ECS Fargate + ALB + RDS Postgres Multi-AZ + ElastiCache + S3 + CloudWatch. I don't see a strong reason to prefer GCP or Azure for this workload, but once I pick S3 for ticket assets I commit to AWS rather than mixing providers. I would reject a single VPS, you cannot add capacity in minutes during a spike.</p>
        <p><strong>Read replica:</strong> Organizer revenue dashboards query historical registration and payment data. Route those reads to an RDS read replica so heavy reporting never contends with writes on the primary during a registration spike.</p>
        <p><strong>Idempotency:</strong> Stripe webhooks retry. Every payment confirmation must use an idempotency key on both the webhook handler and the registration row so a retry never issues a second ticket.</p>
        <p><strong>Connection pooling:</strong> During a spike, API containers × Celery workers × Beat scheduler can exhaust Postgres max_connections. RDS Proxy or PgBouncer sits between app and database so workers share a pool instead of opening direct connections.</p>
      `,
    },
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

/** Local transcript files served from public/transcripts/ */
export const transcriptFiles = [
  { id: "session-1", label: "Session 1", filename: "session-1.md" },
];
