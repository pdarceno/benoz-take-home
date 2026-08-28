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
      <p>I think I fit this role because I have a strong background in full-stack development, backend systems, APIs, databases, and AI-powered applications, with experience building and maintaining multi-tenant SaaS in p roduction.</p>
      <p>I am comfortable taking ownership of a system, working independently, making technical decisions, and solving problems without needing every step defined for me. I also use AI-assisted development tools such as Claude, Cursor, GitHub Copilot, and Gemini extensively as part of my development workflow.</p>
      <p>I am particularly interested in this role because I would have the opportunity to help build the platform from the beginning and establish the engineering practices that future developers will follow. I enjoy building reliable systems, improving architecture, and taking responsibility for quality, security, and delivery.</p>
    `,
  },
  { id: "part-2", title: "Video Introduction", kind: "video" },
  { id: "part-3", title: "Validation Demo", kind: "validation" },
  {
    id: "part-4",
    title: "Six Decisions",
    kind: "richtext",
    subsections: [
      {
        id: "part-4-1",
        title: "Postgres vs MongoDB",
        content: `<p>Postgres. A multi-tenant platform benefits from strong relational integrity, transactions, constraints, indexing, and JSONB for client-defined fields. I would keep stable fields relational and store configurable fields in JSONB. Under MongoDB, my Part 3 repository and validation logic would change to document-based persistence, with relational constraints and SQL queries replaced by document queries and application-level consistency.</p>`,
      },
      {
        id: "part-4-2",
        title: "Validation Design Decisions",
        content: `<p>During implementation, we initially added a check (blockedByCrossFieldPartner) that suppressed a required_when error on a field if that field also appeared in a rules entry whose other operand wasn't usable, e.g. not requiring end_date while start_date had a format error. We removed this: required_when should only depend on its own declared condition field, nothing else. Coupling it to an unrelated cross-field rule meant a legitimate "this field is required" error could silently go missing whenever a different field happened to be invalid. Phase 2 now checks only its declared condition; Phase 3 independently skips when its own operands aren't usable, the two phases no longer reach into each other.</p>
        <p>In addition, ignored_when / applies_when on cross-field rules. I considered a condition on the rules array that would skip a cross-field comparison entirely based on another field's value (e.g. only checking end_date >= start_date when event_type is multi_day, so a single-day event's date order is never checked). I decided against building it: a value that's present should still be internally consistent regardless of whether the field was relevant or required for that record type. There is no ignored_when or applies_when in the current format, a cross-field rule always runs whenever both its operands are usable, independent of any other field.</p>`,
      },
      {
        id: "part-4-3",
        title: "Tenant Isolation",
        content: `<p>I'd choose full isolation, based on precedent at Concentrix: when Uber and Spotify required their support data kept separate from the rest of our CS operations, management didn't propose a hybrid, they built full separation, because the alternative was losing those accounts.</p>
        <p>What we gave up: I didn't see the full cost breakdown, but I directly saw payroll and staff scheduling get more complicated once those accounts were isolated. Teams tied to one client can't be shared or reassigned the way teams on regular accounts can, which made staffing harder to manage.</p>
        <p>Who we'd lose: smaller clients who want the same guarantee but don't have Uber or Spotify's leverage to justify the cost of dedicated setup for them specifically.</p>`,
      },
      {
        id: "part-4-4",
        title: "Leading",
        content: `<p>Leading. In practice: since the hint didn't land, I'd just tell them directly what's likely wrong rather than keep circling, the value of a hint is testing whether they can close the gap themselves, and once that's answered, prolonging it doesn't teach anything further. If they couldn't use the hint, my read is a knowledge gap, not a carelessness problem, they didn't have enough context on that part of the system to interpret what I was pointing at.</p>
        <p>For the team process, I'd rather build people up than treat this as a compliance failure to police: push pair programming, not full-time pairing, but making developers accountable to each other on unfamiliar areas of the codebase, and run regular knowledge-sharing sessions so gaps like this get closed before they show up in a PR. I'd also enforce linters across the codebase, less as a fix for subtle logic bugs like this one and more to clear out the surface-level noise, so review attention goes toward the kind of judgment-level bug this question is actually about.</p>`,
      },
      {
        id: "part-4-5",
        title: "Definition Migration",
        content: `<p>For something narrow, like a character-limit tweak, the risk is low but not zero, I'd still check impact against the old records before assuming it's fine, since even a small constraint change can retroactively fail records that were valid before (e.g. tightening a max length). The check is cheap even when the change is small.</p>
        <p>For something structural, like a data type change, I'd run the transform against a copy of the production data first, never the live records directly, and measure how many of the 10,000 records convert cleanly versus fail. If the failure rate is meaningful, that tells me the type change is lossy enough that old records probably shouldn't be force-migrated at all; they'd stay on the old definition version permanently instead.</p>
        <p>And if the field feeds into core logic elsewhere, a computed rule, a downstream system, something beyond just "does this field validate", I'd be more conservative about the change entirely, since the blast radius isn't just this one definition, it's everything reading that field's shape.</p>`,
      },
      {
        id: "part-4-6",
        title: "Who Edits Definitions",
        content: `<p>Who edits. In practice, I'd have our team edit the definition files directly, gated through a ticketing process (we use Jira), a client requests a change, it's filed and tracked as a ticket, and our team makes the actual edit. That keeps both sides accountable: there's a record of what was requested, by whom, and what was actually changed, without needing to build a client-facing editing surface.</p>`,
      },
    ],
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
    title: "Closing Note",
    kind: "richtext",
    content: `<p>I have not had a recent experience with React in Typescript, so I am not entirely sure about the components that the AI has created. I did appreciate the type safety of the code, reducing the likelihood of runtime errors.</p>
              <p>I also am not very confident with some architectural choices, like the use of FastAPI as opposed to Laravel solely because of my experience with Laravel. I also do not have a strong opinion of each cloud infrastructure provider, so I would need to research more to make a decision.</p>
              <p>This also seem to be more frontend heavy than I initially anticipated, so it took me a bit longer to complete the tasks.</p>`
  },
  {
    id: "part-7",
    title: "How I Work with AI",
    kind: "richtext",
    content: `<p>I have been using AI tools for 2 years now. I take advantage of skills, rules, a few plugins, hooks, MCP, etc. to make my life easier.</p>
              <p>I am also very much leaning into studying more about LLMs and how to use them to their full potential.</p>`
  },
  { id: "part-8", title: "AI Transcripts", kind: "transcript" },
];

/** Replace with your Loom embed URL, e.g. https://www.loom.com/embed/abc123 */
export const loomEmbedUrl = "https://www.loom.com/embed/YOUR_VIDEO_ID";

/** Optional external link to transcripts (Google Drive, gist, etc.) */
export const transcriptExternalUrl = "";

/** Local transcript files served from public/transcripts/ */
export const transcriptFiles = [
  { id: "part-1", label: "Part 1", filename: "cursor_validation_rules_implementation.md" },
  { id: "part-2", label: "Part 2", filename: "cursor_event_management_system_design.md" },
];
