import { ValidationError } from "@lib/types";

interface ValidationErrorsProps {
  errors: ValidationError[];
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (errors.length === 0) {
    return (
      <div
        className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        role="status"
      >
        Record is valid — no validation errors.
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
      role="alert"
      aria-live="polite"
    >
      <p className="mb-2 text-sm font-medium text-red-800">
        {errors.length} validation {errors.length === 1 ? "error" : "errors"}
      </p>
      <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
        {errors.map((error, index) => (
          <li key={`${error.field}-${error.error}-${index}`}>
            <span className="font-medium">{error.field}</span>: {error.error}
          </li>
        ))}
      </ul>
    </div>
  );
}
