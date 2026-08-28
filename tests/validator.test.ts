import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { validate } from "../lib/validator";
import { ClientDefinition } from "../lib/types";

function load(name: string): ClientDefinition {
  const raw = readFileSync(join(__dirname, "..", "definitions", name), "utf-8");
  return JSON.parse(raw) as ClientDefinition;
}

const fleet = load("client-1-fleet-service.json");
const course = load("client-2-course-enrollment.json");
const venue = load("client-3-venue-booking.json");

const errorsFor = (result: { field: string; error: string }[], field: string) =>
  result.filter((e) => e.field === field);

describe("required fields", () => {
  it("reports every missing required field", () => {
    const result = validate(fleet, {});
    expect(errorsFor(result, "plate_number")).toHaveLength(1);
    expect(errorsFor(result, "vehicle_kind")).toHaveLength(1);
    expect(errorsFor(result, "service_date")).toHaveLength(1);
    expect(errorsFor(result, "odometer_km")).toHaveLength(1);
  });

  it("treats a whitespace-only string as missing", () => {
    const result = validate(course, {
      enrollment_code: "   ",
      course_level: "beginner",
      modules_selected: ["theory"],
      start_date: "2026-09-01",
    });
    expect(errorsFor(result, "enrollment_code")).toHaveLength(1);
  });

  it("does not complain about an absent optional field", () => {
    const result = validate(venue, {
      booking_ref: "BK123456",
      hall: "main",
      booking_type: "single_day",
      event_date: "2026-10-10",
      expected_guests: 40,
    });
    expect(result).toEqual([]);
  });
});

describe("text constraints", () => {
  it("enforces pattern", () => {
    const base = {
      vehicle_kind: "van",
      service_date: "2026-05-01",
      odometer_km: 120000,
    };
    expect(validate(fleet, { ...base, plate_number: "AB-1234" })).toEqual([]);
    expect(
      errorsFor(validate(fleet, { ...base, plate_number: "ab-1234" }), "plate_number")
    ).toHaveLength(1);
  });

  it("enforces min_length and max_length", () => {
    const base = {
      course_level: "advanced",
      modules_selected: ["lab", "exam"],
      start_date: "2026-09-01",
      end_date: "2026-09-15",
    };
    expect(
      errorsFor(validate(course, { ...base, enrollment_code: "abc" }), "enrollment_code")
    ).toHaveLength(1);
    expect(
      errorsFor(
        validate(course, { ...base, enrollment_code: "a".repeat(13) }),
        "enrollment_code"
      )
    ).toHaveLength(1);
    expect(validate(course, { ...base, enrollment_code: "abc123" })).toEqual([]);
  });

  it("enforces max_length on long_text", () => {
    const record = {
      plate_number: "AB-1234",
      vehicle_kind: "car",
      service_date: "2026-05-01",
      odometer_km: 500,
      mechanic_notes: "x".repeat(1501),
    };
    expect(errorsFor(validate(fleet, record), "mechanic_notes")).toHaveLength(1);
  });
});

describe("number constraints", () => {
  it("rejects non-numbers and out-of-range values", () => {
    const base = {
      plate_number: "AB-1234",
      vehicle_kind: "truck",
      service_date: "2026-05-01",
    };
    expect(
      errorsFor(validate(fleet, { ...base, odometer_km: "many" }), "odometer_km")
    ).toHaveLength(1);
    expect(
      errorsFor(validate(fleet, { ...base, odometer_km: -5 }), "odometer_km")
    ).toHaveLength(1);
    expect(validate(fleet, { ...base, odometer_km: 0 })).toEqual([]);
  });

  it("supports min without max", () => {
    const base = {
      booking_ref: "BK000001",
      hall: "annex",
      booking_type: "single_day",
      event_date: "2026-12-01",
    };
    expect(
      errorsFor(validate(venue, { ...base, expected_guests: 0 }), "expected_guests")
    ).toHaveLength(1);
    expect(validate(venue, { ...base, expected_guests: 100000 })).toEqual([]);
  });
});

describe("dates", () => {
  it("rejects malformed and impossible dates", () => {
    const base = {
      plate_number: "AB-1234",
      vehicle_kind: "van",
      odometer_km: 10,
    };
    expect(
      errorsFor(validate(fleet, { ...base, service_date: "01/05/2026" }), "service_date")
    ).toHaveLength(1);
    expect(
      errorsFor(validate(fleet, { ...base, service_date: "2026-13-40" }), "service_date")
    ).toHaveLength(1);
    expect(validate(fleet, { ...base, service_date: "2026-05-01" })).toEqual([]);
  });
});

