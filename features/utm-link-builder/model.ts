import { buildQrCodeSvg } from "@/features/google-review-link-generator/model";

export type UtmBuilderInput = {
  destinationUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  forceLowercase: boolean;
};

export type UtmPresetItem = {
  label: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  ga4Channel: string;
};

export type BulkChannelRow = {
  channelName: string;
  source: string;
  medium: string;
  content: string;
  ga4Bucket: string;
  fullUrl: string;
};

export type UtmAuditCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type UtmBuilderResult = {
  finalTrackedUrl: string;
  predictedGa4Channel: string;
  qrSvgMarkup: string;
  checks: UtmAuditCheck[];
  bulkMatrixRows: BulkChannelRow[];
  csvExportString: string;
};

export const UTM_CHANNEL_PRESETS: UtmPresetItem[] = [
  {
    label: "1. LinkedIn Organic Post",
    utmSource: "linkedin",
    utmMedium: "social",
    utmCampaign: "q4_seo_launch",
    utmContent: "founder_carousel_post",
    ga4Channel: "Organic Social",
  },
  {
    label: "2. YouTube Video Description",
    utmSource: "youtube",
    utmMedium: "video",
    utmCampaign: "technical_seo_guide",
    utmContent: "description_top_link",
    ga4Channel: "Organic Video / Social",
  },
  {
    label: "3. Weekly Email Newsletter",
    utmSource: "newsletter",
    utmMedium: "email",
    utmCampaign: "weekly_ai_digest",
    utmContent: "hero_cta_button",
    ga4Channel: "Email",
  },
  {
    label: "4. Google Business Profile (Local SEO)",
    utmSource: "google",
    utmMedium: "organic",
    utmCampaign: "gbp_listing",
    utmContent: "website_button",
    ga4Channel: "Organic Search (GBP)",
  },
  {
    label: "5. Meta / LinkedIn Paid Ads",
    utmSource: "linkedin",
    utmMedium: "cpc",
    utmCampaign: "lead_magnet_q4",
    utmContent: "single_image_ad_v1",
    ga4Channel: "Paid Social / Paid Search",
  },
];

export const DEFAULT_UTM_INPUT: UtmBuilderInput = {
  destinationUrl: "https://doitwithai.tools/chrome-extension",
  utmSource: "linkedin",
  utmMedium: "social",
  utmCampaign: "chrome_extension_launch",
  utmContent: "founder_demo_post",
  utmTerm: "",
  forceLowercase: true,
};

function sanitizeUtmToken(val: string, forceLower: boolean): string {
  const cleaned = val
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_.-]/g, "");
  return forceLower ? cleaned.toLowerCase() : cleaned;
}

export function predictGa4DefaultChannel(
  source: string,
  medium: string,
): string {
  const s = source.toLowerCase();
  const m = medium.toLowerCase();

  if (m === "email" || m === "e-mail" || m === "newsletter" || s === "email") {
    return "Email";
  }
  if (/^(cpc|ppc|paidsearch)$/.test(m)) {
    return "Paid Search";
  }
  if (/^(paidsocial|paid_social|paid-social)$/.test(m)) {
    return "Paid Social";
  }
  if (
    /^(social|social-network|social-media|sm)$/.test(m) ||
    /^(linkedin|twitter|x|facebook|instagram|tiktok|threads|pinterest)$/.test(s)
  ) {
    return "Organic Social";
  }
  if (/^(video|youtube)$/.test(m) || s === "youtube") {
    return "Organic Video";
  }
  if (m === "referral" || m === "app" || m === "link") {
    return "Referral";
  }
  if (m === "organic") {
    return "Organic Search";
  }
  if (m === "affiliate") {
    return "Affiliates";
  }
  return "Unassigned (Warning: Non-standard utm_medium)";
}

