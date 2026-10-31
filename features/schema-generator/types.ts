export const SCHEMA_TYPE_IDS = [
  "article",
  "faq",
  "breadcrumb",
  "howto",
  "product",
  "recipe",
  "event",
  "jobPosting",
  "localBusiness",
  "organization",
  "person",
  "video",
  "website",
  "softwareApplication",
  "course",
  "service",
] as const;

export type SchemaTypeId = (typeof SCHEMA_TYPE_IDS)[number];

export type SchemaSupport = "google" | "limited" | "retired" | "schema";

export type SchemaFieldKind =
  | "text"
  | "textarea"
  | "url"
  | "date"
  | "datetime-local"
  | "number"
  | "select"
  | "checkbox"
  | "list";

export type SchemaFieldOption = {
  label: string;
  value: string;
};

export type SchemaFieldDefinition = {
  id: string;
  label: string;
  kind: SchemaFieldKind;
  required?: boolean;
  recommended?: boolean;
  placeholder?: string;
  hint?: string;
  options?: SchemaFieldOption[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
};

export type SchemaSectionDefinition = {
  id: string;
  title: string;
  description: string;
  fields: SchemaFieldDefinition[];
};

export type SchemaRepeaterDefinition = {
  id: string;
  label: string;
  description: string;
  itemLabel: string;
  minItems?: number;
  recommended?: boolean;
  fields: SchemaFieldDefinition[];
};

export type SchemaRepeaterItem = Record<string, string> & { _key: string };

export type SchemaDefinition = {
  id: SchemaTypeId;
  label: string;
  schemaType: string;
  support: SchemaSupport;
  supportLabel: string;
  summary: string;
  useWhen: string;
  warning?: string;
  sections: SchemaSectionDefinition[];
  repeaters?: SchemaRepeaterDefinition[];
  sample: {
    pageUrl: string;
    pageContext: string;
    values: Record<string, string | boolean>;
    repeaters?: Record<string, Array<Record<string, string>>>;
  };
};

export type SchemaFormState = {
  schemaType: SchemaTypeId;
  pageUrl: string;
  pageContext: string;
  values: Record<string, string | boolean>;
  repeaters: Record<string, SchemaRepeaterItem[]>;
  includeWebPage: boolean;
  includeBreadcrumbs: boolean;
  breadcrumbs: SchemaRepeaterItem[];
  visibleContentConfirmed: boolean;
};

export type JsonLdValue =
  string | number | boolean | null | JsonLdObject | JsonLdValue[];

export type JsonLdObject = { [key: string]: JsonLdValue | undefined };

export type SchemaIssue = {
  id: string;
  severity: "error" | "warning" | "recommendation" | "pass";
  title: string;
  message: string;
  fieldId?: string;
};

export type SchemaEvaluation = {
  score: number;
  publishReady: boolean;
  requiredComplete: number;
  requiredTotal: number;
  recommendedComplete: number;
  recommendedTotal: number;
  nodeCount: number;
  issues: SchemaIssue[];
};

export type SchemaSuggestion = {
  fieldId: string;
  value: string;
  evidence: string;
};

export type SchemaAnalysisResponse = {
  analysis: {
    suggestedType: SchemaTypeId;
    confidence: "high" | "medium" | "low";
    rationale: string;
    suggestions: SchemaSuggestion[];
    warnings: string[];
    extracted: {
      title: string;
      description: string;
      canonicalUrl: string;
      imageUrl: string;
      existingSchemaTypes: string[];
    };
  };
  meta: {
    analyzedAt: string;
    model: string;
    fetchedUrl: boolean;
    remaining: number;
  };
};
