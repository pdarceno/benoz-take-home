import { useEffect, useMemo, useState } from "react";
import { validate } from "@lib/validator";
import { ClientDefinition, RecordData, ValidationError } from "@lib/types";
import { ClientTabs } from "./ClientTabs";
import { DynamicField } from "./DynamicField";
import { ValidationErrors } from "./ValidationErrors";
import { clients, demoScenarios } from "./demoFixtures";

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

  useEffect(() => {
    setErrors([]);
    setValidated(false);
  }, [activeId]);

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