describe("choice and multi_choice", () => {
  it("rejects a value outside the options", () => {
    const record = {
      booking_ref: "BK123456",
      hall: "garden",
      booking_type: "single_day",
      event_date: "2026-10-10",
      expected_guests: 10,
    };
    expect(errorsFor(validate(venue, record), "hall")).toHaveLength(1);
  });

  it("enforces min_selected and max_selected", () => {
    const base = {
      enrollment_code: "abc123",
      course_level: "beginner",
      start_date: "2026-09-01",
    };
    expect(
      errorsFor(validate(course, { ...base, modules_selected: [] }), "modules_selected")
    ).toHaveLength(1);
    expect(
      errorsFor(
        validate(course, {
          ...base,
          modules_selected: ["theory", "lab", "fieldwork", "project", "exam"],
        }),
        "modules_selected"
      )
    ).toHaveLength(1);
  });

  it("rejects unknown and duplicate selections", () => {
    const base = {
      enrollment_code: "abc123",
      course_level: "beginner",
      start_date: "2026-09-01",
    };
    expect(
      errorsFor(
        validate(course, { ...base, modules_selected: ["theory", "swimming"] }),
        "modules_selected"
      )
    ).toHaveLength(1);
    expect(
      errorsFor(
        validate(course, { ...base, modules_selected: ["lab", "lab"] }),
        "modules_selected"
      )
    ).toHaveLength(1);
  });
});

describe("booleans and files", () => {
  it("rejects a non-boolean for a boolean field", () => {
    const record = {
      plate_number: "AB-1234",
      vehicle_kind: "van",
      service_date: "2026-05-01",
      odometer_km: 10,
      roadworthy: "yes",
    };
    expect(errorsFor(validate(fleet, record), "roadworthy")).toHaveLength(1);
  });

  it("enforces accepted file extensions, case-insensitively", () => {
    const base = {
      booking_ref: "BK123456",
      hall: "main",
      booking_type: "single_day",
      event_date: "2026-10-10",
      expected_guests: 10,
    };
    expect(
      errorsFor(validate(venue, { ...base, floor_plan: "plan.docx" }), "floor_plan")
    ).toHaveLength(1);
    expect(validate(venue, { ...base, floor_plan: "plan.PDF" })).toEqual([]);
  });
});

describe("fail-closed behaviour", () => {
  it("reports unknown fields instead of ignoring them", () => {
    const record = {
      plate_number: "AB-1234",
      vehicle_kind: "van",
      service_date: "2026-05-01",
      odometer_km: 10,
      secret_flag: true,
    };
    expect(errorsFor(validate(fleet, record), "secret_flag")).toHaveLength(1);
  });

  it("works for any definition it is given, with no client knowledge", () => {
    const adHoc = {
      client: "anyone",
      record_type: "anything",
      fields: [
        { name: "title", label: "Title", type: "text" as const, required: true },
      ],
    };
    expect(validate(adHoc, { title: "hello" })).toEqual([]);
    expect(errorsFor(validate(adHoc, {}), "title")).toHaveLength(1);
  });
});

describe("conditional required", () => {
  const definition: ClientDefinition = {
    client: "test",
    record_type: "booking",
    fields: [
      {
        name: "event_type",
        label: "Event type",
        type: "choice",
        required: true,
        options: ["single_day", "multi_day"],
      },
      {
        name: "end_date",
        label: "End date",
        type: "date",
        required: false,
        required_when: { field: "event_type", equals: "multi_day" },
      },
    ],
  };

  it("requires the target field when the condition matches and it is empty", () => {
    const result = validate(definition, { event_type: "multi_day" });
    expect(errorsFor(result, "end_date")).toEqual([
      { field: "end_date", error: "This field is required" },
    ]);
  });

  it("does not require the target field when the condition does not match", () => {
    const result = validate(definition, { event_type: "single_day" });
    expect(errorsFor(result, "end_date")).toHaveLength(0);
  });

  it("skips conditional required when the condition field is missing", () => {
    const result = validate(definition, {});
    expect(errorsFor(result, "end_date")).toHaveLength(0);
    expect(errorsFor(result, "event_type")).toHaveLength(1);
  });

  it("skips conditional required when the condition field has its own validation error", () => {
    const result = validate(definition, { event_type: "invalid" });
    expect(errorsFor(result, "end_date")).toHaveLength(0);
    expect(errorsFor(result, "event_type")).toHaveLength(1);
  });
});

