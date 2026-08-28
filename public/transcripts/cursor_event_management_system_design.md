# Event management system design
_Exported on 8/28/2026 at 20:08:43 GMT+8 from Cursor (3.7.21)_

---

**User**

/architecture-decision-records   

@config.ts (75-80)  part 5 is a bit unusual or I guess the word is complicated. A separate scenario unrelated to the validation library. So it is an event flow. A company runs paid workshops and conferences. They need a system where organizers publish events, attendees, register, and pay online. Tickets are emailed with a QR code. Attendees get a reminder 24 hours before. Organizers in library distribution revenue dashboards. Expected load of the events a year. Spikes of 2000 registrations in the first hour after a popular event event. Give us the exact complete stack. You would build this with front end, button, button, database, auth. Posting, background jobs, email, payments, monitoring for every component. one sentence why the alternative you reject.

No word limit here. Present it visually: a diagram, an annotated table, an interactive section of your
page, whatever communicates best. This part is where the design of your page is allowed to shine.

I did build something like this before with https://www.virnew.com/ back in 2019-2020 when the pandemic halted a lot of face to face meetups and events. This is the solution that the company marketed to bea noble replacement from what could have been an actual crowded physical even. At the time, we were a small team who were relatively inexperienced with something this complex. Looking back, I would do things differently. Outlined here is what I would do.

I would use Next.js as my frontend instead of React of which we have previously decided on using, opting out of client-side SPA because public event pages need fast first paint and SEO for people finding events through search/social, which a client-only SPA handles poorly. Although this decision is based of my admittedly low knowledge of both frameworks.

Backend: FastAPI (Python). I'd lean toward FastAPI partly out of more hands-on experience with it, but mainly because of what I watched go wrong on Virnew: I was the sole developer on call during a multi-country event with a few thousand attendees, and the platform buckled under the load of many people joining the live video call and a live quiz at the same time, a concurrency problem, not a coding bug, and I was debugging it alone in real time with no clear path to add capacity fast. That experience is why I weight autoscaling, load balancing, and connection capacity heavily in this stack (see below), it's the direct lesson from that outage. FastAPI itself doesn't fix a concurrent-connection problem, but its async support gives more headroom per server for I/O-bound work, and its background task tooling makes it easy to get deferred work (email, QR generation) off the request path from the start, which is a related but separate discipline worth building in from day one rather than retrofitting under pressure.

That being said, for background jobs/queue: Redis + Celery. Registration and payment confirmation return to the user immediately, and everything slow (QR generation, ticket emails, reminder scheduling) gets handed to Celery workers so a spike hits the queue, not the request-response cycle.

Autoscaling/hosting/Load balance: Containerized, horizontally autoscaling cloud infrastructure.  A load balancer distributing traffic across multiple servers, not one server handling everyone. As for the cloud server, I don't see a strong technical reason to prefer AWS over GCP or Azure for this specific system, all three offer equivalent managed compute, load balancing, and relational database services.

I would use Postgres (I can't recall what I previously used, but it was also relational, I think MySQL) and stray away from nosql. Although the flexibility might be helpful, transactional queries like payments, and revenues are always needed to be relational. At the end of the day, always use ACID compliance for these.

Auth: I'd use a managed identity provider, Google/Microsoft social login for attendees (lower friction for people who just want to register and pay, most of them won't want to create yet another password), plus Auth0 for organizer accounts where more control over roles and permissions is needed. I would definitely not build in-house auth again, there's no need to reinvent password storage, session handling, and MFA when a specialist provider already does it more securely than a small team building event software ever will.

Payment: Stripe. I'd reject building custom card handling, PCI-DSS compliance scope and fraud tooling are enormous undertakings for a small team to own, and there's essentially no version of "build it yourself" here that's defensible against a specialist who's already solved it.

Email/SMS: SendGrid. I'd reject self-hosting email, deliverability (not landing in spam) is its own specialist problem, and ticket/reminder emails failing silently is a real business risk I don't want tied to my own mail server's reputation, especially after Virnew.

QR codes: Generated server-side at ticket-issue time using a standard QR library, embedded in the confirmation email. I'd reject generating them client-side in the browser, the QR payload needs to be tied to a ticket record the server has actually verified, not something trusted from the client.

This is my decision and where I am leaning to. Do you have suggestions, especially in the cloud, QR library, or alternative SaaS? This is also for planning on a specific part in a config ONLY not for the whole project.

---

**Cursor**

Reviewing the config structure and existing sections so Part 5 fits the page format and we can refine your stack recommendations.


Checking whether the page supports tables or custom HTML patterns:


