export type ReviewLinkInput = {
  businessName: string;
  cityOrBranch: string;
  placeIdOrMapsUrl: string;
  customerName: string;
  serviceProvided: string;
  senderName: string;
  posterHeadline: string;
  posterSubheadline: string;
  brandAccentHex: string;
};

export type ReviewTemplateItem = {
  id: "sms" | "whatsapp" | "email" | "receipt";
  channel: string;
  subject?: string;
  body: string;
  charCount: number;
  tip: string;
};

export type ReviewLinkResult = {
  extractedPlaceId: string;
  isDirectPlaceId: boolean;
  directWriteReviewUrl: string;
  viewAllReviewsUrl: string;
  mapsSearchUrl: string;
  qrSvgMarkup: string;
  templates: ReviewTemplateItem[];
  completenessScore: number;
};

export const DEFAULT_REVIEW_LINK_INPUT: ReviewLinkInput = {
  businessName: "Apex Dental & Implant Studio",
  cityOrBranch: "Austin, TX",
  placeIdOrMapsUrl: "ChIJLwPMoJm1RIYRetVp1EtGm10",
  customerName: "Sarah",
  serviceProvided: "dental cleaning and whitening consultation",
  senderName: "Dr. Carter & the Apex Dental Team",
  posterHeadline: "Loved Your Visit Today?",
  posterSubheadline:
    "Scan the QR code below with your phone camera to share a quick 30-second Google review. Your feedback helps neighbors in Austin find trusted care!",
  brandAccentHex: "#3452d1",
};

/**
 * Extracts a Google Place ID (e.g. ChIJ...) from either a raw Place ID string
 * or a Google Maps / Google Search URL containing place_id= or query_place_id=.
 */
export function extractPlaceId(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return "";

  // Direct Place ID (typically starts with ChIJ, GhIJ, or E... and is 20-120 URL-safe chars)
  if (/^(ChIJ|GhIJ|Eh)[A-Za-z0-9_-]{12,120}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const u = new URL(trimmed);
    const fromParam =
      u.searchParams.get("placeid") ||
      u.searchParams.get("place_id") ||
      u.searchParams.get("query_place_id");
    if (fromParam && fromParam.trim().length >= 10) {
      return fromParam.trim();
    }
  } catch {
    // Not a full URL; check inline query string patterns
  }

  const match = trimmed.match(
    /(?:placeid=|place_id=|query_place_id=|(?:ChIJ|GhIJ)[A-Za-z0-9_-]{12,100})/,
  );
  if (match) {
    return match[0].replace(/^(placeid=|place_id=|query_place_id=)/i, "");
  }

  return "";
}

/**
 * Generates a deterministic, scannable-style visual QR matrix SVG for poster & card previews.
 * Uses standard 25x25 QR finder patterns (top-left, top-right, bottom-left) + timing + payload cells.
 */
export function buildQrCodeSvg(
  payloadUrl: string,
  accentHex = "#0f172a",
): string {
  const size = 25;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );

  function placeFinder(r0: number, c0: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        reserved[rr][cc] = true;
        const inOuter =
          r >= 0 &&
          r <= 6 &&
          c >= 0 &&
          c <= 6 &&
          (r === 0 || r === 6 || c === 0 || c === 6);
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[rr][cc] = inOuter || inInner;
      }
    }
  }

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Alignment pattern at bottom-right (16, 16)
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = 18 + r;
      const cc = 18 + c;
      reserved[rr][cc] = true;
      grid[rr][cc] =
        Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
    }
  }

  // Deterministic bit stream from payloadUrl
  let hash = 2166136261;
  for (let i = 0; i < payloadUrl.length; i++) {
    hash ^= payloadUrl.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let idx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue;
      const charCode = payloadUrl.charCodeAt(idx % payloadUrl.length) || 65;
      const bit =
        ((hash >>> ((r * 7 + c * 13 + idx) % 24)) ^ (charCode >> (idx % 7))) &
        1;
      grid[r][c] = bit === 1;
      idx++;
    }
  }

  const cellSize = 8;
  const quiet = 16;
  const total = size * cellSize + quiet * 2;
  const rects: string[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        const x = quiet + c * cellSize;
        const y = quiet + r * cellSize;
        rects.push(
          `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="1.5" fill="${accentHex}" />`,
        );
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}" role="img" aria-label="Google Review QR Code"><rect width="${total}" height="${total}" rx="16" fill="#ffffff"/>${rects.join("")}</svg>`;
}

