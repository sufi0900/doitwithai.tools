import { serve } from "inngest/next";
import {
  agencyJobs,
  produceAgencyArticle,
  scheduleAgencyRuns,
} from "@/inngest/ai-agency-pipeline";

export const { GET, POST, PUT } = serve({
  client: agencyJobs,
  functions: [scheduleAgencyRuns, produceAgencyArticle],
});
