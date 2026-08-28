import { ClientDefinition, RecordData } from "@lib/types";
import fleetDef from "@definitions/client-1-fleet-service.json";
import courseDef from "@definitions/client-2-course-enrollment.json";
import venueDef from "@definitions/client-3-venue-booking.json";
import advancedDef from "@definitions/demo-advanced-rules.json";

export const clients = [
  { id: "fleet", label: "Fleet Service", definition: fleetDef as ClientDefinition },
  {
    id: "course",
    label: "Course Enrollment",
    definition: courseDef as ClientDefinition,
  },
  { id: "venue", label: "Venue Booking", definition: venueDef as ClientDefinition },
  {
    id: "advanced",
    label: "Rules Showcase",
    definition: advancedDef as ClientDefinition,
  },
];

export const demoScenarios: Record<string, { label: string; record: RecordData }[]> = {
  fleet: [
    {
      label: "Valid record",
      record: {
        plate_number: "AB-1234",
        vehicle_kind: "van",
        service_date: "2026-05-01",
        next_service_date: "2026-11-01",
        odometer_km: 120000,
        roadworthy: true,
      },
    },
    {
      label: "Notes required (not roadworthy)",
      record: {
        plate_number: "AB-1234",
        vehicle_kind: "van",
        service_date: "2026-05-01",
        odometer_km: 120000,
        roadworthy: false,
      },
    },
    {
      label: "Next service before service date",
      record: {
        plate_number: "AB-1234",
        vehicle_kind: "van",
        service_date: "2026-05-10",
        next_service_date: "2026-05-01",
        odometer_km: 120000,
        roadworthy: true,
      },
    },
  ],
  course: [
    {
      label: "Valid beginner",
      record: {
        enrollment_code: "abc123",
        course_level: "beginner",
        modules_selected: ["theory"],
        start_date: "2026-09-01",
      },
    },
    {
      label: "Missing end date (advanced)",
      record: {
        enrollment_code: "abc123",
        course_level: "advanced",
        modules_selected: ["lab", "exam"],
        start_date: "2026-09-01",
      },
    },
    {
      label: "End before start",
      record: {
        enrollment_code: "abc123",
        course_level: "advanced",
        modules_selected: ["lab", "exam"],
        start_date: "2026-09-15",
        end_date: "2026-09-01",
      },
    },
  ],
  venue: [
    {
      label: "Valid single day",
      record: {
        booking_ref: "BK123456",
        hall: "main",
        booking_type: "single_day",
        event_date: "2026-10-10",
        expected_guests: 40,
      },
    },
    {
      label: "Missing end date (multi-day)",
      record: {
        booking_ref: "BK123456",
        hall: "main",
        booking_type: "multi_day",
        event_date: "2026-10-10",
        expected_guests: 40,
      },
    },
    {
      label: "End before start",
      record: {
        booking_ref: "BK123456",
        hall: "main",
        booking_type: "multi_day",
        event_date: "2026-10-10",
        event_end_date: "2026-10-05",
        expected_guests: 40,
      },
    },
  ],
  advanced: [
    {
      label: "Invalid start date",
      record: {
        event_type: "multi_day",
        start_date: "14:30",
      },
    },
    {
      label: "Missing end date",
      record: {
        event_type: "multi_day",
        start_date: "2026-05-10",
      },
    },
    {
      label: "End before start",
      record: {
        event_type: "multi_day",
        start_date: "2026-05-10",
        end_date: "2026-05-01",
      },
    },
  ],
};
