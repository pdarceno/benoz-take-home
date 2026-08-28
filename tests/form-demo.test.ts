import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "../lib/validator";
import { ClientDefinition, RecordData } from "../lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));

function load(name: string): ClientDefinition {
  return JSON.parse(
    readFileSync(join(__dirname, "..", "definitions", name), "utf-8")
  ) as ClientDefinition;
}

const fleet = load("client-1-fleet-service.json");
const course = load("client-2-course-enrollment.json");
const venue = load("client-3-venue-booking.json");
const advanced = load("demo-advanced-rules.json");

const clients: { name: string; definition: ClientDefinition }[] = [
  { name: "Fleet Service", definition: fleet },
  { name: "Course Enrollment", definition: course },
  { name: "Venue Booking", definition: venue },
  { name: "Rules Showcase", definition: advanced },
];

function requiredFieldNames(definition: ClientDefinition): string[] {
  return definition.fields.filter((f) => f.required).map((f) => f.name);
}

describe("form testing — validation demo forms", () => {
  for (const { name, definition } of clients) {
    describe(name, () => {
      it("pass 1: empty submission reports required field errors", () => {
        const errors = validate(definition, {});
        const required = requiredFieldNames(definition);
        for (const field of required) {
          expect(errors.some((e) => e.field === field)).toBe(true);
        }
      });

      it("pass 2: invalid data produces field errors (no crash)", () => {
        const invalid: RecordData = {};
        for (const field of definition.fields) {
          switch (field.type) {
            case "text":
            case "long_text":
            case "file":
              invalid[field.name] = "<script>alert('xss')</script>";
              break;
            case "number":
              invalid[field.name] = "not-a-number";
              break;
            case "date":
              invalid[field.name] = "not-a-date";
              break;
            case "boolean":
              invalid[field.name] = "not-boolean";
              break;
            case "choice":
              invalid[field.name] = "invalid-option";
              break;
            case "multi_choice":
              invalid[field.name] = ["invalid-option"];
              break;
          }
        }
        const errors = validate(definition, invalid);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  }

  describe("Fleet Service", () => {
    it("pass 3: valid scenario succeeds", () => {
      const errors = validate(fleet, {
        plate_number: "AB-1234",
        vehicle_kind: "van",
        service_date: "2026-05-01",
        next_service_date: "2026-11-01",
        odometer_km: 120000,
        roadworthy: true,
      });
      expect(errors).toEqual([]);
    });

    it("conditional required: mechanic_notes when not roadworthy", () => {
      const errors = validate(fleet, {
        plate_number: "AB-1234",
        vehicle_kind: "van",
        service_date: "2026-05-01",
        odometer_km: 120000,
        roadworthy: false,
      });
      expect(errors.some((e) => e.field === "mechanic_notes")).toBe(true);
    });

    it("cross-field: next_service_date before service_date", () => {
      const errors = validate(fleet, {
        plate_number: "AB-1234",
        vehicle_kind: "van",
        service_date: "2026-05-10",
        next_service_date: "2026-05-01",
        odometer_km: 120000,
        roadworthy: true,
      });
      expect(errors.some((e) => e.field === "next_service_date")).toBe(true);
    });
  });

  describe("Course Enrollment", () => {
    it("pass 3: valid beginner succeeds", () => {
      const errors = validate(course, {
        enrollment_code: "abc123",
        course_level: "beginner",
        modules_selected: ["theory"],
        start_date: "2026-09-01",
      });
      expect(errors).toEqual([]);
    });

    it("conditional required: end_date when advanced", () => {
      const errors = validate(course, {
        enrollment_code: "abc123",
        course_level: "advanced",
        modules_selected: ["lab", "exam"],
        start_date: "2026-09-01",
      });
      expect(errors.some((e) => e.field === "end_date")).toBe(true);
    });

    it("cross-field: end before start", () => {
      const errors = validate(course, {
        enrollment_code: "abc123",
        course_level: "advanced",
        modules_selected: ["lab", "exam"],
        start_date: "2026-09-15",
        end_date: "2026-09-01",
      });
      expect(errors.some((e) => e.error.includes("before start date"))).toBe(true);
    });
  });

  describe("Venue Booking", () => {
    it("pass 3: valid single day succeeds", () => {
      const errors = validate(venue, {
        booking_ref: "BK123456",
        hall: "main",
        booking_type: "single_day",
        event_date: "2026-10-10",
        expected_guests: 40,
      });
      expect(errors).toEqual([]);
    });

    it("invalid booking_ref pattern", () => {
      const errors = validate(venue, {
        booking_ref: "INVALID",
        hall: "main",
        booking_type: "single_day",
        event_date: "2026-10-10",
        expected_guests: 40,
      });
      expect(errors.some((e) => e.field === "booking_ref")).toBe(true);
    });

    it("conditional required: event_end_date when multi_day", () => {
      const errors = validate(venue, {
        booking_ref: "BK123456",
        hall: "main",
        booking_type: "multi_day",
        event_date: "2026-10-10",
        expected_guests: 40,
      });
      expect(errors.some((e) => e.field === "event_end_date")).toBe(true);
    });
  });

  describe("Rules Showcase", () => {
    it("evaluation order: invalid start_date still triggers conditional required", () => {
      const errors = validate(advanced, {
        event_type: "multi_day",
        start_date: "14:30",
      });
      expect(errors.filter((e) => e.field === "start_date")).toHaveLength(1);
      expect(errors.some((e) => e.field === "end_date" && e.error === "This field is required")).toBe(true);
      expect(errors.some((e) => e.error.includes("before start date"))).toBe(false);
    });
  });
});
