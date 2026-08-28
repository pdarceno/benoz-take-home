# Benoz.AI Take-Home: Platform Foundation Starter Package

This package contains a working, client-agnostic validation library and a passing
test suite. Your task is to extend it. Read this whole file before writing anything.

## What is here

```
lib/
  types.ts        The definition format: field types and constraints
  validator.ts    validate(definition, record) -> list of errors
definitions/
  client-1-fleet-service.json
  client-2-course-enrollment.json
  client-3-venue-booking.json
tests/
  validator.test.ts   The existing suite. All tests pass.
```

The library knows nothing about any client. Every client difference lives in a
definition file. `validate()` takes a definition and a record and returns a list
of `{ field, error }` objects, empty when the record is valid.

## Setup

```
pnpm install
pnpm test
```

All existing tests pass before you touch anything. Confirm that first.

## Your task

Extend the definition format and the library with three capabilities. The format
of each is yours to design; the design decisions are the point.

### a. Cross-field rules

A rule like "the end date must not be before the start date" must be declarable
as data in the definition file, not written as code.

### b. Conditional required

A rule like "field X is required only when field Y has value Z" must be
declarable the same way.

### c. Evaluation order

Define, document and implement what happens when a rule depends on a field that
is missing, or that has already failed its own validation. A user should see one
real error, not a cascade of nonsense.

## Document your design in this README

Under a new section, document precisely:

- How a rule refers to another field
- Which field an error is reported against, and why you chose that
- What happens when a dependency is missing, and when it is itself invalid
- Where you decided to stop: what your format deliberately cannot express

**After you submit, we will run your library against a definition file you have
not seen, for a client that does not appear in this package. It will contain
rules written against your design, following your README. If your README is
precise enough for us to write those rules correctly, and your code handles
them, you have done what the exercise asks.**

## Rules

- The existing tests must still pass. If you change one, say why.
- Add tests for your new behaviour, including the awkward cases.
- The library stays client-agnostic: no client names or client field names in `lib/`.
- Everything else about your submission (the hosted page, the video, the
  decisions, the transcripts) is described in the exercise document you received.

## Design: Cross-field, Conditional Required, and Evaluation Order

### How a rule refers to another field

Every cross-field reference uses a field's `name` string — the same key used in
the record object passed to `validate()`. There is no path syntax or prefix.

**Conditional required** is declared on the field that becomes required:

```json
{
  "name": "end_date",
  "type": "date",
  "required": false,
  "required_when": {
    "field": "event_type",
    "equals": "multi_day"
  }
}
```

- `field`: the name of the field whose value is tested.
- `equals`: an exact match value (`string`, `number`, or `boolean`).
- `required_when` only applies when `required` is `false`. Static `required: true`
  is unchanged.

**Cross-field rules** are declared in a top-level `rules` array on the definition:

```json
{
  "rules": [
    {
      "type": "gte",
      "left": "end_date",
      "right": "start_date",
      "message": "End date must not be before start date"
    }
  ]
}
```

- `type`: one of `gte`, `lte`, `gt`, `lt`, `eq`, `neq`.
- `left` / `right`: field names to compare.
- `message`: optional custom error text.
- `error_field`: optional field name to receive the error; defaults to `left`.

Supported operators:

| type  | meaning              |
|-------|----------------------|
| `gte` | left ≥ right         |
| `lte` | left ≤ right         |
| `gt`  | left > right         |
| `lt`  | left < right         |
| `eq`  | left = right         |
| `neq` | left ≠ right         |

Comparisons work for **dates** (YYYY-MM-DD, parsed as UTC midnight) and
**numbers** only. Both operands must be the same comparable kind.

### Which field an error is reported against

**Conditional required** reports on the **target field** — the field carrying
`required_when`. That is the field the user must fill when the condition is met.
Error message: `"This field is required"`.

**Cross-field rules** report on **`left` by default** — the field whose value
violates the constraint (e.g. the end date that is too early). Use `error_field`
to override when reporting on the other side is clearer.

Every error is `{ field, error }`. There are no form-level errors.

### What happens when a dependency is missing or invalid

Validation runs in three ordered phases:

1. **Phase 1 — per-field validation**: type checks, constraints, static `required`.
2. **Phase 2 — conditional required**: `required_when` rules.
3. **Phase 3 — cross-field rules**: `rules` array comparisons.

A field is **usable** when it is not empty and has no errors from any earlier
phase. Dependent rules are **skipped** (no error emitted) when a referenced field
is not usable.

| Situation | What the user sees |
|-----------|-------------------|
| `start_date` has invalid format | Phase 1 format error on `start_date` |
| Condition matches, `end_date` empty | Phase 2 conditional required on `end_date` |
| Both dates valid, `end_date` < `start_date` | Phase 3 cross-field error on `end_date` |
| `start_date` invalid and `end_date` empty with conditional required | Phase 1 error on `start_date` **and** Phase 2 error on `end_date`; Phase 3 skipped |
| `start_date` valid, `end_date` empty, conditional required applies | Phase 2 error — Phase 3 skipped |

Conditional required runs before cross-field rules. A `required_when` rule only
checks its own declared condition (e.g. `event_type` equals `multi_day`) — it
does not consult cross-field rule partners. Cross-field rules are skipped when
their operands are missing or invalid, which prevents a date-order error when
`start_date` has a format problem. The goal is meaningful errors without
cross-field nonsense built on bad inputs.

When operands are different types, empty, or not comparable (e.g. boolean vs
number), cross-field rules are skipped silently rather than emitting a misleading
error.

### Where we decided to stop

The format deliberately cannot express:

- Compound conditions (AND / OR of multiple fields)
- `not_equals`, `in`, regex, or substring matching on other fields
- Cross-field comparisons on booleans, choices, files, or multi_choice values
- Form-level errors not tied to a specific field
- Chained or nested rule dependencies beyond direct field references
- Computed or derived values (only raw field values are compared)

These limits keep the definition format small and predictable for unseen client
definitions.

## Running the submission SPA

The hosted submission page lives in `app/` and imports the validation library
directly — no backend or database required.

```
pnpm install
pnpm dev       # local dev server (default http://localhost:5173)
pnpm build     # outputs to app/dist/
pnpm preview   # preview production build locally
pnpm test      # validation library tests (unchanged)
```

### Configuring content

Edit content under [`app/src/content/`](app/src/content/):

- **[`config.ts`](app/src/content/config.ts)** — re-exports; entry point for imports
- **[`sections.ts`](app/src/content/sections.ts)** — section list assembly
- **[`part-1.ts`](app/src/content/part-1.ts) … [`part-6-7.ts`](app/src/content/part-6-7.ts), [`part-5-event-stack.ts`](app/src/content/part-5-event-stack.ts)** — per-part copy
- **[`site-meta.ts`](app/src/content/site-meta.ts)** — Loom URL and transcript file registry
- **Section titles** for all parts
- **Loom embed URL** for Part 2 (`https://www.loom.com/embed/your-video-id`)
- **Transcript files** and optional external link for Part 8

Rich-text sections are read-only on the page. Word count is computed from the configured HTML content.

Drop transcript files into [`public/transcripts/`](public/transcripts/) and register
them in `config.ts`.

### Deploying

Run `pnpm build` and deploy the contents of `app/dist/` to Vercel, Netlify, or
GitHub Pages.