export function buildUtmTrackingPack(input: UtmBuilderInput): UtmBuilderResult {
  const rawBase =
    input.destinationUrl.trim() || "https://doitwithai.tools/tools";
  const src = sanitizeUtmToken(input.utmSource, input.forceLowercase);
  const med = sanitizeUtmToken(input.utmMedium, input.forceLowercase);
  const cmp = sanitizeUtmToken(input.utmCampaign, input.forceLowercase);
  const cnt = sanitizeUtmToken(input.utmContent, input.forceLowercase);
  const trm = sanitizeUtmToken(input.utmTerm, input.forceLowercase);

  function composeUrl(
    baseUrl: string,
    s: string,
    m: string,
    c: string,
    co: string,
    t: string,
  ): string {
    try {
      const u = new URL(baseUrl);
      if (s) u.searchParams.set("utm_source", s);
      if (m) u.searchParams.set("utm_medium", m);
      if (c) u.searchParams.set("utm_campaign", c);
      if (co) u.searchParams.set("utm_content", co);
      if (t) u.searchParams.set("utm_term", t);
      return u.toString();
    } catch {
      const params = new URLSearchParams();
      if (s) params.set("utm_source", s);
      if (m) params.set("utm_medium", m);
      if (c) params.set("utm_campaign", c);
      if (co) params.set("utm_content", co);
      if (t) params.set("utm_term", t);
      const qs = params.toString();
      return qs ? `${baseUrl}?${qs}` : baseUrl;
    }
  }

  const finalTrackedUrl = composeUrl(rawBase, src, med, cmp, cnt, trm);
  const predictedGa4Channel = predictGa4DefaultChannel(src, med);
  const qrSvgMarkup = buildQrCodeSvg(finalTrackedUrl, "#1e3a8a");

  const hasSpacesOrCapsInRaw =
    /[A-Z\s]/.test(input.utmSource) ||
    /[A-Z\s]/.test(input.utmMedium) ||
    /[A-Z\s]/.test(input.utmCampaign);

  const checks: UtmAuditCheck[] = [
    {
      label: "GA4 Default Channel Grouping Recognition",
      passed: !predictedGa4Channel.startsWith("Unassigned"),
      detail: `Maps to GA4 '${predictedGa4Channel}' channel bucket.`,
    },
    {
      label: "Required Core Trio (utm_source, utm_medium, utm_campaign)",
      passed: Boolean(src && med && cmp),
      detail:
        src && med && cmp
          ? "All 3 primary attribution parameters are populated."
          : "Populate source, medium, and campaign so GA4 never drops attribution.",
    },
    {
      label: "Lowercase & Snake_Case Hygiene",
      passed: input.forceLowercase || !hasSpacesOrCapsInRaw,
      detail:
        "GA4 treats 'LinkedIn' and 'linkedin' as two separate rows unless normalized to lowercase.",
    },
  ];

  const campaignSlug = cmp || "campaign_launch";
  const bulkMatrixRows: BulkChannelRow[] = [
    ["LinkedIn Organic Post", "linkedin", "social", "organic_post"],
    ["X (Twitter) Thread", "twitter", "social", "thread_hook"],
    ["YouTube Description", "youtube", "video", "description_link"],
    ["Instagram Bio Link", "instagram", "social", "bio_link"],
    ["Email Newsletter", "newsletter", "email", "primary_cta"],
    ["Google Business Profile", "google", "organic", "gbp_website"],
  ].map(([channelName, s, m, co]) => ({
    channelName,
    source: s,
    medium: m,
    content: co,
    ga4Bucket: predictGa4DefaultChannel(s, m),
    fullUrl: composeUrl(rawBase, s, m, campaignSlug, co, ""),
  }));

  const csvRows = [
    '"Channel","utm_source","utm_medium","utm_campaign","utm_content","GA4 Channel Bucket","Full Tracked URL"',
    ...bulkMatrixRows.map(
      (r) =>
        `"${r.channelName}","${r.source}","${r.medium}","${campaignSlug}","${r.content}","${r.ga4Bucket}","${r.fullUrl}"`,
    ),
  ];

  return {
    finalTrackedUrl,
    predictedGa4Channel,
    qrSvgMarkup,
    checks,
    bulkMatrixRows,
    csvExportString: csvRows.join("\r\n"),
  };
}