Confirming Part 5 is HTML-only richtext (no table/interactive styles yet). Drafting a plan that refines your stack choices and outlines a visual presentation approach.


**Part 5 presentation approach**

> **For the visual/interactive Part 5 section, which approach do you prefer?**
> - HTML in config.ts + small CSS additions (stack table, <details> accordions, CSS flow diagram) — stays closest to “config only”
> - New React section component (tabbed stack layers, expandable rows) fed by structured data in config.ts — more interactive, a few extra files ✔
> - Your call — pick whichever reads best for reviewers

Choosing a React component for richer interactivity. Planning structured config data and the component architecture.


---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementing the Part 5 interactive event stack section — starting with config types and structured data.


Updating config types and Part 5 data, then building the component and styles.


Fixing reversed accordion labels, then verifying the build.


Part 5 is implemented as an interactive event-stack section. Here is what was added:

### Files changed
- **[`app/src/content/config.ts`](app/src/content/config.ts)** — New `event-stack` section kind, typed interfaces, and Part 5 data: 17 stack decisions, 8 flow steps, Virnew narrative, and scaling notes
- **[`app/src/components/EventStackSection.tsx`](app/src/components/EventStackSection.tsx)** — Tabbed UI with 5 tabs:
  - **Overview** — Scenario intro + Virnew lesson callout
  - **Stack** — Filterable decision cards by category
  - **Flow** — Vertical stepper (browse → pay → webhook → queue → email → reminder → check-in)
  - **Scaling** — 2000/hr spike, cloud choice, idempotency, connection pooling
  - **Rejected** — Expandable accordion of every rejected alternative
- **[`app/src/App.tsx`](app/src/App.tsx)** — Renders `EventStackSection` for `event-stack` sections
- **[`app/src/index.css`](app/src/index.css)** — Styles for tabs, cards, flow stepper, accordions, and callout

### Stack documented (17 layers)
Next.js, FastAPI, Postgres, Redis, PgBouncer, Celery + Beat, Clerk/Auth0, Stripe, Resend/SendGrid, Twilio (optional), `segno` QR, ECS Fargate/Cloud Run, ALB, S3, Cloudflare, Sentry + CloudWatch/Grafana — each with a one-sentence rejection rationale.

### Verification
- All 47 tests pass
- Production build succeeds

Run `pnpm dev` and open Part 5 to try the tabs, category filters, flow stepper, and rejected accordion. Copy edits go in `config.ts` under `eventStack`.

---

**User**

I see, you've left out most of my choices.

A few objections. 

For the organizer UI, I don't know that stack. I feel like its less important, and its more important to dedicate another read replica database.

Database, you rejected MongoDB, but I guess the reasoning is more inclined to reject NoSQL as a whole.

API, I rejected Laravel, not Django. But my reasoning was based off poor experience with the latter.

Auth, I didn't specifically choose Clerk or Auth0. I chose social login, in conjunction with it. 

I dind't think of object storage, but if I were to go with S3, then commit to AWS ecosystem.



---

**Cursor**

Updating Part 5 to match your actual choices and reasoning. Reviewing the current config first.


Updating Part 5 content to reflect your choices: removing the organizer UI entry, adding a read replica, and aligning auth, API, database, and AWS decisions.


Removing the Twilio SMS entry since it wasn't part of your original stack.


Updated Part 5 to match your choices. Summary of changes:

| Layer | Before | Now |
|---|---|---|
| **Organizer UI** | Separate Next.js `/dashboard` decision | **Removed** — replaced with **RDS read replica** for organizer revenue dashboards |
| **API rejected** | Django sync views | **Laravel** — rationale tied to your Virnew load experience + FastAPI async headroom |
| **Database rejected** | MongoDB | **NoSQL as a whole** — ACID/relational reasoning |
| **Auth** | Clerk or Auth0 | **Google/Microsoft social login** for attendees **+ Auth0** for organizers |
| **Email** | Resend or SendGrid | **SendGrid only** |
| **Infra** | AWS or GCP mixed | **AWS throughout** — ECS Fargate, ALB, RDS, ElastiCache, S3, CloudWatch |
| **Object storage** | S3 / GCS | **S3** — commit to AWS rather than mixing clouds |
| **SMS/Twilio** | Optional entry | **Removed** — wasn't in your original stack |

Scaling tab now calls out the read replica explicitly: dashboard reads off the replica so they don't compete with registration writes during spikes.

Flow steps updated for social login + Auth0 split and SendGrid for tickets/reminders.

If anything still reads like my voice rather than yours — especially the Laravel rejection wording — point at the line and we can tighten it.

