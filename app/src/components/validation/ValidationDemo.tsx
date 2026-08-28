import { useMemo, useState } from "react";
import { validate } from "@lib/validator";
import { ClientDefinition, RecordData, ValidationError } from "@lib/types";
import fleetDef from "@definitions/client-1-fleet-service.json";
import courseDef from "@definitions/client-2-course-enrollment.json";
import venueDef from "@definitions/client-3-venue-booking.json";
import advancedDef from "@definitions/demo-advanced-rules.json";
import { ClientTabs } from "./ClientTabs";
import { DynamicField } from "./DynamicField";
import { ValidationErrors } from "./ValidationErrors";

const clients = [
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

const demoScenarios: Record<string, { label: string; record: RecordData }[]> = {
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

function emptyRecord(definition: ClientDefinition): RecordData {
  return Object.fromEntries(definition.fields.map((field) => [field.name, undefined]));
}

function RulesPanel({ definition }: { definition: ClientDefinition }) {
  const conditionalFields = definition.fields.filter((field) => field.required_when);
  const crossFieldRules = definition.rules ?? [];

  if (conditionalFields.length === 0 && crossFieldRules.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        This client uses per-field constraints only (pattern, min/max, etc.).
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm text-slate-700">
      {conditionalFields.map((field) => (
        <p key={field.name}>
          <span className="font-medium">{field.name}</span> is required when{" "}
          <span className="font-medium">{field.required_when!.field}</span> equals{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            {JSON.stringify(field.required_when!.equals)}
          </code>
        </p>
      ))}
      {crossFieldRules.map((rule, index) => (
        <p key={`${rule.left}-${rule.right}-${index}`}>
          Cross-field: <span className="font-medium">{rule.left}</span>{" "}
          {rule.type} <span className="font-medium">{rule.right}</span>
          {rule.message ? ` — ${rule.message}` : ""}
        </p>
      ))}
    </div>
  );
}

export function ValidationDemo() {
  const [activeId, setActiveId] = useState(clients[0].id);
  const [records, setRecords] = useState<Record<string, RecordData>>(() =>
    Object.fromEntries(clients.map((client) => [client.id, emptyRecord(client.definition)]))
  );
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [validated, setValidated] = useState(false);

  const activeClient = useMemo(
    () => clients.find((client) => client.id === activeId) ?? clients[0],
    [activeId]
  );

  const currentRecord = records[activeId] ?? emptyRecord(activeClient.definition);

  const errorsByField = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const error of errors) {
      const existing = map.get(error.field) ?? [];
      map.set(error.field, [...existing, error.error]);
    }
    return map;
  }, [errors]);

  const updateField = (fieldName: string, value: unknown) => {
    setRecords((prev) => ({
      ...prev,
      [activeId]: { ...prev[activeId], [fieldName]: value },
    }));
    setValidated(false);
  };

  const runValidation = () => {
    const result = validate(activeClient.definition, currentRecord);
    setErrors(result);
    setValidated(true);
  };

  const loadScenario = (scenario: RecordData) => {
    setRecords((prev) => ({ ...prev, [activeId]: scenario }));
    setValidated(false);
    setErrors([]);
  };

  const scenarios = demoScenarios[activeId] ?? [];

  return (
    <div className="space-y-6">
      <ClientTabs clients={clients} activeId={activeId} onChange={setActiveId} />

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Active rules
        </p>
        <RulesPanel definition={activeClient.definition} />
      </div>

      {scenarios.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="flex w-full text-xs font-semibold uppercase tracking-wide text-slate-500">
            Try a scenario
          </span>
          {scenarios.map((scenario) => (
            <button
              key={scenario.label}
              type="button"
              className="btn-secondary"
              onClick={() => loadScenario(scenario.record)}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      )}

      <form
        className="grid gap-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          runValidation();
        }}
      >
        {activeClient.definition.fields.map((field) => (
          <div
            key={field.name}
            className={field.type === "long_text" || field.type === "multi_choice" ? "sm:col-span-2" : ""}
          >
            <DynamicField
              field={field}
              value={currentRecord[field.name]}
              errors={validated ? (errorsByField.get(field.name) ?? []) : []}
              onChange={(value) => updateField(field.name, value)}
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary">
            Validate
          </button>
        </div>
      </form>

      {validated && <ValidationErrors errors={errors} />}
    </div>
  );
}
