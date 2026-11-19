export const specialists = [
  { id: 'keywords', name: 'Keyword & Competitor Researcher', craft: 'Deliver an intent cluster, candidate topic and existing-page overlap. Never invent volume or difficulty.', match: /keyword|competitor research/i },
  { id: 'writer', name: 'Article Writer', craft: 'Draft a clear article with headings, sourced factual claims and a relevant tenant CTA.', match: /article|writer|blog/i },
  { id: 'qa', name: 'Fact-Check & Editorial QA', craft: 'Review claims individually, identify supporting passages, and explain unresolved issues. Never authorize publication.', match: /fact.check|editorial qa/i },
  { id: 'visual', name: 'Visual & Infographic Designer', craft: 'Prepare an editable visual brief with layout, hierarchy, brand colors and evidence for data graphics.', match: /visual|infographic/i },
  { id: 'refresh', name: 'On-Page & Content Refresh SEO', craft: 'Identify an existing approved URL and propose concrete before/after changes to headings, metadata and internal links.', match: /on.page|refresh/i },
  { id: 'technical', name: 'Technical Site Auditor', craft: 'Explain verified crawl findings and prioritise repairs. Identify metrics needing measurement.', match: /technical|site audit/i },
  { id: 'pr', name: 'Off-Page & Digital PR', craft: 'Produce an editorial outreach draft with a relevant source hook. Human approval is required before outreach.', match: /off.page|digital pr|outreach/i },
  { id: 'pinterest', name: 'Pinterest Specialist', craft: 'Prepare vertical pin copy, board intent, description and visual brief tied to the source.', match: /pinterest/i },
  { id: 'linkedin', name: 'LinkedIn Specialist', craft: 'Write a B2B post or carousel outline with a discussion hook and source-backed takeaways.', match: /linkedin/i },
  { id: 'facebook', name: 'Facebook & Community', craft: 'Draft a conversational page update or community question in the approved voice.', match: /facebook|community/i },
  { id: 'video', name: 'TikTok & Reels Scripter', craft: 'Draft a short vertical video script with an opening hook, narration, visual cues and captions.', match: /tiktok|reels|video/i },
] as const;
export type Specialist = typeof specialists[number];
