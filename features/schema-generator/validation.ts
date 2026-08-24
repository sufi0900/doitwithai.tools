import { compileSchema, splitLines } from "./compiler";
import { getSchemaDefinition } from "./config";
import type {
  SchemaEvaluation,
  SchemaFieldDefinition,
  SchemaFormState,
  SchemaIssue,
} from "./types";

function rawValue(state: SchemaFormState, id: string) {
  return state.values[id];
}

function stringValue(state: SchemaFormState, id: string) {
  const value = rawValue(state, id);
  return typeof value === "string" ? value.trim() : "";
}

function complete(value: string | boolean | undefined, kind?: string) {
  if (kind === "checkbox") return value === true;
  if (typeof value === "boolean") return value;
  return typeof value === "string" && value.trim().length > 0;
}

function isAbsoluteHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function issue(
  id: string,
  severity: SchemaIssue["severity"],
  title: string,
  message: string,
  fieldId?: string,
): SchemaIssue {
  return { id, severity, title, message, fieldId };
}

function allFields(state: SchemaFormState) {
  const definition = getSchemaDefinition(state.schemaType);
  return definition.sections.flatMap((section) => section.fields);
}

function addDateOrderIssue(
  issues: SchemaIssue[],
  state: SchemaFormState,
  startId: string,
  endId: string,
  title: string,
) {
  const start = stringValue(state, startId);
  const end = stringValue(state, endId);
  if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
    issues.push(
      issue(
        `${startId}-${endId}-order`,
        "error",
        title,
        "The ending or later date must not be earlier than the starting date.",
        endId,
      ),
    );
  }
}

