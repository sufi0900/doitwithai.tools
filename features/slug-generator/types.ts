import type { SlugGroupId } from "./config";
import type { SlugEvaluation } from "./evaluator";
import type { SlugCandidate } from "./schema";

export type EvaluatedSlugCandidate = SlugCandidate & {
  group: SlugGroupId;
  evaluation: SlugEvaluation;
};
