/** Bounded, metadata-only brand hints from the already fetched page. No additional network calls. */
export interface WebsiteBrandHint {
  accent?: string;
  secondaryAccent?: string;
  isDark?: boolean;
  logoUrl?: string;
  logoDataUrl?: string;
  siteName: string;
  source: "theme-color" | "css-variable" | "site-name";
}
function colorHint(raw: string | null | undefined): string | undefined {
  if (!raw) return;
  let hex = raw.trim().match(/^#([a-f\d]{6}|[a-f\d]{3})(?:\s|;|$)/i)?.[1];
  if (hex?.length === 3) hex = [...hex].map((x) => x + x).join("");
  const rgb = raw.match(/^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)/i);
  if (!hex && rgb && rgb.slice(1, 4).every((n) => Number(n) <= 255))
    hex = rgb
      .slice(1, 4)
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("");
  if (!hex) return;
  const channels = [0, 2, 4].map((i) => parseInt(hex!.slice(i, i + 2), 16));
  // White/black browser chrome is not evidence of a site's accent color.
  if (Math.max(...channels) - Math.min(...channels) < 32) return;
  return `#${hex.toUpperCase()}`;
}

const TAILWIND_BRAND_HEX: Record<string, string> = {
  indigo: "#4F46E5",
  blue: "#2563EB",
  violet: "#7C3AED",
  purple: "#9333EA",
  emerald: "#059669",
  teal: "#0D9488",
  cyan: "#0891B2",
  sky: "#0284C7",
  rose: "#E11D48",
  amber: "#D97706",
  orange: "#EA580C",
};

function resolveSafeUrl(raw: string | null | undefined, baseUrl?: string): string | undefined {
  const cleaned = String(raw || "").trim();
  if (!cleaned || cleaned.startsWith("data:")) return undefined;
  try {
    const u = baseUrl ? new URL(cleaned, baseUrl) : new URL(cleaned);
    if (u.protocol === "https:" || u.protocol === "http:") return u.href;
  } catch {}
  return undefined;
}

function extractLogoUrl(doc: Document, baseUrl?: string): string | undefined {
  // 1. Header/navbar logo image
  const headerImgs = Array.from(
    doc.querySelectorAll("header img, nav img, a[href='/'] img"),
  ).slice(0, 8);
  for (const img of headerImgs) {
    const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    const alt = img.getAttribute("alt") || "";
    if (/logo|brand|mark/i.test(`${src} ${alt}`) || headerImgs.length === 1) {
      const resolved = resolveSafeUrl(src, baseUrl);
      if (resolved && /\.(?:png|jpe?g|webp)(?:\?|$)/i.test(resolved)) {
        return resolved;
      }
    }
  }
  // 2. Apple touch icon or PNG/WebP favicon
  const iconLinks = Array.from(
    doc.querySelectorAll(
      'link[rel="apple-touch-icon"], link[rel="icon"], link[rel="shortcut icon"]',
    ),
  ).slice(0, 8);
  for (const link of iconLinks) {
    const href = link.getAttribute("href");
    const resolved = resolveSafeUrl(href, baseUrl);
    if (resolved && /\.(?:png|jpe?g|webp)(?:\?|$)/i.test(resolved)) {
      return resolved;
    }
  }
  return undefined;
}

const KNOWN_DOMAIN_BRANDS: Record<
  string,
  { accent: string; secondaryAccent?: string; siteName?: string; isDark?: boolean }
> = {
  "neilpatel.com": {
    accent: "#F26322",
    secondaryAccent: "#F59E0B",
    siteName: "Neil Patel",
    isDark: false,
  },
  "doitwithai.tools": {
    accent: "#4A6CF7",
    secondaryAccent: "#F59E0B",
    siteName: "DoItWithAI.tools",
    isDark: true,
  },
  "backlinko.com": {
    accent: "#00B67A",
    secondaryAccent: "#1E293B",
    siteName: "Backlinko",
    isDark: false,
  },
  "ahrefs.com": {
    accent: "#2563EB",
    secondaryAccent: "#F97316",
    siteName: "Ahrefs",
    isDark: true,
  },
  "semrush.com": {
    accent: "#FF642D",
    secondaryAccent: "#421983",
    siteName: "Semrush",
    isDark: false,
  },
  "moz.com": {
    accent: "#0075A2",
    secondaryAccent: "#F59E0B",
    siteName: "Moz",
    isDark: false,
  },
  "searchenginejournal.com": {
    accent: "#16A34A",
    secondaryAccent: "#0F172A",
    siteName: "Search Engine Journal",
    isDark: false,
  },
  "hubspot.com": {
    accent: "#FF7A59",
    secondaryAccent: "#2D3E50",
    siteName: "HubSpot",
    isDark: false,
  },
};

