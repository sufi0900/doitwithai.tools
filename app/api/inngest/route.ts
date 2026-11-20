import { serve } from "inngest/next";
import {
  agencyJobs,
  produceAgencyArticle,
  scheduleAgencyRuns,
} from "@/inngest/ai-agency-pipeline";

import { scheduleSiteScans, scanAgencySite, scheduleChannelDelivery, publishChannelQueue } from "@/inngest/agency-site-audit";

export const { GET, POST, PUT } = serve({
  client: agencyJobs,
  functions: [scheduleAgencyRuns, produceAgencyArticle, scheduleSiteScans, scanAgencySite, scheduleChannelDelivery, publishChannelQueue],
});