function validateConditionalRules(
  state: SchemaFormState,
  issues: SchemaIssue[],
) {
  const type = state.schemaType;

  if (type === "article") {
    const headline = stringValue(state, "headline");
    if (headline && (headline.length < 50 || headline.length > 110)) {
      issues.push(
        issue(
          "headline-focus",
          "recommendation",
          "Refine the schema headline",
          `${headline.length} characters. A focused, descriptive 50–110 character working range follows this tool’s methodology; it is not a Google hard limit.`,
          "headline",
        ),
      );
    }
    addDateOrderIssue(
      issues,
      state,
      "datePublished",
      "dateModified",
      "Check article dates",
    );
  }

  if (type === "product" || type === "recipe") {
    const rating = stringValue(state, "ratingValue");
    const count = stringValue(
      state,
      type === "product" ? "reviewCount" : "reviewCount",
    );
    if (Boolean(rating) !== Boolean(count)) {
      issues.push(
        issue(
          "rating-pair",
          "error",
          "Complete the aggregate rating pair",
          "A rating value and its review count must be supplied together, and both must match visible, authentic ratings.",
          rating ? "reviewCount" : "ratingValue",
        ),
      );
    }
    if (rating && count) {
      issues.push(
        issue(
          "rating-trust",
          "warning",
          "Verify rating authenticity",
          "Only publish ratings collected from real users and displayed on the marked-up page. Never generate or inflate review data.",
        ),
      );
    }
  }

  if (type === "event") {
    const attendance = stringValue(state, "attendanceMode");
    const timezoneOffset = stringValue(state, "timezoneOffset");
    if (
      timezoneOffset &&
      !/^[+-](?:0\d|1\d|2[0-3]):[0-5]\d$/.test(timezoneOffset)
    ) {
      issues.push(
        issue(
          "event-timezone-format",
          "error",
          "Correct the UTC offset",
          "Use the ±HH:MM format, such as +05:00 or -04:00.",
          "timezoneOffset",
        ),
      );
    } else if (
      stringValue(state, "startDate").includes("T") &&
      !timezoneOffset &&
      !/(?:Z|[+-]\d{2}:\d{2})$/i.test(stringValue(state, "startDate"))
    ) {
      issues.push(
        issue(
          "event-timezone-missing",
          "warning",
          "Add the event time zone",
          "A local event time should include its UTC offset so search systems interpret the schedule correctly.",
          "timezoneOffset",
        ),
      );
    }
    const physical =
      attendance === "OfflineEventAttendanceMode" ||
      attendance === "MixedEventAttendanceMode";
    const online =
      attendance === "OnlineEventAttendanceMode" ||
      attendance === "MixedEventAttendanceMode";
    if (
      physical &&
      (!stringValue(state, "venueName") ||
        !stringValue(state, "addressLocality") ||
        !stringValue(state, "addressCountry"))
    ) {
      issues.push(
        issue(
          "event-physical-location",
          "error",
          "Complete the physical location",
          "Offline and mixed events need a named venue, city, and country at minimum.",
          "venueName",
        ),
      );
    }
    if (online && !stringValue(state, "virtualUrl")) {
      issues.push(
        issue(
          "event-virtual-location",
          "error",
          "Add the virtual event URL",
          "Online and mixed events need a VirtualLocation URL that users can access.",
          "virtualUrl",
        ),
      );
    }
    if (
      stringValue(state, "eventStatus") === "EventRescheduled" &&
      !stringValue(state, "previousStartDate")
    ) {
      issues.push(
        issue(
          "event-previous-date",
          "warning",
          "Add the previous start date",
          "A rescheduled event should preserve the original start date when it is known.",
          "previousStartDate",
        ),
      );
    }
    addDateOrderIssue(
      issues,
      state,
      "startDate",
      "endDate",
      "Check the event schedule",
    );
  }

  if (type === "jobPosting") {
    const remote = rawValue(state, "remote") === true;
    if (
      remote &&
      splitLines(stringValue(state, "applicantCountries")).length === 0
    ) {
      issues.push(
        issue(
          "job-remote-region",
          "error",
          "Define remote eligibility",
          "A fully remote job needs at least one visible applicant country or region.",
          "applicantCountries",
        ),
      );
    }
    if (
      !remote &&
      (!stringValue(state, "addressLocality") ||
        !stringValue(state, "addressCountry"))
    ) {
      issues.push(
        issue(
          "job-location",
          "error",
          "Complete the job location",
          "A non-remote role needs at least a city and country.",
          "addressLocality",
        ),
      );
    }
    addDateOrderIssue(
      issues,
      state,
      "datePosted",
      "validThrough",
      "Check the job posting dates",
    );
    const min = Number(stringValue(state, "salaryMin"));
    const max = Number(stringValue(state, "salaryMax"));
    const hasMin =
      Number.isFinite(min) && stringValue(state, "salaryMin") !== "";
    const hasMax =
      Number.isFinite(max) && stringValue(state, "salaryMax") !== "";
    if (hasMin && hasMax && max < min) {
      issues.push(
        issue(
          "salary-order",
          "error",
          "Check the salary range",
          "Maximum salary must be greater than or equal to minimum salary.",
          "salaryMax",
        ),
      );
    }
    if (
      (hasMin || hasMax) &&
      (!stringValue(state, "salaryCurrency") ||
        !stringValue(state, "salaryUnit"))
    ) {
      issues.push(
        issue(
          "salary-unit",
          "error",
          "Complete salary units",
          "A salary value needs both a currency code and payment unit.",
          "salaryCurrency",
        ),
      );
    }
  }

  if (type === "localBusiness") {
    const lat = stringValue(state, "latitude");
    const lng = stringValue(state, "longitude");
    if (Boolean(lat) !== Boolean(lng)) {
      issues.push(
        issue(
          "geo-pair",
          "error",
          "Complete both coordinates",
          "Latitude and longitude must be supplied together.",
          lat ? "longitude" : "latitude",
        ),
      );
    }
  }

  if (type === "video") {
    if (!stringValue(state, "contentUrl") && !stringValue(state, "embedUrl")) {
      issues.push(
        issue(
          "video-access-url",
          "error",
          "Add a video access URL",
          "Provide contentUrl or embedUrl so crawlers can locate the video.",
          "contentUrl",
        ),
      );
    }
  }

  if (type === "softwareApplication") {
    const rating = stringValue(state, "ratingValue");
    const count = stringValue(state, "ratingCount");
    if (Boolean(rating) !== Boolean(count)) {
      issues.push(
        issue(
          "software-rating-pair",
          "error",
          "Complete the application rating pair",
          "Aggregate rating and rating count must be supplied together.",
          rating ? "ratingCount" : "ratingValue",
        ),
      );
    }
  }

  if (type === "course") {
    addDateOrderIssue(
      issues,
      state,
      "startDate",
      "endDate",
      "Check the course dates",
    );
  }
}

