import {
  ClientDefinition,
  CrossFieldRule,
  CrossFieldRuleType,
  FieldDefinition,
  RecordData,
  ValidationError,
  ValidationResult,
} from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}

function fieldHasError(errors: ValidationError[], fieldName: string): boolean {
  return errors.some((e) => e.field === fieldName);
}

function isFieldUsable(
  fieldName: string,
  record: RecordData,
  errors: ValidationError[]
): boolean {
  return !isEmpty(record[fieldName]) && !fieldHasError(errors, fieldName);
}

function validateField(field: FieldDefinition, value: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const err = (message: string) => errors.push({ field: field.name, error: message });
  const c = field.constraints ?? {};

  if (isEmpty(value)) {
    if (field.required) err("This field is required");
    return errors;
  }

  switch (field.type) {
    case "text":
    case "long_text": {
      if (typeof value !== "string") {
        err("Must be a string");
        break;
      }
      if (c.min_length !== undefined && value.length < c.min_length)
        err(`Must be at least ${c.min_length} characters`);
      if (c.max_length !== undefined && value.length > c.max_length)
        err(`Must be at most ${c.max_length} characters`);
      if (c.pattern !== undefined && !new RegExp(c.pattern).test(value))
        err("Does not match the required format");
      break;
    }

    case "number": {
      if (typeof value !== "number" || Number.isNaN(value)) {
        err("Must be a number");
        break;
      }
      if (c.min !== undefined && value < c.min) err(`Must be at least ${c.min}`);
      if (c.max !== undefined && value > c.max) err(`Must be at most ${c.max}`);
      break;
    }

    case "date": {
      if (typeof value !== "string" || !DATE_RE.test(value)) {
        err("Must be a date in YYYY-MM-DD format");
        break;
      }
      const parsed = new Date(`${value}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) err("Not a real calendar date");
      break;
    }

    case "boolean": {
      if (typeof value !== "boolean") err("Must be true or false");
      break;
    }

    case "choice": {
      if (typeof value !== "string" || !(field.options ?? []).includes(value))
        err(`Not an allowed value: ${String(value)}`);
      break;
    }

    case "multi_choice": {
      if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
        err("Must be a list of values");
        break;
      }
      const options = field.options ?? [];
      const bad = value.filter((v) => !options.includes(v as string));
      if (bad.length > 0) err(`Not allowed values: ${bad.join(", ")}`);
      if (new Set(value).size !== value.length) err("Contains duplicate values");
      if (c.min_selected !== undefined && value.length < c.min_selected)
        err(`Select at least ${c.min_selected}`);
      if (c.max_selected !== undefined && value.length > c.max_selected)
        err(`Select at most ${c.max_selected}`);
      break;
    }

    case "file": {
      // A file value is its filename (upload handling lives elsewhere).
      if (typeof value !== "string") {
        err("Must be a filename");
        break;
      }
      const ext = value.includes(".") ? value.split(".").pop()!.toLowerCase() : "";
      if (c.accepted !== undefined && !c.accepted.includes(ext))
        err(`File type not accepted: .${ext || "?"}`);
      break;
    }
  }

  return errors;
}

function validateConditionalRequired(
  fields: FieldDefinition[],
  record: RecordData,
  errors: ValidationError[]
): ValidationError[] {
  const conditionalErrors: ValidationError[] = [];

  for (const field of fields) {
    const condition = field.required_when;
    if (!condition || field.required) continue;

    if (!isFieldUsable(condition.field, record, errors)) continue;

    if (record[condition.field] !== condition.equals) continue;

    if (isEmpty(record[field.name])) {
      conditionalErrors.push({ field: field.name, error: "This field is required" });
    }
  }

  return conditionalErrors;
}

function parseDateValue(value: unknown): number | null {
  if (typeof value !== "string" || !DATE_RE.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getTime();
}

function comparableValues(
  left: unknown,
  right: unknown
): { left: number; right: number } | null {
  if (typeof left === "number" && typeof right === "number" && !Number.isNaN(left) && !Number.isNaN(right)) {
    return { left, right };
  }

  const leftDate = parseDateValue(left);
  const rightDate = parseDateValue(right);
  if (leftDate !== null && rightDate !== null) {
    return { left: leftDate, right: rightDate };
  }

  return null;
}

function defaultRuleMessage(type: CrossFieldRuleType, left: string, right: string): string {
  switch (type) {
    case "gte":
      return `${left} must be greater than or equal to ${right}`;
    case "lte":
      return `${left} must be less than or equal to ${right}`;
    case "gt":
      return `${left} must be greater than ${right}`;
    case "lt":
      return `${left} must be less than ${right}`;
    case "eq":
      return `${left} must equal ${right}`;
    case "neq":
      return `${left} must not equal ${right}`;
  }
}

function rulePasses(type: CrossFieldRuleType, left: number, right: number): boolean {
  switch (type) {
    case "gte":
      return left >= right;
    case "lte":
      return left <= right;
    case "gt":
      return left > right;
    case "lt":
      return left < right;
    case "eq":
      return left === right;
    case "neq":
      return left !== right;
  }
}

function validateCrossFieldRules(
  rules: CrossFieldRule[],
  record: RecordData,
  errors: ValidationError[]
): ValidationError[] {
  const ruleErrors: ValidationError[] = [];

  for (const rule of rules) {
    if (!isFieldUsable(rule.left, record, errors)) continue;
    if (!isFieldUsable(rule.right, record, errors)) continue;

    const values = comparableValues(record[rule.left], record[rule.right]);
    if (values === null) continue;

    if (!rulePasses(rule.type, values.left, values.right)) {
      ruleErrors.push({
        field: rule.error_field ?? rule.left,
        error: rule.message ?? defaultRuleMessage(rule.type, rule.left, rule.right),
      });
    }
  }

  return ruleErrors;
}

/**
 * Validate one record against a client definition.
 * Returns an empty array when the record is valid.
 *
 * Unknown keys in the record (keys with no field definition) are reported
 * as errors: the engine fails closed on fields it does not recognise.
 */
export function validate(
  definition: ClientDefinition,
  record: RecordData
): ValidationResult {
  const errors: ValidationError[] = [];

  // Phase 1: per-field validation (type, constraints, static required)
  for (const field of definition.fields) {
    errors.push(...validateField(field, record[field.name]));
  }

  const known = new Set(definition.fields.map((f) => f.name));
  for (const key of Object.keys(record)) {
    if (!known.has(key)) {
      errors.push({ field: key, error: "Unknown field" });
    }
  }

  // Phase 2: conditional required
  const conditionalErrors = validateConditionalRequired(
    definition.fields,
    record,
    errors
  );
  errors.push(...conditionalErrors);

  // Phase 3: cross-field rules
  if (definition.rules) {
    errors.push(...validateCrossFieldRules(definition.rules, record, errors));
  }

  return errors;
}
