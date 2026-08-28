export type FieldType =
  | "text"
  | "long_text"
  | "number"
  | "date"
  | "boolean"
  | "choice"
  | "multi_choice"
  | "file";

export interface Constraints {
  pattern?: string;
  min?: number;
  max?: number;
  min_length?: number;
  max_length?: number;
  min_selected?: number;
  max_selected?: number;
  accepted?: string[]; // file extensions, lowercase, no dot
}

export interface RequiredWhen {
  field: string;
  equals: string | number | boolean;
}

export type CrossFieldRuleType = "gte" | "lte" | "gt" | "lt" | "eq" | "neq";

export interface CrossFieldRule {
  type: CrossFieldRuleType;
  left: string;
  right: string;
  message?: string;
  error_field?: string;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for choice / multi_choice
  constraints?: Constraints;
  required_when?: RequiredWhen;
  sensitivity?: string; // metadata only; the validator ignores it
}

export interface ClientDefinition {
  client: string;
  record_type: string;
  fields: FieldDefinition[];
  rules?: CrossFieldRule[];
}

export type RecordData = Record<string, unknown>;

export interface ValidationError {
  field: string;
  error: string;
}

export type ValidationResult = ValidationError[];
