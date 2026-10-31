import { getSchemaDefinition } from "./config";
import type {
  JsonLdObject,
  JsonLdValue,
  SchemaFormState,
  SchemaRepeaterItem,
} from "./types";

const SCHEMA = "https://schema.org/";

function value(state: SchemaFormState, id: string) {
  const raw = state.values[id];
  return typeof raw === "string" ? raw.trim() : raw;
}

function textValue(state: SchemaFormState, id: string) {
  const raw = value(state, id);
  return typeof raw === "string" ? raw : "";
}

function dateTimeWithOffset(
  state: SchemaFormState,
  id: string,
  offsetId = "timezoneOffset",
) {
  const dateTime = textValue(state, id);
  const offset = textValue(state, offsetId);
  if (!dateTime || /(?:Z|[+-]\d{2}:\d{2})$/i.test(dateTime) || !offset) {
    return dateTime;
  }
  return `${dateTime}${offset}`;
}

function boolValue(state: SchemaFormState, id: string) {
  return value(state, id) === true;
}

export function splitLines(raw: unknown) {
  if (typeof raw !== "string") return [];
  return raw
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function numberValue(state: SchemaFormState, id: string) {
  const raw = textValue(state, id);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function schemaTerm(term: string) {
  return term ? `${SCHEMA}${term}` : undefined;
}

function safeOrigin(rawUrl: string) {
  try {
    return new URL(rawUrl).origin;
  } catch {
    return "";
  }
}

function idFor(url: string, fragment: string) {
  return url ? `${url.replace(/#.*$/, "")}#${fragment}` : undefined;
}

function address(state: SchemaFormState): JsonLdObject | undefined {
  const result: JsonLdObject = {
    "@type": "PostalAddress",
    streetAddress: textValue(state, "streetAddress"),
    addressLocality: textValue(state, "addressLocality"),
    addressRegion: textValue(state, "addressRegion"),
    postalCode: textValue(state, "postalCode"),
    addressCountry: textValue(state, "addressCountry"),
  };
  return hasMeaningfulProperty(result) ? result : undefined;
}

function imageList(state: SchemaFormState, primaryId = "imageUrl") {
  return [
    textValue(state, primaryId),
    ...splitLines(value(state, "additionalImages")),
  ].filter(Boolean);
}

function mapRepeater(
  items: SchemaRepeaterItem[] | undefined,
  mapper: (item: SchemaRepeaterItem, index: number) => JsonLdObject,
) {
  return (items || [])
    .filter((item) =>
      Object.entries(item).some(
        ([key, entry]) => key !== "_key" && entry.trim().length > 0,
      ),
    )
    .map(mapper);
}

function hasMeaningfulProperty(value: JsonLdObject) {
  return Object.entries(value).some(
    ([key, entry]) =>
      !key.startsWith("@") &&
      entry !== undefined &&
      entry !== null &&
      entry !== "" &&
      (!Array.isArray(entry) || entry.length > 0),
  );
}

function articleNode(state: SchemaFormState, primaryId: string | undefined) {
  const publisherId = idFor(
    textValue(state, "publisherUrl") || safeOrigin(state.pageUrl),
    "organization",
  );
  const images = imageList(state);
  return {
    node: {
      "@type": textValue(state, "articleType") || "Article",
      "@id": primaryId,
      url: state.pageUrl,
      headline: textValue(state, "headline"),
      description: textValue(state, "description"),
      image: images,
      datePublished: textValue(state, "datePublished"),
      dateModified:
        textValue(state, "dateModified") || textValue(state, "datePublished"),
      articleSection: textValue(state, "articleSection"),
      keywords: splitLines(value(state, "keywords")),
      inLanguage: textValue(state, "inLanguage"),
      mainEntityOfPage: state.pageUrl ? { "@id": state.pageUrl } : undefined,
      author: textValue(state, "authorName")
        ? {
            "@type": textValue(state, "authorType") || "Person",
            name: textValue(state, "authorName"),
            url: textValue(state, "authorUrl"),
          }
        : undefined,
      publisher: publisherId
        ? { "@id": publisherId }
        : textValue(state, "publisherName")
          ? {
              "@type": "Organization",
              name: textValue(state, "publisherName"),
              url: textValue(state, "publisherUrl"),
              logo: textValue(state, "publisherLogoUrl")
                ? {
                    "@type": "ImageObject",
                    url: textValue(state, "publisherLogoUrl"),
                  }
                : undefined,
            }
          : undefined,
    } satisfies JsonLdObject,
    related:
      publisherId && textValue(state, "publisherName")
        ? [
            {
              "@type": "Organization",
              "@id": publisherId,
              name: textValue(state, "publisherName"),
              url: textValue(state, "publisherUrl"),
              logo: textValue(state, "publisherLogoUrl")
                ? {
                    "@type": "ImageObject",
                    url: textValue(state, "publisherLogoUrl"),
                  }
                : undefined,
            } satisfies JsonLdObject,
          ]
        : [],
  };
}

function faqNode(state: SchemaFormState, primaryId: string | undefined) {
  return {
    "@type": "FAQPage",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    description: textValue(state, "description"),
    inLanguage: textValue(state, "inLanguage"),
    mainEntity: mapRepeater(state.repeaters.faqs, (item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } satisfies JsonLdObject;
}

function breadcrumbNode(
  state: SchemaFormState,
  items = state.repeaters.items,
  primaryId = idFor(state.pageUrl, "breadcrumb"),
) {
  return {
    "@type": "BreadcrumbList",
    "@id": primaryId,
    itemListElement: mapRepeater(items, (item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  } satisfies JsonLdObject;
}

function howToNode(state: SchemaFormState, primaryId: string | undefined) {
  const cost = textValue(state, "estimatedCost");
  return {
    "@type": "HowTo",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    description: textValue(state, "description"),
    image: textValue(state, "imageUrl"),
    totalTime: textValue(state, "totalTime"),
    estimatedCost: cost
      ? {
          "@type": "MonetaryAmount",
          currency: textValue(state, "currency"),
          value: cost,
        }
      : undefined,
    supply: splitLines(value(state, "supply")).map((name) => ({
      "@type": "HowToSupply",
      name,
    })),
    tool: splitLines(value(state, "tool")).map((name) => ({
      "@type": "HowToTool",
      name,
    })),
    step: mapRepeater(state.repeaters.steps, (item, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: item.name,
      text: item.text,
      url: item.url,
      image: item.image,
    })),
  } satisfies JsonLdObject;
}

function productNode(state: SchemaFormState, primaryId: string | undefined) {
  const price = textValue(state, "price");
  const ratingValue = numberValue(state, "ratingValue");
  const reviewCount = numberValue(state, "reviewCount");
  const reviews = mapRepeater(state.repeaters.reviews, (item) => ({
    "@type": "Review",
    author: { "@type": "Person", name: item.author },
    datePublished: item.datePublished,
    reviewBody: item.body,
    reviewRating: {
      "@type": "Rating",
      ratingValue: item.rating ? Number(item.rating) : undefined,
      bestRating: 5,
      worstRating: 1,
    },
  }));

  return {
    "@type": "Product",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    description: textValue(state, "description"),
    image: imageList(state),
    brand: textValue(state, "brand")
      ? { "@type": "Brand", name: textValue(state, "brand") }
      : undefined,
    sku: textValue(state, "sku"),
    mpn: textValue(state, "mpn"),
    gtin: textValue(state, "gtin"),
    category: textValue(state, "category"),
    color: textValue(state, "color"),
    offers: price
      ? {
          "@type": "Offer",
          url: textValue(state, "offerUrl") || state.pageUrl,
          priceCurrency: textValue(state, "priceCurrency"),
          price,
          priceValidUntil: textValue(state, "priceValidUntil"),
          availability: schemaTerm(textValue(state, "availability")),
          itemCondition: schemaTerm(textValue(state, "itemCondition")),
          seller: textValue(state, "sellerName")
            ? {
                "@type": "Organization",
                name: textValue(state, "sellerName"),
              }
            : undefined,
        }
      : undefined,
    aggregateRating:
      ratingValue && reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: reviews,
  } satisfies JsonLdObject;
}

function recipeNode(state: SchemaFormState, primaryId: string | undefined) {
  const ratingValue = numberValue(state, "ratingValue");
  const reviewCount = numberValue(state, "reviewCount");
  return {
    "@type": "Recipe",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    description: textValue(state, "description"),
    image: imageList(state),
    author: textValue(state, "authorName")
      ? { "@type": "Person", name: textValue(state, "authorName") }
      : undefined,
    datePublished: textValue(state, "datePublished"),
    prepTime: textValue(state, "prepTime"),
    cookTime: textValue(state, "cookTime"),
    totalTime: textValue(state, "totalTime"),
    recipeYield: textValue(state, "recipeYield"),
    recipeCategory: textValue(state, "recipeCategory"),
    recipeCuisine: textValue(state, "recipeCuisine"),
    keywords: splitLines(value(state, "keywords")),
    recipeIngredient: splitLines(value(state, "ingredients")),
    recipeInstructions: mapRepeater(
      state.repeaters.instructions,
      (item, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: item.name,
        text: item.text,
        image: item.image,
      }),
    ),
    nutrition:
      textValue(state, "calories") || textValue(state, "servingSize")
        ? {
            "@type": "NutritionInformation",
            calories: textValue(state, "calories"),
            servingSize: textValue(state, "servingSize"),
          }
        : undefined,
    aggregateRating:
      ratingValue && reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  } satisfies JsonLdObject;
}

function eventNode(state: SchemaFormState, primaryId: string | undefined) {
  const attendance = textValue(state, "attendanceMode");
  const hasPhysical =
    attendance === "OfflineEventAttendanceMode" ||
    attendance === "MixedEventAttendanceMode";
  const hasVirtual =
    attendance === "OnlineEventAttendanceMode" ||
    attendance === "MixedEventAttendanceMode";
  const locations: JsonLdObject[] = [];
  if (hasPhysical) {
    locations.push({
      "@type": "Place",
      name: textValue(state, "venueName"),
      address: address(state),
    });
  }
  if (hasVirtual && textValue(state, "virtualUrl")) {
    locations.push({
      "@type": "VirtualLocation",
      url: textValue(state, "virtualUrl"),
    });
  }

  const offerUrl = textValue(state, "offerUrl");
  return {
    "@type": "Event",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    description: textValue(state, "description"),
    image: textValue(state, "imageUrl"),
    startDate: dateTimeWithOffset(state, "startDate"),
    endDate: dateTimeWithOffset(state, "endDate"),
    previousStartDate: dateTimeWithOffset(state, "previousStartDate"),
    eventStatus: schemaTerm(textValue(state, "eventStatus")),
    eventAttendanceMode: schemaTerm(attendance),
    location: locations.length === 1 ? locations[0] : locations,
    performer: textValue(state, "performerName")
      ? {
          "@type": textValue(state, "performerType") || "Person",
          name: textValue(state, "performerName"),
        }
      : undefined,
    organizer: textValue(state, "organizerName")
      ? {
          "@type": "Organization",
          name: textValue(state, "organizerName"),
          url: textValue(state, "organizerUrl"),
        }
      : undefined,
    offers: offerUrl
      ? {
          "@type": "Offer",
          url: offerUrl,
          price: textValue(state, "price"),
          priceCurrency: textValue(state, "priceCurrency"),
          availability: schemaTerm(textValue(state, "availability")),
          validFrom: dateTimeWithOffset(state, "validFrom"),
        }
      : undefined,
  } satisfies JsonLdObject;
}

function jobNode(state: SchemaFormState, primaryId: string | undefined) {
  const remote = boolValue(state, "remote");
  const countries = splitLines(value(state, "applicantCountries"));
  const salaryMin = numberValue(state, "salaryMin");
  const salaryMax = numberValue(state, "salaryMax");
  return {
    "@type": "JobPosting",
    "@id": primaryId,
    url: state.pageUrl,
    title: textValue(state, "title"),
    description: textValue(state, "description"),
    identifier: textValue(state, "identifier")
      ? {
          "@type": "PropertyValue",
          name: textValue(state, "hiringOrganizationName"),
          value: textValue(state, "identifier"),
        }
      : undefined,
    hiringOrganization: textValue(state, "hiringOrganizationName")
      ? {
          "@type": "Organization",
          name: textValue(state, "hiringOrganizationName"),
          sameAs: textValue(state, "hiringOrganizationUrl"),
          logo: textValue(state, "hiringOrganizationLogo"),
        }
      : undefined,
    industry: textValue(state, "industry"),
    employmentType: textValue(state, "employmentType"),
    datePosted: textValue(state, "datePosted"),
    validThrough: textValue(state, "validThrough"),
    directApply: boolValue(state, "directApply") || undefined,
    jobLocationType: remote ? "TELECOMMUTE" : undefined,
    applicantLocationRequirements: remote
      ? countries.map((name) => ({ "@type": "Country", name }))
      : undefined,
    jobLocation: !remote
      ? { "@type": "Place", address: address(state) }
      : undefined,
    baseSalary:
      salaryMin !== undefined || salaryMax !== undefined
        ? {
            "@type": "MonetaryAmount",
            currency: textValue(state, "salaryCurrency"),
            value: {
              "@type": "QuantitativeValue",
              minValue: salaryMin,
              maxValue: salaryMax,
              unitText: textValue(state, "salaryUnit"),
            },
          }
        : undefined,
    responsibilities: textValue(state, "responsibilities"),
    qualifications: textValue(state, "qualifications"),
    skills: textValue(state, "skills"),
    educationRequirements: textValue(state, "educationRequirements"),
    experienceRequirements: textValue(state, "experienceRequirements"),
  } satisfies JsonLdObject;
}

function localBusinessNode(
  state: SchemaFormState,
  primaryId: string | undefined,
) {
  const latitude = numberValue(state, "latitude");
  const longitude = numberValue(state, "longitude");
  return {
    "@type": textValue(state, "businessType") || "LocalBusiness",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    description: textValue(state, "description"),
    image: textValue(state, "imageUrl"),
    logo: textValue(state, "logoUrl"),
    telephone: textValue(state, "telephone"),
    email: textValue(state, "email"),
    priceRange: textValue(state, "priceRange"),
    address: address(state),
    geo:
      latitude !== undefined && longitude !== undefined
        ? {
            "@type": "GeoCoordinates",
            latitude,
            longitude,
          }
        : undefined,
    openingHours: splitLines(value(state, "openingHours")),
    sameAs: splitLines(value(state, "sameAs")),
  } satisfies JsonLdObject;
}

function organizationNode(
  state: SchemaFormState,
  primaryId: string | undefined,
) {
  return {
    "@type": textValue(state, "organizationType") || "Organization",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    alternateName: textValue(state, "alternateName"),
    legalName: textValue(state, "legalName"),
    description: textValue(state, "description"),
    logo: textValue(state, "logoUrl")
      ? { "@type": "ImageObject", url: textValue(state, "logoUrl") }
      : undefined,
    email: textValue(state, "email"),
    telephone: textValue(state, "telephone"),
    foundingDate: textValue(state, "foundingDate"),
    founder: textValue(state, "founderName")
      ? { "@type": "Person", name: textValue(state, "founderName") }
      : undefined,
    taxID: textValue(state, "taxId"),
    address: address(state),
    sameAs: splitLines(value(state, "sameAs")),
  } satisfies JsonLdObject;
}

function personNode(state: SchemaFormState, primaryId: string | undefined) {
  return {
    "@type": "Person",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    alternateName: textValue(state, "alternateName"),
    image: textValue(state, "imageUrl"),
    jobTitle: textValue(state, "jobTitle"),
    description: textValue(state, "description"),
    worksFor: textValue(state, "worksFor")
      ? {
          "@type": "Organization",
          name: textValue(state, "worksFor"),
          url: textValue(state, "worksForUrl"),
        }
      : undefined,
    knowsAbout: splitLines(value(state, "knowsAbout")),
    sameAs: splitLines(value(state, "sameAs")),
    email: textValue(state, "email"),
  } satisfies JsonLdObject;
}

function videoNode(state: SchemaFormState, primaryId: string | undefined) {
  const viewCount = numberValue(state, "viewCount");
  return {
    "@type": "VideoObject",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    description: textValue(state, "description"),
    thumbnailUrl: splitLines(value(state, "thumbnailUrls")),
    uploadDate: textValue(state, "uploadDate"),
    duration: textValue(state, "duration"),
    contentUrl: textValue(state, "contentUrl"),
    embedUrl: textValue(state, "embedUrl"),
    expires: textValue(state, "expires"),
    inLanguage: textValue(state, "inLanguage"),
    publisher: textValue(state, "publisherName")
      ? {
          "@type": "Organization",
          name: textValue(state, "publisherName"),
          logo: textValue(state, "publisherLogoUrl")
            ? {
                "@type": "ImageObject",
                url: textValue(state, "publisherLogoUrl"),
              }
            : undefined,
        }
      : undefined,
    interactionStatistic:
      viewCount !== undefined
        ? {
            "@type": "InteractionCounter",
            interactionType: { "@type": "WatchAction" },
            userInteractionCount: viewCount,
          }
        : undefined,
  } satisfies JsonLdObject;
}

function websiteNode(state: SchemaFormState, primaryId: string | undefined) {
  const searchTemplate = textValue(state, "searchUrlTemplate");
  return {
    "@type": "WebSite",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    alternateName: textValue(state, "alternateName"),
    description: textValue(state, "description"),
    inLanguage: textValue(state, "inLanguage"),
    publisher: textValue(state, "publisherName")
      ? {
          "@type": "Organization",
          name: textValue(state, "publisherName"),
          url: textValue(state, "publisherUrl"),
          logo: textValue(state, "publisherLogoUrl")
            ? {
                "@type": "ImageObject",
                url: textValue(state, "publisherLogoUrl"),
              }
            : undefined,
        }
      : undefined,
    potentialAction: searchTemplate
      ? {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: searchTemplate,
          },
          "query-input": "required name=search_term_string",
        }
      : undefined,
  } satisfies JsonLdObject;
}

function softwareNode(state: SchemaFormState, primaryId: string | undefined) {
  const ratingValue = numberValue(state, "ratingValue");
  const ratingCount = numberValue(state, "ratingCount");
  return {
    "@type": "SoftwareApplication",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    description: textValue(state, "description"),
    image: textValue(state, "imageUrl"),
    operatingSystem: textValue(state, "operatingSystem"),
    applicationCategory: textValue(state, "applicationCategory"),
    softwareVersion: textValue(state, "softwareVersion"),
    featureList: textValue(state, "featureList"),
    downloadUrl: textValue(state, "downloadUrl"),
    author: textValue(state, "authorName")
      ? { "@type": "Organization", name: textValue(state, "authorName") }
      : undefined,
    offers: textValue(state, "price")
      ? {
          "@type": "Offer",
          price: textValue(state, "price"),
          priceCurrency: textValue(state, "priceCurrency"),
        }
      : undefined,
    aggregateRating:
      ratingValue && ratingCount
        ? {
            "@type": "AggregateRating",
            ratingValue,
            ratingCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  } satisfies JsonLdObject;
}

function courseNode(state: SchemaFormState, primaryId: string | undefined) {
  return {
    "@type": "Course",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    description: textValue(state, "description"),
    courseCode: textValue(state, "courseCode"),
    educationalCredentialAwarded: textValue(
      state,
      "educationalCredentialAwarded",
    ),
    provider: textValue(state, "providerName")
      ? {
          "@type": "Organization",
          name: textValue(state, "providerName"),
          url: textValue(state, "providerUrl"),
        }
      : undefined,
    hasCourseInstance:
      textValue(state, "courseMode") ||
      textValue(state, "startDate") ||
      textValue(state, "endDate")
        ? {
            "@type": "CourseInstance",
            courseMode: textValue(state, "courseMode"),
            startDate: textValue(state, "startDate"),
            endDate: textValue(state, "endDate"),
            location: textValue(state, "locationName")
              ? {
                  "@type":
                    textValue(state, "courseMode") === "online"
                      ? "VirtualLocation"
                      : "Place",
                  name: textValue(state, "locationName"),
                }
              : undefined,
            offers: textValue(state, "price")
              ? {
                  "@type": "Offer",
                  price: textValue(state, "price"),
                  priceCurrency: textValue(state, "priceCurrency"),
                  url: state.pageUrl,
                }
              : undefined,
          }
        : undefined,
  } satisfies JsonLdObject;
}

function serviceNode(state: SchemaFormState, primaryId: string | undefined) {
  return {
    "@type": "Service",
    "@id": primaryId,
    url: state.pageUrl,
    name: textValue(state, "name"),
    serviceType: textValue(state, "serviceType"),
    description: textValue(state, "description"),
    provider: textValue(state, "providerName")
      ? {
          "@type": "Organization",
          name: textValue(state, "providerName"),
          url: textValue(state, "providerUrl"),
        }
      : undefined,
    areaServed: textValue(state, "areaServed"),
    audience: textValue(state, "audience")
      ? { "@type": "Audience", audienceType: textValue(state, "audience") }
      : undefined,
    serviceOutput: splitLines(value(state, "serviceOutput")).map((name) => ({
      "@type": "Thing",
      name,
    })),
    offers:
      textValue(state, "price") || textValue(state, "offerUrl")
        ? {
            "@type": "Offer",
            url: textValue(state, "offerUrl") || state.pageUrl,
            price: textValue(state, "price"),
            priceCurrency: textValue(state, "priceCurrency"),
          }
        : undefined,
  } satisfies JsonLdObject;
}

function buildPrimary(state: SchemaFormState) {
  const fragment = {
    article: "article",
    faq: "faq",
    breadcrumb: "breadcrumb",
    howto: "howto",
    product: "product",
    recipe: "recipe",
    event: "event",
    jobPosting: "job",
    localBusiness: "localbusiness",
    organization: "organization",
    person: "person",
    video: "video",
    website: "website",
    softwareApplication: "software",
    course: "course",
    service: "service",
  }[state.schemaType];
  const primaryId = idFor(state.pageUrl, fragment);

  switch (state.schemaType) {
    case "article":
      return articleNode(state, primaryId);
    case "faq":
      return { node: faqNode(state, primaryId), related: [] };
    case "breadcrumb":
      return { node: breadcrumbNode(state), related: [] };
    case "howto":
      return { node: howToNode(state, primaryId), related: [] };
    case "product":
      return { node: productNode(state, primaryId), related: [] };
    case "recipe":
      return { node: recipeNode(state, primaryId), related: [] };
    case "event":
      return { node: eventNode(state, primaryId), related: [] };
    case "jobPosting":
      return { node: jobNode(state, primaryId), related: [] };
    case "localBusiness":
      return { node: localBusinessNode(state, primaryId), related: [] };
    case "organization":
      return { node: organizationNode(state, primaryId), related: [] };
    case "person":
      return { node: personNode(state, primaryId), related: [] };
    case "video":
      return { node: videoNode(state, primaryId), related: [] };
    case "website":
      return { node: websiteNode(state, primaryId), related: [] };
    case "softwareApplication":
      return { node: softwareNode(state, primaryId), related: [] };
    case "course":
      return { node: courseNode(state, primaryId), related: [] };
    case "service":
      return { node: serviceNode(state, primaryId), related: [] };
  }
}

function displayName(state: SchemaFormState) {
  return (
    textValue(state, "headline") ||
    textValue(state, "title") ||
    textValue(state, "name") ||
    getSchemaDefinition(state.schemaType).label
  );
}

function clean(value: JsonLdValue | undefined): JsonLdValue | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (Array.isArray(value)) {
    const entries = value
      .map((entry) => clean(entry))
      .filter((entry): entry is JsonLdValue => entry !== undefined);
    return entries.length ? entries : undefined;
  }
  if (typeof value === "object") {
    const result: JsonLdObject = {};
    for (const [key, entry] of Object.entries(value)) {
      const cleaned = clean(entry);
      if (cleaned !== undefined) result[key] = cleaned;
    }
    return Object.keys(result).length ? result : undefined;
  }
  return value;
}

export function compileSchema(state: SchemaFormState): JsonLdObject {
  const primary = buildPrimary(state);
  const primaryId = primary.node["@id"] as string | undefined;
  const graph: JsonLdObject[] = [primary.node, ...primary.related];

  if (state.includeWebPage && state.pageUrl && state.schemaType !== "website") {
    graph.push({
      "@type": "WebPage",
      "@id": state.pageUrl,
      url: state.pageUrl,
      name: displayName(state),
      description: textValue(state, "description"),
      mainEntity: primaryId ? { "@id": primaryId } : undefined,
      breadcrumb:
        state.includeBreadcrumbs && state.breadcrumbs.length
          ? { "@id": idFor(state.pageUrl, "breadcrumb") }
          : undefined,
    });
  }

  if (
    state.includeBreadcrumbs &&
    state.schemaType !== "breadcrumb" &&
    state.breadcrumbs.length
  ) {
    graph.push(breadcrumbNode(state, state.breadcrumbs));
  }

  return clean({
    "@context": "https://schema.org",
    "@graph": graph,
  }) as JsonLdObject;
}

export function serializeJsonLd(state: SchemaFormState) {
  return JSON.stringify(compileSchema(state), null, 2).replace(/</g, "\\u003c");
}

export function serializeSchemaScript(state: SchemaFormState) {
  return `<script type="application/ld+json">\n${serializeJsonLd(state)}\n</script>`;
}

export function schemaDownloadName(
  state: SchemaFormState,
  extension: "jsonld" | "html",
) {
  const source = displayName(state)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 52);
  return `${source || state.schemaType}-schema.${extension}`;
}
