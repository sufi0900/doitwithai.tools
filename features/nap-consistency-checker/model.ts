export type CitationRowInput = {
  source: string;
  name: string;
  address: string;
  phone: string;
};

export type NapMasterInput = {
  masterName: string;
  masterStreet: string;
  masterSuite: string;
  masterCity: string;
  masterState: string;
  masterPostal: string;
  masterPhone: string;
  masterWebsite: string;
  citationLines: string;
};

export type CitationAuditRow = {
  source: string;
  rawName: string;
  rawAddress: string;
  rawPhone: string;
  nameMatch: "exact" | "normalized" | "mismatch";
  addressMatch: "exact" | "normalized" | "mismatch";
  phoneMatch: "exact" | "normalized" | "mismatch";
  issues: string[];
  rowScore: number;
};

export type TopDirectoryItem = {
  directory: string;
  tier: "Tier 1 Core" | "Tier 2 Aggregator / Map" | "Tier 3 Industry";
  url: string;
  standardizedNap: string;
};

export type NapConsistencyResult = {
  overallConsistencyScore: number;
  standardizedUspsLine: string;
  standardizedPhoneLocal: string;
  standardizedPhoneE164: string;
  auditedRows: CitationAuditRow[];
  topDirectories: TopDirectoryItem[];
  csvExportString: string;
};

const USPS_ABBR: Record<string, string> = {
  street: "St",
  st: "St",
  avenue: "Ave",
  ave: "Ave",
  boulevard: "Blvd",
  blvd: "Blvd",
  drive: "Dr",
  dr: "Dr",
  road: "Rd",
  rd: "Rd",
  lane: "Ln",
  ln: "Ln",
  court: "Ct",
  ct: "Ct",
  parkway: "Pkwy",
  pkwy: "Pkwy",
  highway: "Hwy",
  hwy: "Hwy",
  suite: "Ste",
  ste: "Ste",
  apartment: "Apt",
  apt: "Apt",
  north: "N",
  south: "S",
  east: "E",
  west: "W",
};

export const DEFAULT_NAP_INPUT: NapMasterInput = {
  masterName: "Apex Dental & Implant Studio",
  masterStreet: "402 W 7th St",
  masterSuite: "Ste 210",
  masterCity: "Austin",
  masterState: "TX",
  masterPostal: "78701",
  masterPhone: "(512) 555-0194",
  masterWebsite: "https://apexdentalaustin.example.com",
  citationLines: [
    "Google Business Profile | Apex Dental & Implant Studio | 402 W 7th St, Ste 210, Austin, TX 78701 | (512) 555-0194",
    "Yelp | Apex Dental and Implant Studio | 402 West 7th Street Suite 210, Austin, TX 78701 | 512-555-0194",
    "Apple Business Connect | Apex Dental & Implant Studio | 402 W 7th St #210, Austin, TX 78701 | +1 512-555-0194",
    "Facebook Page | Apex Dental Austin | 402 W 7th St, Austin, TX 78701 | (512) 555-0199",
    "Bing Places | Apex Dental & Implant Studio LLC | 402 W 7th Street, Ste 210, Austin, TX 78701 | (512) 555-0194",
    "Healthgrades | Apex Dental & Implant Studio | 402 W 7th St, Ste 210, Austin, TX 78701 | (512) 555-0194",
  ].join("\n"),
};

