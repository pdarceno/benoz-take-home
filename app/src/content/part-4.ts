import type { SectionConfig } from "./types";

export const part4Section: SectionConfig = {
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
};
