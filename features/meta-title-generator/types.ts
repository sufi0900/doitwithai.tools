import type { MetaTitleLens } from "./config";
import type { MetaTitleCandidate } from "./schema";
import type { TitleEvaluation } from "./evaluator";

export type EvaluatedCandidate = MetaTitleCandidate & {
  key: string;
  lens: MetaTitleLens;
  evaluation: TitleEvaluation;
};