export function normalizeDigits(phone: string): string {
  const digits = phone.replace(/\D+/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits;
}

export function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\b(llc|inc|corp|ltd|pllc|pc)\b/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeAddressTokens(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/#(\d+)/g, "ste $1")
    .replace(/[.,#]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => (USPS_ABBR[tok] ? USPS_ABBR[tok].toLowerCase() : tok))
    .join(" ");
}

export function auditNapConsistency(
  input: NapMasterInput,
): NapConsistencyResult {
  const digits = normalizeDigits(input.masterPhone);
  const standardizedPhoneLocal =
    digits.length === 10
      ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
      : input.masterPhone.trim();
  const standardizedPhoneE164 =
    digits.length === 10 ? `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}` : input.masterPhone.trim();

  const fullStreet = [input.masterStreet.trim(), input.masterSuite.trim()]
    .filter(Boolean)
    .join(", ");
  const standardizedUspsLine = `${fullStreet}, ${input.masterCity.trim()}, ${input.masterState.trim()} ${input.masterPostal.trim()}`;

  const masterNameExact = input.masterName.trim();
  const masterNameNorm = normalizeBusinessName(masterNameExact);
  const masterAddrNorm = normalizeAddressTokens(standardizedUspsLine);

  const lines = input.citationLines
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const auditedRows: CitationAuditRow[] = lines.map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    const source = parts[0] || "Directory Listing";
    const rawName = parts[1] || "";
    const rawAddress = parts[2] || "";
    const rawPhone = parts[3] || "";

    const issues: string[] = [];

    // 1. Name comparison
    let nameMatch: CitationAuditRow["nameMatch"] = "mismatch";
    if (rawName === masterNameExact) {
      nameMatch = "exact";
    } else if (normalizeBusinessName(rawName) === masterNameNorm) {
      nameMatch = "normalized";
      issues.push(
        `Minor name formatting variation ('${rawName}' vs '${masterNameExact}').`,
      );
    } else {
      issues.push(
        `Business name mismatch: '${rawName}' does not match '${masterNameExact}'.`,
      );
    }

    // 2. Address comparison
    let addressMatch: CitationAuditRow["addressMatch"] = "mismatch";
    if (rawAddress === standardizedUspsLine) {
      addressMatch = "exact";
    } else if (normalizeAddressTokens(rawAddress) === masterAddrNorm) {
      addressMatch = "normalized";
      issues.push(
        "Address matches after USPS street/suite abbreviation normalization.",
      );
    } else {
      const missingSuite =
        input.masterSuite.trim() &&
        !normalizeAddressTokens(rawAddress).includes(
          normalizeAddressTokens(input.masterSuite),
        );
      if (missingSuite) {
        issues.push(`Missing suite/unit number ('${input.masterSuite}').`);
      } else {
        issues.push(
          `Address discrepancy against master USPS line ('${standardizedUspsLine}').`,
        );
      }
    }

    // 3. Phone comparison
    let phoneMatch: CitationAuditRow["phoneMatch"] = "mismatch";
    const rowDigits = normalizeDigits(rawPhone);
    if (rawPhone === standardizedPhoneLocal) {
      phoneMatch = "exact";
    } else if (rowDigits && rowDigits === digits) {
      phoneMatch = "normalized";
    } else {
      issues.push(
        `Phone number conflict: '${rawPhone}' vs '${standardizedPhoneLocal}'!`,
      );
    }

    let rowScore = 0;
    rowScore += nameMatch === "exact" ? 35 : nameMatch === "normalized" ? 28 : 5;
    rowScore +=
      addressMatch === "exact" ? 35 : addressMatch === "normalized" ? 28 : 10;
    rowScore += phoneMatch === "exact" ? 30 : phoneMatch === "normalized" ? 27 : 0;

    return {
      source,
      rawName,
      rawAddress,
      rawPhone,
      nameMatch,
      addressMatch,
      phoneMatch,
      issues,
      rowScore,
    };
  });

  const overallConsistencyScore =
    auditedRows.length > 0
      ? Math.round(
          auditedRows.reduce((acc, r) => acc + r.rowScore, 0) /
            auditedRows.length,
        )
      : 100;

  const topDirectories: TopDirectoryItem[] = [
    ["Google Business Profile", "Tier 1 Core", "https://www.google.com/business/"],
    ["Apple Business Connect", "Tier 1 Core", "https://businessconnect.apple.com/"],
    ["Bing Places for Business", "Tier 1 Core", "https://www.bingplaces.com/"],
    ["Yelp for Business", "Tier 1 Core", "https://biz.yelp.com/"],
    ["Facebook Business Page", "Tier 1 Core", "https://www.facebook.com/pages/create"],
    ["Better Business Bureau (BBB)", "Tier 1 Core", "https://www.bbb.org/"],
    ["Foursquare / Factual", "Tier 2 Aggregator / Map", "https://foursquare.com/"],
    ["Data Axle (Infogroup)", "Tier 2 Aggregator / Map", "https://www.data-axle.com/"],
    ["Localeze (Neustar)", "Tier 2 Aggregator / Map", "https://www.neustarlocaleze.biz/"],
    ["YellowPages (YP.com)", "Tier 3 Industry", "https://www.yellowpages.com/"],
    ["Nextdoor Business", "Tier 3 Industry", "https://business.nextdoor.com/"],
    ["Chamber of Commerce", "Tier 3 Industry", "https://www.chamberofcommerce.com/"],
  ].map(([directory, tier, url]) => ({
    directory,
    tier: tier as TopDirectoryItem["tier"],
    url,
    standardizedNap: `${masterNameExact} | ${standardizedUspsLine} | ${standardizedPhoneLocal}`,
  }));

  const csvRows = [
    '"Directory","Tier","Submission URL","Standardized Business Name","Standardized USPS Address","Standardized Phone","Website URL"',
    ...topDirectories.map(
      (d) =>
        `"${d.directory}","${d.tier}","${d.url}","${masterNameExact.replace(/"/g, '""')}","${standardizedUspsLine.replace(/"/g, '""')}","${standardizedPhoneLocal}","${input.masterWebsite}"`,
    ),
  ];

  return {
    overallConsistencyScore,
    standardizedUspsLine,
    standardizedPhoneLocal,
    standardizedPhoneE164,
    auditedRows,
    topDirectories,
    csvExportString: csvRows.join("\r\n"),
  };
}
