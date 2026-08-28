import { FieldDefinition } from "@lib/types";
import { ChangeEvent } from "react";

interface DynamicFieldProps {
  field: FieldDefinition;
  value: unknown;
  errors: string[];
  onChange: (value: unknown) => void;
}

function FieldErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="space-y-1">
      {errors.map((error) => (
        <p key={error} className="field-error" role="alert">
          {error}
        </p>
      ))}
    </div>
  );
}

export function DynamicField({ field, value, errors, onChange }: DynamicFieldProps) {
  const label = (
    <label htmlFor={field.name} className="field-label">
      {field.label}
      {(field.required || field.required_when) && (
        <span className="text-red-600" aria-hidden="true">
          {" "}
          *
        </span>
      )}
    </label>
  );

  const hasError = errors.length > 0;
  const inputClass = `${field.type === "long_text" ? "field-input min-h-[96px]" : "field-input"} ${
    hasError ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""
  }`;

  switch (field.type) {
    case "text":
      return (
        <div>
          {label}
          <input
            id={field.name}
            type="text"
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(event.target.value)
            }
          />
          <FieldErrors errors={errors} />
        </div>
      );

    case "long_text":
      return (
        <div>
          {label}
          <textarea
            id={field.name}
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              onChange(event.target.value)
            }
          />
          <FieldErrors errors={errors} />
        </div>
      );

    case "number":
      return (
        <div>
          {label}
          <input
            id={field.name}
            type="number"
            className={inputClass}
            value={typeof value === "number" ? value : ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const next = event.target.value;
              onChange(next === "" ? undefined : Number(next));
            }}
          />
          <FieldErrors errors={errors} />
        </div>
      );

    case "date":
      return (
        <div>
          {label}
          <input
            id={field.name}
            type="date"
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(event.target.value)
            }
          />
          <FieldErrors errors={errors} />
        </div>
      );

    case "boolean":
      return (
        <div>
          <label className="flex min-h-11 items-center gap-3">
            <input
              id={field.name}
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={value === true}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChange(event.target.checked)
              }
            />
            <span className="text-sm font-medium text-slate-700">
              {field.label}
              {field.required && (
                <span className="text-red-600" aria-hidden="true">
                  {" "}
                  *
                </span>
              )}
            </span>
          </label>
          <FieldErrors errors={errors} />
        </div>
      );

    case "choice":
      return (
        <div>
          {label}
          <select
            id={field.name}
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              onChange(event.target.value)
            }
          >
            <option value="">Select…</option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldErrors errors={errors} />
        </div>
      );

    case "multi_choice": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset>
          <legend className="field-label mb-2">
            {field.label}
            {field.required && (
              <span className="text-red-600" aria-hidden="true">
                {" "}
                *
              </span>
            )}
          </legend>
          <div className="space-y-2">
            {(field.options ?? []).map((option) => (
              <label key={option} className="flex min-h-11 items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={selected.includes(option)}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (event.target.checked) {
                      onChange([...selected, option]);
                    } else {
                      onChange(selected.filter((item) => item !== option));
                    }
                  }}
                />
                <span className="text-sm text-slate-700">{option}</span>
              </label>
            ))}
          </div>
          <FieldErrors errors={errors} />
        </fieldset>
      );
    }

    case "file":
      return (
        <div>
          {label}
          <input
            id={field.name}
            type="text"
            placeholder="filename.pdf"
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(event.target.value)
            }
          />
          {field.constraints?.accepted && (
            <p className="mt-1 text-xs text-slate-500">
              Accepted: .{field.constraints.accepted.join(", .")}
            </p>
          )}
          <FieldErrors errors={errors} />
        </div>
      );

    default:
      return null;
  }
}