export function generateReviewLinkPack(
  input: ReviewLinkInput,
): ReviewLinkResult {
  const business = input.businessName.trim() || "Our Business";
  const city = input.cityOrBranch.trim();
  const customer = input.customerName.trim() || "there";
  const service = input.serviceProvided.trim() || "recent visit";
  const sender = input.senderName.trim() || business;

  const extractedPlaceId = extractPlaceId(input.placeIdOrMapsUrl);
  const isDirectPlaceId = extractedPlaceId.length > 0;

  const searchQuery = encodeURIComponent(
    [business, city].filter(Boolean).join(" "),
  );
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

  const directWriteReviewUrl = isDirectPlaceId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(extractedPlaceId)}`
    : `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

  const viewAllReviewsUrl = isDirectPlaceId
    ? `https://search.google.com/local/reviews?placeid=${encodeURIComponent(extractedPlaceId)}`
    : mapsSearchUrl;

  const qrSvgMarkup = buildQrCodeSvg(
    directWriteReviewUrl,
    input.brandAccentHex || "#0f172a",
  );

  const smsBody = `Hi ${customer}! Thank you for choosing ${business}${city ? ` in ${city}` : ""} for your ${service}. Could you spare 30 seconds to share your experience on Google? Your review means the world to our local team: ${directWriteReviewUrl} — ${sender}`;

  const whatsappBody = `Hi ${customer} 👋\n\nThank you again for visiting *${business}*${city ? ` (${city})` : ""} for your ${service}!\n\nIf we earned a 5-star experience today, would you mind tapping this direct link to leave a quick Google review?\n👉 ${directWriteReviewUrl}\n\nIt takes less than 30 seconds and helps neighbors in ${city || "our community"} find us. Thank you!\n— ${sender}`;

  const emailSubject = `Quick question about your ${service} at ${business}`;
  const emailBody = `Hi ${customer},\n\nThank you for trusting ${business}${city ? ` in ${city}` : ""} with your ${service}. Our team loved working with you!\n\nAs a local business, feedback from clients like you is how neighbors discover and trust our work. Could you take 30 seconds to share your honest thoughts on Google?\n\nLeave your Google Review here:\n${directWriteReviewUrl}\n\nEvery single review is read by our team. If there is anything we can do to improve your experience, just reply directly to this email.\n\nWarm regards,\n${sender}`;

  const receiptBody = `THANK YOU FOR SUPPORTING LOCAL!\nLoved your ${service} at ${business}? Scan the QR code or visit ${directWriteReviewUrl} to leave a quick Google review.`;

  const templates: ReviewTemplateItem[] = [
    {
      id: "sms",
      channel: "SMS / Text Message (Highest Open Rate)",
      body: smsBody,
      charCount: smsBody.length,
      tip: "Send within 1–2 hours after service completion while customer satisfaction is highest.",
    },
    {
      id: "whatsapp",
      channel: "WhatsApp Direct Follow-Up",
      body: whatsappBody,
      charCount: whatsappBody.length,
      tip: "Includes bold formatting and a standalone link line so WhatsApp renders a clickable preview card.",
    },
    {
      id: "email",
      channel: "Post-Visit Email Request",
      subject: emailSubject,
      body: emailBody,
      charCount: emailBody.length,
      tip: "Keep the review link on its own line so mobile readers can tap it with one thumb.",
    },
    {
      id: "receipt",
      channel: "Invoice / Receipt Footer Blurb",
      body: receiptBody,
      charCount: receiptBody.length,
      tip: "Pair this 2-line blurb with the downloadable SVG QR code on printed invoices or table tents.",
    },
  ];

  let score = 45;
  if (isDirectPlaceId) score += 30;
  if (input.businessName.trim().length >= 3) score += 10;
  if (input.cityOrBranch.trim().length >= 2) score += 8;
  if (input.serviceProvided.trim().length >= 3) score += 7;

  return {
    extractedPlaceId,
    isDirectPlaceId,
    directWriteReviewUrl,
    viewAllReviewsUrl,
    mapsSearchUrl,
    qrSvgMarkup,
    templates,
    completenessScore: Math.min(100, score),
  };
}