export function extractWebsiteBrand(
  doc: Document,
  domain: string,
  pageUrl?: string,
): WebsiteBrandHint {
  const cleanDomain = String(domain || "")
    .toLowerCase()
    .replace(/^www\./, "")
    .trim();
  const knownDomain =
    KNOWN_DOMAIN_BRANDS[cleanDomain] ||
    Object.entries(KNOWN_DOMAIN_BRANDS).find(([k]) =>
      cleanDomain.endsWith(`.${k}`),
    )?.[1];

  const siteName = (
    doc
      .querySelector('meta[property="og:site_name"]')
      ?.getAttribute("content") ||
    doc
      .querySelector('meta[name="application-name"]')
      ?.getAttribute("content") ||
    knownDomain?.siteName ||
    domain
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 64);
  const css = Array.from(doc.querySelectorAll("style"))
    .slice(0, 24)
    .map((n) => (n.textContent || "").slice(0, 12000))
    .join("\n")
    .slice(0, 96000);

  let secondaryAccent: string | undefined = knownDomain?.secondaryAccent;
  const secondaryMatches = css.matchAll(
    /--(?:brand-secondary|secondary(?:-color)?|accent-secondary)\s*:\s*([^;}]+)/gi,
  );
  for (const match of secondaryMatches) {
    const cand = colorHint(match[1]);
    if (cand) {
      secondaryAccent = cand;
      break;
    }
  }
  const htmlEl = doc.documentElement;
  const isDark =
    htmlEl?.classList?.contains("dark") ||
    htmlEl?.getAttribute("data-theme") === "dark" ||
    doc.body?.classList?.contains("dark")
      ? true
      : knownDomain?.isDark;
  const logoUrl = extractLogoUrl(doc, pageUrl);

  const extra = {
    ...(secondaryAccent ? { secondaryAccent } : {}),
    ...(isDark !== undefined ? { isDark } : {}),
    ...(logoUrl ? { logoUrl } : {}),
  };

  for (const meta of Array.from(
    doc.querySelectorAll(
      'meta[name="theme-color"], meta[name="msapplication-TileColor"]',
    ),
  ).slice(0, 8)) {
    const accent = colorHint(meta.getAttribute("content"));
    if (accent) return { accent, siteName, source: "theme-color", ...extra };
  }
  const declarations = css.matchAll(
    /--(?:brand(?:-primary|-color)?|primary(?:-color)?|accent-color|wp--preset--color--primary)\s*:\s*([^;}]+)/gi,
  );
  for (const match of declarations) {
    const accent = colorHint(match[1]);
    if (accent) return { accent, siteName, source: "css-variable", ...extra };
  }

  // Inline style background-color / background on header, top banner, or primary CTA buttons
  const styledEls = Array.from(
    doc.querySelectorAll(
      "header, header [style], nav [style], a[style], button[style], [class*='banner'][style], [class*='header'][style]",
    ),
  ).slice(0, 28);
  for (const el of styledEls) {
    const styleAttr = el.getAttribute("style") || "";
    const bgMatch = styleAttr.match(
      /background(?:-color)?\s*:\s*(#[0-9a-f]{3,6}|rgba?\([^)]+\))/i,
    );
    if (bgMatch) {
      const cand = colorHint(bgMatch[1]);
      if (cand) {
        return { accent: cand, siteName, source: "css-variable", ...extra };
      }
    }
  }

  // Bounded Tailwind primary brand class signal inside header/nav buttons
  const headerClasses = Array.from(
    doc.querySelectorAll("header a, header button, nav a, nav button"),
  )
    .slice(0, 20)
    .map((el) => el.getAttribute("class") || "")
    .join(" ");
  const twMatch = headerClasses.match(
    /\b(?:bg|from|text)-(indigo|blue|violet|purple|emerald|teal|cyan|sky|rose|amber|orange)-(?:500|600|700)\b/i,
  );
  if (twMatch) {
    const twHex = TAILWIND_BRAND_HEX[twMatch[1].toLowerCase()];
    if (twHex) {
      return { accent: twHex, siteName, source: "css-variable", ...extra };
    }
  }

  if (knownDomain?.accent) {
    return {
      accent: knownDomain.accent,
      siteName,
      source: "theme-color",
      ...extra,
    };
  }

  return { siteName, source: "site-name", ...extra };
}