describe("cross-field rules", () => {
  const dateDefinition: ClientDefinition = {
    client: "test",
    record_type: "booking",
    fields: [
      { name: "start_date", label: "Start date", type: "date", required: true },
      { name: "end_date", label: "End date", type: "date", required: true },
    ],
    rules: [
      {
        type: "gte",
        left: "end_date",
        right: "start_date",
        message: "End date must not be before start date",
      },
    ],
  };

  const numberDefinition: ClientDefinition = {
    client: "test",
    record_type: "range",
    fields: [
      { name: "min_value", label: "Minimum", type: "number", required: true },
      { name: "max_value", label: "Maximum", type: "number", required: true },
    ],
    rules: [{ type: "gte", left: "max_value", right: "min_value" }],
  };

  it("passes when end is on or after start for dates", () => {
    const result = validate(dateDefinition, {
      start_date: "2026-05-01",
      end_date: "2026-05-10",
    });
    expect(result).toEqual([]);
  });

  it("fails when end is before start for dates", () => {
    const result = validate(dateDefinition, {
      start_date: "2026-05-10",
      end_date: "2026-05-01",
    });
    expect(errorsFor(result, "end_date")).toEqual([
      {
        field: "end_date",
        error: "End date must not be before start date",
      },
    ]);
  });

  it("passes when max is greater than or equal to min for numbers", () => {
    const result = validate(numberDefinition, { min_value: 1, max_value: 10 });
    expect(result).toEqual([]);
  });

  it("fails when max is less than min for numbers", () => {
    const result = validate(numberDefinition, { min_value: 10, max_value: 1 });
    expect(errorsFor(result, "max_value")).toHaveLength(1);
  });

  it("skips cross-field rules when a referenced field has a phase 1 error", () => {
    const result = validate(dateDefinition, {
      start_date: "14:30",
      end_date: "2026-05-01",
    });
    expect(errorsFor(result, "start_date")).toHaveLength(1);
    expect(errorsFor(result, "end_date")).toHaveLength(0);
  });

  it("skips cross-field rules when a referenced field is empty", () => {
    const result = validate(dateDefinition, { start_date: "2026-05-01" });
    expect(errorsFor(result, "end_date")).toHaveLength(1);
    expect(result.filter((e) => e.field === "end_date")).toHaveLength(1);
    expect(result.some((e) => e.error.includes("before start date"))).toBe(false);
  });
});

describe("evaluation order", () => {
  const definition: ClientDefinition = {
    client: "test",
    record_type: "booking",
    fields: [
      {
        name: "event_type",
        label: "Event type",
        type: "choice",
        required: true,
        options: ["single_day", "multi_day"],
      },
      { name: "start_date", label: "Start date", type: "date", required: true },
      {
        name: "end_date",
        label: "End date",
        type: "date",
        required: false,
        required_when: { field: "event_type", equals: "multi_day" },
      },
    ],
    rules: [
      {
        type: "gte",
        left: "end_date",
        right: "start_date",
        message: "End date must not be before start date",
      },
    ],
  };

  it("shows start_date and conditional required errors when start_date is invalid", () => {
    const result = validate(definition, {
      event_type: "multi_day",
      start_date: "14:30",
    });
    expect(errorsFor(result, "start_date")).toHaveLength(1);
    expect(errorsFor(result, "end_date")).toEqual([
      { field: "end_date", error: "This field is required" },
    ]);
    expect(result.some((e) => e.error.includes("before start date"))).toBe(false);
  });

  it("shows only the conditional required error when end_date is empty", () => {
    const result = validate(definition, {
      event_type: "multi_day",
      start_date: "2026-05-10",
    });
    expect(errorsFor(result, "end_date")).toEqual([
      { field: "end_date", error: "This field is required" },
    ]);
    expect(result.some((e) => e.error.includes("before start date"))).toBe(false);
  });

  it("shows only the cross-field error when both dates are valid but out of order", () => {
    const result = validate(definition, {
      event_type: "multi_day",
      start_date: "2026-05-10",
      end_date: "2026-05-01",
    });
    expect(errorsFor(result, "end_date")).toEqual([
      {
        field: "end_date",
        error: "End date must not be before start date",
      },
    ]);
    expect(result.filter((e) => e.field === "end_date")).toHaveLength(1);
  });
});