export function evaluateSchema(state: SchemaFormState): SchemaEvaluation {
  const definition = getSchemaDefinition(state.schemaType);
  const fields = allFields(state);
  const requiredFields = fields.filter((field) => field.required);
  const recommendedFields = fields.filter(
    (field) => field.recommended && !field.required,
  );
  const issues: SchemaIssue[] = [];

  let requiredTotal = requiredFields.length + 3;
  let requiredComplete = requiredFields.filter((field) =>
    complete(rawValue(state, field.id), field.kind),
  ).length;
  let recommendedTotal = recommendedFields.length;
  let recommendedComplete = recommendedFields.filter((field) =>
    complete(rawValue(state, field.id), field.kind),
  ).length;

  if (state.pageUrl.trim()) requiredComplete += 1;
  else {
    issues.push(
      issue(
        "page-url-required",
        "error",
        "Add the canonical page URL",
        "A full page URL is required for stable @id values and graph relationships.",
        "pageUrl",
      ),
    );
  }

  if (state.pageContext.trim().length >= 30) requiredComplete += 1;
  else {
    issues.push(
      issue(
        "page-context-required",
        "error",
        "Describe the page context",
        "Add at least 30 characters explaining the page’s real purpose and visible content.",
        "pageContext",
      ),
    );
  }

  if (state.visibleContentConfirmed) requiredComplete += 1;
  else {
    issues.push(
      issue(
        "visible-content-confirmation",
        "error",
        "Confirm visible-content parity",
        "Before publishing, confirm that every generated fact is visible to users on the same page and remains accurate.",
        "visibleContentConfirmed",
      ),
    );
  }

  for (const field of requiredFields) {
    if (!complete(rawValue(state, field.id), field.kind)) {
      issues.push(
        issue(
          `required-${field.id}`,
          "error",
          `${field.label} is required`,
          "Complete this field to meet the generator’s required property set.",
          field.id,
        ),
      );
    }
  }

  for (const repeater of definition.repeaters || []) {
    const items = (state.repeaters[repeater.id] || []).filter((item) =>
      Object.entries(item).some(
        ([key, value]) => key !== "_key" && value.trim().length > 0,
      ),
    );
    const minimum = repeater.minItems || 0;
    if (minimum) {
      requiredTotal += minimum;
      requiredComplete += Math.min(items.length, minimum);
      if (items.length < minimum) {
        issues.push(
          issue(
            `repeater-${repeater.id}-minimum`,
            "error",
            `Add at least ${minimum} ${repeater.itemLabel.toLowerCase()}${minimum > 1 ? "s" : ""}`,
            `${repeater.label} needs enough complete visible items for this schema type.`,
            repeater.id,
          ),
        );
      }
    } else if (repeater.recommended) {
      recommendedTotal += 1;
      if (items.length) recommendedComplete += 1;
    }

    items.forEach((item, itemIndex) => {
      for (const field of repeater.fields.filter((field) => field.required)) {
        requiredTotal += 1;
        if (item[field.id]?.trim()) requiredComplete += 1;
        else {
          issues.push(
            issue(
              `repeater-${repeater.id}-${itemIndex}-${field.id}`,
              "error",
              `${repeater.itemLabel} ${itemIndex + 1}: ${field.label} is required`,
              "Complete or remove this partial item.",
              repeater.id,
            ),
          );
        }
      }
    });
  }

  if (state.includeBreadcrumbs && state.schemaType !== "breadcrumb") {
    const completeBreadcrumbs = state.breadcrumbs.filter(
      (item) => item.name?.trim() && item.item?.trim(),
    );
    requiredTotal += 2;
    requiredComplete += Math.min(completeBreadcrumbs.length, 2);
    if (completeBreadcrumbs.length < 2) {
      issues.push(
        issue(
          "supporting-breadcrumbs",
          "error",
          "Complete the supporting breadcrumb trail",
          "A BreadcrumbList needs at least two ordered items with labels and absolute URLs.",
          "breadcrumbs",
        ),
      );
    }
  }

  const urlFields: SchemaFieldDefinition[] = fields.filter(
    (field) => field.kind === "url",
  );
  for (const field of urlFields) {
    const value = stringValue(state, field.id);
    if (value && !isAbsoluteHttpUrl(value)) {
      issues.push(
        issue(
          `url-${field.id}`,
          "error",
          `Use an absolute URL for ${field.label.toLowerCase()}`,
          "URLs must begin with https:// or http://.",
          field.id,
        ),
      );
    }
  }

  if (state.pageUrl && !isAbsoluteHttpUrl(state.pageUrl)) {
    issues.push(
      issue(
        "page-url-format",
        "error",
        "Use a valid canonical page URL",
        "The page URL must begin with https:// or http://.",
        "pageUrl",
      ),
    );
  }

  for (const repeater of definition.repeaters || []) {
    for (const [itemIndex, item] of (
      state.repeaters[repeater.id] || []
    ).entries()) {
      for (const field of repeater.fields.filter(
        (field) => field.kind === "url",
      )) {
        const value = item[field.id]?.trim();
        if (value && !isAbsoluteHttpUrl(value)) {
          issues.push(
            issue(
              `url-${repeater.id}-${itemIndex}-${field.id}`,
              "error",
              `${repeater.itemLabel} ${itemIndex + 1}: use an absolute URL`,
              `${field.label} must begin with https:// or http://.`,
              repeater.id,
            ),
          );
        }
      }
    }
  }

  validateConditionalRules(state, issues);

  if (definition.warning) {
    issues.push(
      issue(
        "support-status",
        "warning",
        definition.supportLabel,
        definition.warning,
      ),
    );
  } else if (definition.support === "schema") {
    issues.push(
      issue(
        "schema-only-status",
        "warning",
        "Validate as Schema.org entity markup",
        "This type can be valid Schema.org data without producing a dedicated Google rich result. Use Schema.org Validator for vocabulary checks.",
      ),
    );
  }

  issues.push(
    issue(
      "no-guarantee",
      "recommendation",
      "Eligibility is not a ranking guarantee",
      "Accurate structured data improves machine-readable context and can create feature eligibility, but it does not guarantee rankings, rich results, or AI citations.",
    ),
  );

  let nodeCount = 0;
  try {
    const graph = compileSchema(state)["@graph"];
    nodeCount = Array.isArray(graph) ? graph.length : 1;
    JSON.stringify(compileSchema(state));
  } catch {
    issues.push(
      issue(
        "compiler-error",
        "error",
        "The JSON-LD compiler paused",
        "Review the entered values before exporting the code.",
      ),
    );
  }

  const requiredRatio = requiredTotal ? requiredComplete / requiredTotal : 1;
  const recommendedRatio = recommendedTotal
    ? recommendedComplete / recommendedTotal
    : 1;
  const errorCount = issues.filter(
    (entry) => entry.severity === "error",
  ).length;
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(requiredRatio * 72 + recommendedRatio * 28 - errorCount * 4),
    ),
  );

  if (errorCount === 0) {
    issues.unshift(
      issue(
        "ready",
        "pass",
        "Ready for external validation",
        "All required tool checks pass. Run Schema.org Validator and, where applicable, Google Rich Results Test before publishing.",
      ),
    );
  }

  return {
    score,
    publishReady: errorCount === 0,
    requiredComplete,
    requiredTotal,
    recommendedComplete,
    recommendedTotal,
    nodeCount,
    issues,
  };
}
