import type {
  SchemaDefinition,
  SchemaFieldDefinition,
  SchemaFieldKind,
  SchemaFieldOption,
  SchemaFormState,
  SchemaRepeaterItem,
  SchemaTypeId,
} from "./types";

const option = (label: string, value: string): SchemaFieldOption => ({
  label,
  value,
});

const f = (
  id: string,
  label: string,
  kind: SchemaFieldKind,
  extra: Omit<SchemaFieldDefinition, "id" | "label" | "kind"> = {},
): SchemaFieldDefinition => ({ id, label, kind, ...extra });

const text = (id: string, label: string, required = false, hint = "") =>
  f(id, label, "text", { required, recommended: !required, hint });

const url = (id: string, label: string, required = false, hint = "") =>
  f(id, label, "url", {
    required,
    recommended: !required,
    hint,
    placeholder: "https://example.com/...",
  });

const textarea = (id: string, label: string, required = false, hint = "") =>
  f(id, label, "textarea", {
    required,
    recommended: !required,
    hint,
    rows: 4,
  });

const list = (id: string, label: string, hint: string, required = false) =>
  f(id, label, "list", {
    required,
    recommended: !required,
    hint,
    rows: 4,
    placeholder: "Enter one item per line",
  });

const articleSections = [
  {
    id: "article-core",
    title: "Article identity",
    description:
      "Describe the visible article and use the most specific subtype.",
    fields: [
      f("articleType", "Article subtype", "select", {
        required: true,
        options: [
          option("Blog post", "BlogPosting"),
          option("News article", "NewsArticle"),
          option("General article", "Article"),
        ],
      }),
      text(
        "headline",
        "Schema headline",
        true,
        "Keep it descriptive and aligned with the visible H1.",
      ),
      textarea("description", "Article description", true),
      url("imageUrl", "Primary image URL", true),
      list(
        "additionalImages",
        "Additional image URLs",
        "One crawlable image URL per line.",
      ),
      text("articleSection", "Article section"),
      list(
        "keywords",
        "Keywords",
        "One natural topic phrase per line; do not stuff variants.",
      ),
      f("inLanguage", "Content language", "text", {
        recommended: true,
        placeholder: "en",
        hint: "Use a BCP 47 language code such as en, en-US, or ur-PK.",
      }),
    ],
  },
  {
    id: "article-people",
    title: "Authorship and publishing",
    description:
      "Connect the content to accountable author and publisher entities.",
    fields: [
      f("authorType", "Author type", "select", {
        required: true,
        options: [
          option("Person", "Person"),
          option("Organization", "Organization"),
        ],
      }),
      text("authorName", "Author name", true),
      url("authorUrl", "Author profile URL"),
      text("publisherName", "Publisher name", true),
      url("publisherUrl", "Publisher website URL"),
      url("publisherLogoUrl", "Publisher logo URL", true),
      f("datePublished", "Date published", "date", { required: true }),
      f("dateModified", "Date modified", "date", { recommended: true }),
    ],
  },
];

export const SCHEMA_DEFINITIONS: SchemaDefinition[] = [
  {
    id: "article",
    label: "Article",
    schemaType: "Article / BlogPosting / NewsArticle",
    support: "google",
    supportLabel: "Google-supported feature",
    summary:
      "Build a connected article entity with authorship, dates, images, and publisher identity.",
    useWhen:
      "Use on a single blog post, guide, editorial article, or news story.",
    sections: articleSections,
    sample: {
      pageUrl: "https://doitwithai.tools/ai-seo/schema-markup-optimization",
      pageContext:
        "A practical guide explaining how to create accurate, complete JSON-LD schema markup for search engines and AI systems, including types, title optimization, common mistakes, and validation.",
      values: {
        articleType: "BlogPosting",
        headline: "How to Optimize Schema Markup for AI Search Engines in 2026",
        description:
          "A practical guide to selecting, enriching, connecting, and validating Schema.org JSON-LD for modern search and AI discovery.",
        imageUrl: "https://doitwithai.tools/ogimage.png",
        additionalImages: "",
        articleSection: "AI SEO",
        keywords: "schema markup optimization\nJSON-LD\nAI SEO",
        inLanguage: "en",
        authorType: "Person",
        authorName: "Sufian Mustafa",
        authorUrl: "https://doitwithai.tools/author/sufian-mustafa",
        publisherName: "Do It With AI Tools",
        publisherUrl: "https://doitwithai.tools",
        publisherLogoUrl: "https://doitwithai.tools/doitwithai-logo-square.png",
        datePublished: "2026-01-01",
        dateModified: "2026-01-01",
      },
    },
  },
  {
    id: "faq",
    label: "FAQ Page",
    schemaType: "FAQPage",
    support: "limited",
    supportLabel: "Google display is restricted",
    summary:
      "Mark up visible, publisher-authored questions with one official answer each.",
    useWhen:
      "Use only when the page visibly contains a list of official questions and answers.",
    warning:
      "Google normally shows FAQ rich results only for well-known authoritative government and health sites. Valid FAQ markup does not imply a visible rich result.",
    sections: [
      {
        id: "faq-core",
        title: "FAQ page identity",
        description: "The questions below must be visible on the same page.",
        fields: [
          text("name", "FAQ page name", true),
          textarea("description", "FAQ page description"),
          f("inLanguage", "Content language", "text", {
            recommended: true,
            placeholder: "en",
          }),
        ],
      },
    ],
    repeaters: [
      {
        id: "faqs",
        label: "Questions and answers",
        description:
          "Add the official answer exactly as readers can see it on the page.",
        itemLabel: "FAQ",
        minItems: 1,
        fields: [
          textarea("question", "Question", true),
          textarea("answer", "Answer", true),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/schema-markup-faq",
      pageContext:
        "An FAQ page answering common implementation and validation questions about JSON-LD structured data.",
      values: {
        name: "Schema Markup FAQ",
        description:
          "Answers to common questions about creating and validating JSON-LD.",
        inLanguage: "en",
      },
      repeaters: {
        faqs: [
          {
            question: "Which schema format does Google recommend?",
            answer:
              "Google recommends JSON-LD for eligible structured data implementations.",
          },
          {
            question: "Does valid schema guarantee a rich result?",
            answer:
              "No. Valid markup creates eligibility, but Google does not guarantee that a rich result will appear.",
          },
        ],
      },
    },
  },
  {
    id: "breadcrumb",
    label: "Breadcrumb",
    schemaType: "BreadcrumbList",
    support: "google",
    supportLabel: "Google-supported feature",
    summary:
      "Describe the page hierarchy with ordered, canonical breadcrumb URLs.",
    useWhen: "Use when the page visibly belongs to a clear site hierarchy.",
    sections: [
      {
        id: "breadcrumb-core",
        title: "Breadcrumb trail",
        description: "The final item should represent the current page.",
        fields: [text("name", "Current page name", true)],
      },
    ],
    repeaters: [
      {
        id: "items",
        label: "Breadcrumb items",
        description: "Items are numbered automatically in the order shown.",
        itemLabel: "Breadcrumb",
        minItems: 2,
        fields: [
          text("name", "Label", true),
          url("item", "Canonical URL", true),
        ],
      },
    ],
    sample: {
      pageUrl: "https://doitwithai.tools/ai-seo/schema-markup-generator",
      pageContext:
        "A free schema markup generator inside the AI SEO section of Do It With AI Tools.",
      values: { name: "Schema Markup Generator" },
      repeaters: {
        items: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "AI SEO", item: "https://doitwithai.tools/ai-seo" },
          {
            name: "Schema Markup Generator",
            item: "https://doitwithai.tools/ai-seo/schema-markup-generator",
          },
        ],
      },
    },
  },
  {
    id: "howto",
    label: "How-to",
    schemaType: "HowTo",
    support: "retired",
    supportLabel: "Google rich result retired",
    summary:
      "Represent a visible sequence of instructions, supplies, tools, duration, and cost.",
    useWhen:
      "Use for a page whose main purpose is completing a task through ordered steps.",
    warning:
      "Google retired HowTo rich results and removed HowTo support from the Rich Results Test. The markup can still be valid Schema.org data.",
    sections: [
      {
        id: "howto-core",
        title: "How-to details",
        description:
          "Only include steps and materials that appear in the visible instructions.",
        fields: [
          text("name", "How-to name", true),
          textarea("description", "Description", true),
          url("imageUrl", "Primary image URL"),
          text(
            "totalTime",
            "Total time",
            false,
            "Use ISO 8601 duration, for example PT45M or PT2H.",
          ),
          text("estimatedCost", "Estimated cost"),
          text(
            "currency",
            "Currency code",
            false,
            "Use ISO 4217, for example USD or PKR.",
          ),
          list("supply", "Supplies", "One visible supply per line."),
          list("tool", "Tools", "One visible tool per line."),
        ],
      },
    ],
    repeaters: [
      {
        id: "steps",
        label: "Ordered steps",
        description: "Use concise names and complete visible instructions.",
        itemLabel: "Step",
        minItems: 2,
        fields: [
          text("name", "Step name", true),
          textarea("text", "Instructions", true),
          url("url", "Step URL"),
          url("image", "Step image URL"),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/guides/add-json-ld",
      pageContext:
        "A step-by-step guide showing website owners how to create, validate, and publish JSON-LD structured data.",
      values: {
        name: "How to Add Valid JSON-LD Schema Markup to a Website",
        description:
          "Create accurate JSON-LD, test the code, add it to the correct page, and verify the published URL.",
        imageUrl: "https://example.com/images/json-ld-guide.jpg",
        totalTime: "PT30M",
        estimatedCost: "0",
        currency: "USD",
        supply: "Page facts\nSchema.org documentation",
        tool: "Schema Markup Validator\nGoogle Rich Results Test",
      },
      repeaters: {
        steps: [
          {
            name: "Collect visible page facts",
            text: "List the exact entities, dates, images, and details shown to users.",
          },
          {
            name: "Create the JSON-LD",
            text: "Choose the most specific relevant type and add truthful required properties.",
          },
          {
            name: "Validate before publishing",
            text: "Check vocabulary in Schema.org Validator and eligible features in Google Rich Results Test.",
          },
        ],
      },
    },
  },
  {
    id: "product",
    label: "Product",
    schemaType: "Product",
    support: "google",
    supportLabel: "Google-supported feature",
    summary:
      "Connect a single product to identifiers, brand, offer, availability, and authentic ratings.",
    useWhen:
      "Use on a page focused on one specific product or product variant.",
    sections: [
      {
        id: "product-core",
        title: "Product identity",
        description:
          "Use stable identifiers and crawlable images for the exact item on the page.",
        fields: [
          text("name", "Product name", true),
          textarea("description", "Product description", true),
          url("imageUrl", "Primary image URL", true),
          list(
            "additionalImages",
            "Additional image URLs",
            "One image URL per line.",
          ),
          text("brand", "Brand", true),
          text("sku", "SKU"),
          text("mpn", "MPN"),
          text("gtin", "GTIN / UPC / EAN"),
          text("category", "Product category"),
          text("color", "Color"),
        ],
      },
      {
        id: "product-offer",
        title: "Offer and availability",
        description:
          "Price and availability must match the visible product page and stay current.",
        fields: [
          f("price", "Price", "number", { required: true, min: 0, step: 0.01 }),
          text("priceCurrency", "Currency code", true),
          f("availability", "Availability", "select", {
            required: true,
            options: [
              option("In stock", "InStock"),
              option("Out of stock", "OutOfStock"),
              option("Pre-order", "PreOrder"),
              option("Back order", "BackOrder"),
              option("Limited availability", "LimitedAvailability"),
            ],
          }),
          f("itemCondition", "Item condition", "select", {
            recommended: true,
            options: [
              option("New", "NewCondition"),
              option("Used", "UsedCondition"),
              option("Refurbished", "RefurbishedCondition"),
              option("Damaged", "DamagedCondition"),
            ],
          }),
          f("priceValidUntil", "Price valid until", "date", {
            recommended: true,
          }),
          url("offerUrl", "Offer URL"),
          text("sellerName", "Seller name"),
          f("ratingValue", "Aggregate rating", "number", {
            min: 1,
            max: 5,
            step: 0.1,
          }),
          f("reviewCount", "Review count", "number", { min: 1, step: 1 }),
        ],
      },
    ],
    repeaters: [
      {
        id: "reviews",
        label: "Visible reviews",
        description: "Only add genuine reviews displayed on this product page.",
        itemLabel: "Review",
        fields: [
          text("author", "Reviewer name", true),
          f("rating", "Rating", "number", {
            required: true,
            min: 1,
            max: 5,
            step: 0.1,
          }),
          textarea("body", "Review text", true),
          f("datePublished", "Review date", "date", {}),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/products/schema-audit-pro",
      pageContext:
        "A product detail page for Schema Audit Pro, a paid web application that audits JSON-LD and reports required and recommended fields.",
      values: {
        name: "Schema Audit Pro",
        description:
          "A web application for auditing JSON-LD syntax, entity relationships, and Google rich result requirements.",
        imageUrl: "https://example.com/images/schema-audit-pro.png",
        additionalImages: "",
        brand: "Example Labs",
        sku: "SAP-001",
        mpn: "",
        gtin: "",
        category: "SEO Software",
        color: "",
        price: "29",
        priceCurrency: "USD",
        availability: "InStock",
        itemCondition: "NewCondition",
        priceValidUntil: "2026-12-31",
        offerUrl: "https://example.com/products/schema-audit-pro",
        sellerName: "Example Labs",
        ratingValue: "",
        reviewCount: "",
      },
    },
  },
  {
    id: "recipe",
    label: "Recipe",
    schemaType: "Recipe",
    support: "google",
    supportLabel: "Google-supported feature",
    summary:
      "Structure ingredients, timings, yield, nutrition, instructions, and media for one recipe.",
    useWhen: "Use on a page that contains a complete recipe users can prepare.",
    sections: [
      {
        id: "recipe-core",
        title: "Recipe identity",
        description:
          "Name, description, images, and author should match the visible recipe.",
        fields: [
          text("name", "Recipe name", true),
          textarea("description", "Recipe description", true),
          url("imageUrl", "Primary image URL", true),
          list(
            "additionalImages",
            "Additional image URLs",
            "One crawlable image per line.",
          ),
          text("authorName", "Author name", true),
          f("datePublished", "Date published", "date", { recommended: true }),
          text(
            "prepTime",
            "Preparation time",
            false,
            "ISO 8601, for example PT15M.",
          ),
          text(
            "cookTime",
            "Cooking time",
            false,
            "ISO 8601, for example PT30M.",
          ),
          text("totalTime", "Total time", true, "ISO 8601, for example PT45M."),
          text("recipeYield", "Yield / servings", true),
          text("recipeCategory", "Recipe category"),
          text("recipeCuisine", "Cuisine"),
          list("keywords", "Keywords", "One natural recipe topic per line."),
        ],
      },
      {
        id: "recipe-details",
        title: "Ingredients and nutrition",
        description:
          "Include exact visible quantities and nutrition facts only.",
        fields: [
          list(
            "ingredients",
            "Ingredients",
            "One full ingredient line per item.",
            true,
          ),
          text(
            "calories",
            "Calories",
            false,
            "Include the unit, for example 420 calories.",
          ),
          text("servingSize", "Serving size"),
          f("ratingValue", "Aggregate rating", "number", {
            min: 1,
            max: 5,
            step: 0.1,
          }),
          f("reviewCount", "Review count", "number", { min: 1, step: 1 }),
        ],
      },
    ],
    repeaters: [
      {
        id: "instructions",
        label: "Recipe instructions",
        description: "Keep the order identical to the visible recipe.",
        itemLabel: "Instruction",
        minItems: 2,
        fields: [
          text("name", "Step name"),
          textarea("text", "Instruction", true),
          url("image", "Step image URL"),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/recipes/quick-vegetable-biryani",
      pageContext:
        "A beginner-friendly vegetable biryani recipe with exact ingredients, preparation time, cooking time, nutrition, and step-by-step instructions.",
      values: {
        name: "Quick Vegetable Biryani for Beginners",
        description:
          "A fragrant one-pot vegetable biryani with clear beginner instructions.",
        imageUrl: "https://example.com/images/vegetable-biryani.jpg",
        additionalImages: "",
        authorName: "Ayesha Khan",
        datePublished: "2026-08-01",
        prepTime: "PT20M",
        cookTime: "PT35M",
        totalTime: "PT55M",
        recipeYield: "4 servings",
        recipeCategory: "Main course",
        recipeCuisine: "South Asian",
        keywords: "vegetable biryani\none-pot rice recipe",
        ingredients:
          "2 cups basmati rice\n3 cups mixed vegetables\n1 tablespoon biryani masala",
        calories: "420 calories",
        servingSize: "1 bowl",
        ratingValue: "",
        reviewCount: "",
      },
      repeaters: {
        instructions: [
          {
            name: "Rinse the rice",
            text: "Rinse the basmati rice until the water runs clear, then soak it for 20 minutes.",
          },
          {
            name: "Cook the vegetables",
            text: "Cook the vegetables with the spices until they begin to soften.",
          },
          {
            name: "Steam the biryani",
            text: "Layer the rice and vegetables, cover, and steam until the rice is tender.",
          },
        ],
      },
    },
  },
  {
    id: "event",
    label: "Event",
    schemaType: "Event",
    support: "google",
    supportLabel: "Google-supported feature",
    summary:
      "Describe one physical, virtual, or mixed event with status, venue, organizer, performer, and offer.",
    useWhen:
      "Use on a leaf page dedicated to a single event, not a schedule or category list.",
    sections: [
      {
        id: "event-core",
        title: "Event identity and schedule",
        description:
          "Use complete ISO date-times with the correct local time offset when possible.",
        fields: [
          text("name", "Event name", true),
          textarea("description", "Event description", true),
          url("imageUrl", "Event image URL", true),
          f("startDate", "Start date and time", "datetime-local", {
            required: true,
          }),
          f("endDate", "End date and time", "datetime-local", {
            recommended: true,
          }),
          text(
            "timezoneOffset",
            "UTC offset",
            false,
            "Use ±HH:MM, for example +05:00 for Pakistan Standard Time.",
          ),
          f("eventStatus", "Event status", "select", {
            recommended: true,
            options: [
              option("Scheduled", "EventScheduled"),
              option("Postponed", "EventPostponed"),
              option("Rescheduled", "EventRescheduled"),
              option("Cancelled", "EventCancelled"),
              option("Moved online", "EventMovedOnline"),
            ],
          }),
          f("attendanceMode", "Attendance mode", "select", {
            required: true,
            options: [
              option("Offline", "OfflineEventAttendanceMode"),
              option("Online", "OnlineEventAttendanceMode"),
              option("Mixed", "MixedEventAttendanceMode"),
            ],
          }),
          text(
            "previousStartDate",
            "Previous start date",
            false,
            "Use only for a rescheduled event.",
          ),
        ],
      },
      {
        id: "event-location",
        title: "Location and entities",
        description:
          "Physical events need a named venue and complete address; online events need a join URL.",
        fields: [
          text("venueName", "Venue name"),
          text("streetAddress", "Street address"),
          text("addressLocality", "City"),
          text("addressRegion", "Region / state"),
          text("postalCode", "Postal code"),
          text("addressCountry", "Country code"),
          url("virtualUrl", "Virtual event URL"),
          text("performerName", "Performer / speaker"),
          f("performerType", "Performer type", "select", {
            recommended: true,
            options: [
              option("Person", "Person"),
              option("Organization", "Organization"),
              option("Music group", "MusicGroup"),
            ],
          }),
          text("organizerName", "Organizer name", true),
          url("organizerUrl", "Organizer URL"),
        ],
      },
      {
        id: "event-offer",
        title: "Ticket offer",
        description:
          "Keep price and availability synchronized with the visible ticket page.",
        fields: [
          url("offerUrl", "Ticket URL"),
          f("price", "Ticket price", "number", { min: 0, step: 0.01 }),
          text("priceCurrency", "Currency code"),
          f("availability", "Ticket availability", "select", {
            recommended: true,
            options: [
              option("In stock", "InStock"),
              option("Sold out", "SoldOut"),
              option("Pre-order", "PreOrder"),
            ],
          }),
          f("validFrom", "Tickets available from", "datetime-local", {
            recommended: true,
          }),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/events/ai-seo-workshop-karachi",
      pageContext:
        "A dedicated registration page for a live AI SEO workshop in Karachi with event dates, venue, trainer, organizer, ticket price, and availability.",
      values: {
        name: "AI SEO Implementation Workshop — Karachi",
        description:
          "A practical workshop for creating search-ready AI content and structured data workflows.",
        imageUrl: "https://example.com/images/ai-seo-workshop.jpg",
        startDate: "2026-10-10T10:00",
        endDate: "2026-10-10T16:00",
        timezoneOffset: "+05:00",
        eventStatus: "EventScheduled",
        attendanceMode: "OfflineEventAttendanceMode",
        previousStartDate: "",
        venueName: "Tech Hub Karachi",
        streetAddress: "Shahrah-e-Faisal",
        addressLocality: "Karachi",
        addressRegion: "Sindh",
        postalCode: "75350",
        addressCountry: "PK",
        virtualUrl: "",
        performerName: "Sufian Mustafa",
        performerType: "Person",
        organizerName: "Do It With AI Tools",
        organizerUrl: "https://doitwithai.tools",
        offerUrl: "https://example.com/events/ai-seo-workshop-karachi#tickets",
        price: "5000",
        priceCurrency: "PKR",
        availability: "InStock",
        validFrom: "2026-08-24T09:00",
      },
    },
  },
  {
    id: "jobPosting",
    label: "Job Posting",
    schemaType: "JobPosting",
    support: "google",
    supportLabel: "Google-supported feature",
    summary:
      "Create a policy-aware job entity with employer, location or remote eligibility, dates, and compensation.",
    useWhen:
      "Use on a single, active job vacancy page where applicants can view the complete role.",
    sections: [
      {
        id: "job-core",
        title: "Role and employer",
        description:
          "The description should contain the complete visible job description, not a short teaser.",
        fields: [
          text("title", "Job title", true),
          textarea("description", "Full job description", true),
          text("identifier", "Internal job identifier"),
          text("hiringOrganizationName", "Hiring organization", true),
          url("hiringOrganizationUrl", "Organization URL"),
          url("hiringOrganizationLogo", "Organization logo URL"),
          text("industry", "Industry"),
          f("employmentType", "Employment type", "select", {
            required: true,
            options: [
              option("Full time", "FULL_TIME"),
              option("Part time", "PART_TIME"),
              option("Contractor", "CONTRACTOR"),
              option("Temporary", "TEMPORARY"),
              option("Intern", "INTERN"),
              option("Volunteer", "VOLUNTEER"),
              option("Per diem", "PER_DIEM"),
              option("Other", "OTHER"),
            ],
          }),
          f("datePosted", "Date posted", "date", { required: true }),
          f("validThrough", "Valid through", "datetime-local", {
            required: true,
          }),
          f("directApply", "Direct apply available", "checkbox", {
            recommended: true,
          }),
        ],
      },
      {
        id: "job-location",
        title: "Location or remote eligibility",
        description:
          "Remote roles must state eligible countries or regions on the visible page.",
        fields: [
          f("remote", "Fully remote job", "checkbox", {}),
          text("streetAddress", "Street address"),
          text("addressLocality", "City"),
          text("addressRegion", "Region / state"),
          text("postalCode", "Postal code"),
          text("addressCountry", "Country code"),
          list(
            "applicantCountries",
            "Remote applicant countries",
            "One ISO country code or country name per line.",
          ),
        ],
      },
      {
        id: "job-compensation",
        title: "Compensation and requirements",
        description:
          "Use the same compensation and qualification details shown to candidates.",
        fields: [
          f("salaryMin", "Minimum salary", "number", { min: 0, step: 0.01 }),
          f("salaryMax", "Maximum salary", "number", { min: 0, step: 0.01 }),
          text("salaryCurrency", "Salary currency"),
          f("salaryUnit", "Salary unit", "select", {
            recommended: true,
            options: [
              option("Hour", "HOUR"),
              option("Day", "DAY"),
              option("Week", "WEEK"),
              option("Month", "MONTH"),
              option("Year", "YEAR"),
            ],
          }),
          textarea("responsibilities", "Responsibilities"),
          textarea("qualifications", "Qualifications"),
          textarea("skills", "Skills"),
          textarea("educationRequirements", "Education requirements"),
          textarea("experienceRequirements", "Experience requirements"),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/jobs/nextjs-ai-automation-developer",
      pageContext:
        "A full-time remote job vacancy for a Next.js developer who can build AI applications, RAG assistants, and workflow automations.",
      values: {
        title: "Next.js AI Automation Developer",
        description:
          "Build and maintain production AI tools, retrieval systems, and workflow integrations in Next.js. Collaborate with product and SEO teams, write tests, and monitor reliability.",
        identifier: "AI-NEXT-2026-04",
        hiringOrganizationName: "Example Labs",
        hiringOrganizationUrl: "https://example.com",
        hiringOrganizationLogo: "https://example.com/logo.png",
        industry: "Software",
        employmentType: "FULL_TIME",
        datePosted: "2026-08-20",
        validThrough: "2026-10-01T23:59",
        directApply: true,
        remote: true,
        streetAddress: "",
        addressLocality: "",
        addressRegion: "",
        postalCode: "",
        addressCountry: "",
        applicantCountries: "Pakistan\nUnited Arab Emirates",
        salaryMin: "2500",
        salaryMax: "4000",
        salaryCurrency: "USD",
        salaryUnit: "MONTH",
        responsibilities:
          "Build AI-enabled Next.js features and maintain reliable API integrations.",
        qualifications:
          "Production experience with TypeScript, Next.js, APIs, and testing.",
        skills: "Next.js, TypeScript, structured outputs, RAG, webhooks",
        educationRequirements: "Equivalent practical experience accepted.",
        experienceRequirements:
          "Two or more years building production web applications.",
      },
    },
  },
  {
    id: "localBusiness",
    label: "Local Business",
    schemaType: "LocalBusiness",
    support: "google",
    supportLabel: "Google-supported feature",
    summary:
      "Connect a real business location to contact details, address, coordinates, hours, and identity profiles.",
    useWhen:
      "Use on a page representing a specific physical business location.",
    sections: [
      {
        id: "business-core",
        title: "Business identity",
        description:
          "Choose the most specific valid subtype that represents the real business.",
        fields: [
          f("businessType", "Business subtype", "select", {
            required: true,
            options: [
              option("Local business", "LocalBusiness"),
              option("Professional service", "ProfessionalService"),
              option("Store", "Store"),
              option("Restaurant", "Restaurant"),
              option("Medical business", "MedicalBusiness"),
              option("Legal service", "LegalService"),
              option("Financial service", "FinancialService"),
              option("Real estate agent", "RealEstateAgent"),
              option("Auto repair", "AutoRepair"),
            ],
          }),
          text("name", "Business name", true),
          textarea("description", "Business description"),
          url("imageUrl", "Business image URL", true),
          url("logoUrl", "Logo URL"),
          text("telephone", "Telephone", true),
          text("email", "Email"),
          text(
            "priceRange",
            "Price range",
            false,
            "Examples: $, $$, or PKR 5,000–20,000.",
          ),
          list(
            "sameAs",
            "Official profiles",
            "One authoritative social or directory URL per line.",
          ),
        ],
      },
      {
        id: "business-location",
        title: "Location and hours",
        description:
          "Address, coordinates, and hours must represent this exact location.",
        fields: [
          text("streetAddress", "Street address", true),
          text("addressLocality", "City", true),
          text("addressRegion", "Region / state"),
          text("postalCode", "Postal code", true),
          text("addressCountry", "Country code", true),
          f("latitude", "Latitude", "number", {
            recommended: true,
            min: -90,
            max: 90,
            step: 0.000001,
          }),
          f("longitude", "Longitude", "number", {
            recommended: true,
            min: -180,
            max: 180,
            step: 0.000001,
          }),
          list(
            "openingHours",
            "Opening hours",
            "One Schema.org value per line, for example Mo-Fr 09:00-17:00.",
          ),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/locations/karachi",
      pageContext:
        "A location page for a digital consultancy in Karachi with address, contact information, opening hours, and official profiles.",
      values: {
        businessType: "ProfessionalService",
        name: "Example AI Consultancy — Karachi",
        description:
          "AI application, automation, and search strategy consulting for growing businesses.",
        imageUrl: "https://example.com/images/karachi-office.jpg",
        logoUrl: "https://example.com/logo.png",
        telephone: "+92-21-00000000",
        email: "hello@example.com",
        priceRange: "PKR 25,000–250,000",
        sameAs: "https://www.linkedin.com/company/example",
        streetAddress: "Shahrah-e-Faisal",
        addressLocality: "Karachi",
        addressRegion: "Sindh",
        postalCode: "75350",
        addressCountry: "PK",
        latitude: "24.8607",
        longitude: "67.0011",
        openingHours: "Mo-Fr 09:00-17:00\nSa 10:00-14:00",
      },
    },
  },
  {
    id: "organization",
    label: "Organization",
    schemaType: "Organization",
    support: "google",
    supportLabel: "Google-supported feature",
    summary:
      "Define a durable organization entity with logo, identifiers, contacts, address, founders, and authoritative profiles.",
    useWhen:
      "Use primarily on the organization homepage or a dedicated about page.",
    sections: [
      {
        id: "organization-core",
        title: "Organization identity",
        description:
          "Use the official name, canonical homepage, and authoritative identity links.",
        fields: [
          f("organizationType", "Organization subtype", "select", {
            required: true,
            options: [
              option("Organization", "Organization"),
              option("Corporation", "Corporation"),
              option("Online business", "OnlineBusiness"),
              option("NGO", "NGO"),
              option("Educational organization", "EducationalOrganization"),
            ],
          }),
          text("name", "Official name", true),
          text("alternateName", "Alternate name"),
          url("logoUrl", "Logo URL", true),
          textarea("description", "Organization description"),
          text("email", "Public email"),
          text("telephone", "Public telephone"),
          text(
            "foundingDate",
            "Founding date",
            false,
            "Use YYYY, YYYY-MM, or YYYY-MM-DD.",
          ),
          text("founderName", "Founder name"),
          text("legalName", "Legal name"),
          text("taxId", "Tax ID"),
          list(
            "sameAs",
            "Authoritative profiles",
            "One official social or knowledge profile URL per line.",
          ),
        ],
      },
      {
        id: "organization-address",
        title: "Postal address",
        description:
          "Add a real public address only when it is appropriate for the organization.",
        fields: [
          text("streetAddress", "Street address"),
          text("addressLocality", "City"),
          text("addressRegion", "Region / state"),
          text("postalCode", "Postal code"),
          text("addressCountry", "Country code"),
        ],
      },
    ],
    sample: {
      pageUrl: "https://doitwithai.tools",
      pageContext:
        "The homepage of Do It With AI Tools, an AI SEO education, tools, and implementation platform founded by Sufian Mustafa.",
      values: {
        organizationType: "OnlineBusiness",
        name: "Do It With AI Tools",
        alternateName: "DIWAI Tools",
        logoUrl: "https://doitwithai.tools/doitwithai-logo-square.png",
        description: "An AI SEO education, tools, and implementation platform.",
        email: "",
        telephone: "",
        foundingDate: "",
        founderName: "Sufian Mustafa",
        legalName: "",
        taxId: "",
        sameAs: "https://www.linkedin.com/in/sufianmustafa",
        streetAddress: "",
        addressLocality: "",
        addressRegion: "",
        postalCode: "",
        addressCountry: "PK",
      },
    },
  },
  {
    id: "person",
    label: "Person",
    schemaType: "Person",
    support: "schema",
    supportLabel: "Schema.org entity markup",
    summary:
      "Create a consistent person entity with profile, role, organization, expertise, and verified identity links.",
    useWhen:
      "Use on an author, founder, expert, or team profile page focused on one person.",
    sections: [
      {
        id: "person-core",
        title: "Person identity",
        description:
          "Use facts visible on the profile and authoritative sameAs URLs.",
        fields: [
          text("name", "Full name", true),
          text("alternateName", "Alternate name"),
          url("imageUrl", "Profile image URL", true),
          text("jobTitle", "Job title"),
          textarea("description", "Profile description", true),
          text("worksFor", "Organization"),
          url("worksForUrl", "Organization URL"),
          list(
            "knowsAbout",
            "Areas of expertise",
            "One real expertise area per line.",
          ),
          list(
            "sameAs",
            "Authoritative profiles",
            "One verified profile URL per line.",
          ),
          text("email", "Public email"),
        ],
      },
    ],
    sample: {
      pageUrl: "https://doitwithai.tools/author/sufian-mustafa",
      pageContext:
        "An author and founder profile for Sufian Mustafa covering his work in AI SEO, Next.js development, AI applications, and automation systems.",
      values: {
        name: "Sufian Mustafa",
        alternateName: "",
        imageUrl:
          "https://doitwithai.tools/sufian-mustafa-founder-doitwithaitools.png",
        jobTitle: "Founder and AI Tools Expert",
        description:
          "Founder of Do It With AI Tools, focused on AI SEO, AI-powered web applications, and automation systems.",
        worksFor: "Do It With AI Tools",
        worksForUrl: "https://doitwithai.tools",
        knowsAbout: "AI SEO\nNext.js\nAI applications\nWorkflow automation",
        sameAs: "https://www.linkedin.com/in/sufianmustafa",
        email: "",
      },
    },
  },
  {
    id: "video",
    label: "Video",
    schemaType: "VideoObject",
    support: "google",
    supportLabel: "Google-supported feature",
    summary:
      "Describe a page-primary video with thumbnails, dates, duration, media URLs, publisher, and interaction data.",
    useWhen:
      "Use when the video is a main part of the page and users can watch it there.",
    sections: [
      {
        id: "video-core",
        title: "Video details",
        description:
          "The thumbnail must be crawlable and the video should be prominent on the page.",
        fields: [
          text("name", "Video name", true),
          textarea("description", "Video description", true),
          list(
            "thumbnailUrls",
            "Thumbnail URLs",
            "One crawlable thumbnail URL per line.",
            true,
          ),
          f("uploadDate", "Upload date", "date", { required: true }),
          text(
            "duration",
            "Duration",
            false,
            "Use ISO 8601, for example PT8M32S.",
          ),
          url("contentUrl", "Video file URL"),
          url("embedUrl", "Embed URL"),
          f("expires", "Expiration date", "date", {}),
          text("publisherName", "Publisher name", true),
          url("publisherLogoUrl", "Publisher logo URL", true),
          f("viewCount", "View count", "number", { min: 0, step: 1 }),
          text("inLanguage", "Video language"),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/videos/schema-markup-tutorial",
      pageContext:
        "A video watch page containing an eight-minute tutorial on creating and validating JSON-LD schema markup.",
      values: {
        name: "Schema Markup Tutorial: Build and Validate JSON-LD",
        description:
          "A practical walkthrough of selecting a schema type, completing the right fields, and testing the final JSON-LD.",
        thumbnailUrls: "https://example.com/images/schema-video-16x9.jpg",
        uploadDate: "2026-08-10",
        duration: "PT8M32S",
        contentUrl: "https://cdn.example.com/videos/schema-tutorial.mp4",
        embedUrl: "https://example.com/embed/schema-tutorial",
        expires: "",
        publisherName: "Example Labs",
        publisherLogoUrl: "https://example.com/logo.png",
        viewCount: "1250",
        inLanguage: "en",
      },
    },
  },
  {
    id: "website",
    label: "Website",
    schemaType: "WebSite",
    support: "google",
    supportLabel: "Google site-name signal",
    summary:
      "Define the site’s canonical identity, preferred name, language, publisher, and internal search action.",
    useWhen: "Use once on the website homepage, not on every page.",
    sections: [
      {
        id: "website-core",
        title: "Website identity",
        description: "The page URL should be the canonical homepage URL.",
        fields: [
          text("name", "Website name", true),
          text("alternateName", "Alternate website name"),
          textarea("description", "Website description"),
          text("inLanguage", "Primary language"),
          text("publisherName", "Publisher name", true),
          url("publisherUrl", "Publisher URL"),
          url("publisherLogoUrl", "Publisher logo URL"),
          text(
            "searchUrlTemplate",
            "Internal search URL template",
            false,
            "Example: https://example.com/search?q={search_term_string}. SearchAction does not guarantee a Google search box.",
          ),
        ],
      },
    ],
    sample: {
      pageUrl: "https://doitwithai.tools",
      pageContext:
        "The homepage for Do It With AI Tools, an educational and practical platform about AI SEO, AI tools, coding, and automation.",
      values: {
        name: "Do It With AI Tools",
        alternateName: "DIWAI Tools",
        description:
          "Learn, build, and grow with practical AI SEO guidance, tools, prompts, and implementation resources.",
        inLanguage: "en",
        publisherName: "Do It With AI Tools",
        publisherUrl: "https://doitwithai.tools",
        publisherLogoUrl: "https://doitwithai.tools/doitwithai-logo-square.png",
        searchUrlTemplate:
          "https://doitwithai.tools/search?q={search_term_string}",
      },
    },
  },
  {
    id: "softwareApplication",
    label: "Software App",
    schemaType: "SoftwareApplication",
    support: "google",
    supportLabel: "Google review feature support",
    summary:
      "Describe a software product with platform, category, version, offer, and authentic aggregate rating.",
    useWhen: "Use on a page dedicated to one software application.",
    sections: [
      {
        id: "software-core",
        title: "Application identity",
        description:
          "Use the exact application, platform, and offer shown on the page.",
        fields: [
          text("name", "Application name", true),
          textarea("description", "Application description", true),
          url("imageUrl", "Application image URL"),
          text("operatingSystem", "Operating system", true),
          text("applicationCategory", "Application category", true),
          text("softwareVersion", "Software version"),
          text(
            "featureList",
            "Feature list",
            false,
            "Use a concise comma-separated list visible on the page.",
          ),
          text("price", "Price", true),
          text("priceCurrency", "Currency code", true),
          f("ratingValue", "Aggregate rating", "number", {
            min: 1,
            max: 5,
            step: 0.1,
          }),
          f("ratingCount", "Rating count", "number", { min: 1, step: 1 }),
          text("authorName", "Developer / author"),
          url("downloadUrl", "Download URL"),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/apps/schema-builder",
      pageContext:
        "A landing page for a browser-based schema markup builder with a free plan, supported types, live validation checks, and JSON-LD export.",
      values: {
        name: "Schema Builder",
        description:
          "A browser-based application for producing complete JSON-LD from type-specific forms.",
        imageUrl: "https://example.com/images/schema-builder.png",
        operatingSystem: "Any",
        applicationCategory: "BusinessApplication",
        softwareVersion: "1.0",
        featureList:
          "Dynamic schema forms, deterministic JSON-LD, readiness checks, downloads",
        price: "0",
        priceCurrency: "USD",
        ratingValue: "",
        ratingCount: "",
        authorName: "Example Labs",
        downloadUrl: "",
      },
    },
  },
  {
    id: "course",
    label: "Course",
    schemaType: "Course",
    support: "limited",
    supportLabel: "Google support has changed",
    summary:
      "Describe a real course, provider, delivery mode, dates, location, and offer.",
    useWhen: "Use on a page dedicated to a specific educational course.",
    warning:
      "Google retired the Course Info rich result in 2025. Course structured data remains part of Schema.org, and Google separately documents Course list experiences.",
    sections: [
      {
        id: "course-core",
        title: "Course details",
        description:
          "Do not use Course markup for a general article, tutorial, or thin lead form.",
        fields: [
          text("name", "Course name", true),
          textarea("description", "Course description", true),
          text("providerName", "Course provider", true),
          url("providerUrl", "Provider URL"),
          text("courseCode", "Course code"),
          text("educationalCredentialAwarded", "Credential awarded"),
          f("courseMode", "Course mode", "select", {
            recommended: true,
            options: [
              option("Online", "online"),
              option("On site", "onsite"),
              option("Blended", "blended"),
            ],
          }),
          f("startDate", "Start date", "date", {}),
          f("endDate", "End date", "date", {}),
          text("locationName", "Location name"),
          text("price", "Course price"),
          text("priceCurrency", "Currency code"),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/courses/ai-seo-foundations",
      pageContext:
        "A dedicated course page for an online AI SEO foundations program with provider details, schedule, certificate, and price.",
      values: {
        name: "AI SEO Foundations",
        description:
          "A practical online course covering AI-aware search strategy, structured content, and schema markup.",
        providerName: "Example Academy",
        providerUrl: "https://example.com",
        courseCode: "AISEO-101",
        educationalCredentialAwarded: "Certificate of completion",
        courseMode: "online",
        startDate: "2026-10-01",
        endDate: "2026-11-15",
        locationName: "Online",
        price: "199",
        priceCurrency: "USD",
      },
    },
  },
  {
    id: "service",
    label: "Service",
    schemaType: "Service",
    support: "schema",
    supportLabel: "Schema.org entity markup",
    summary:
      "Connect a service to its provider, audience, area served, offer, and visible deliverables.",
    useWhen:
      "Use on a page focused on one real service rather than a product or local location.",
    sections: [
      {
        id: "service-core",
        title: "Service details",
        description:
          "Use visible, specific service facts and do not add unsupported claims.",
        fields: [
          text("name", "Service name", true),
          text("serviceType", "Service type", true),
          textarea("description", "Service description", true),
          text("providerName", "Provider name", true),
          url("providerUrl", "Provider URL"),
          text("areaServed", "Area served"),
          text("audience", "Target audience"),
          text("price", "Starting price"),
          text("priceCurrency", "Currency code"),
          url("offerUrl", "Offer / inquiry URL"),
          list(
            "serviceOutput",
            "Service deliverables",
            "One visible deliverable per line.",
          ),
        ],
      },
    ],
    sample: {
      pageUrl: "https://example.com/services/ai-seo-implementation",
      pageContext:
        "A service page for AI SEO implementation, including technical schema, content systems, measurement, and team enablement.",
      values: {
        name: "AI SEO Implementation Service",
        serviceType: "AI SEO consulting and implementation",
        description:
          "A structured engagement covering technical schema, AI-search content systems, measurement, and team enablement.",
        providerName: "Example Consultancy",
        providerUrl: "https://example.com",
        areaServed: "Worldwide",
        audience: "SaaS and content-led businesses",
        price: "2500",
        priceCurrency: "USD",
        offerUrl: "https://example.com/contact",
        serviceOutput:
          "Technical schema plan\nContent optimization system\nMeasurement dashboard",
      },
    },
  },
];

const definitionMap = new Map(
  SCHEMA_DEFINITIONS.map((definition) => [definition.id, definition]),
);

export function getSchemaDefinition(type: SchemaTypeId) {
  const definition = definitionMap.get(type);
  if (!definition) throw new Error(`Unknown schema type: ${type}`);
  return definition;
}

export function makeRepeaterItem(
  values: Record<string, string> = {},
): SchemaRepeaterItem {
  return {
    _key:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...values,
  };
}

function emptyValues(definition: SchemaDefinition) {
  const values: Record<string, string | boolean> = {};
  for (const section of definition.sections) {
    for (const field of section.fields) {
      values[field.id] = field.kind === "checkbox" ? false : "";
    }
  }
  return values;
}

function emptyRepeaters(definition: SchemaDefinition) {
  const repeaters: Record<string, SchemaRepeaterItem[]> = {};
  for (const repeater of definition.repeaters || []) {
    const itemCount = repeater.minItems || 0;
    repeaters[repeater.id] = Array.from({ length: itemCount }, () =>
      makeRepeaterItem(),
    );
  }
  return repeaters;
}

export function createSchemaState(
  schemaType: SchemaTypeId = "article",
  useSample = false,
): SchemaFormState {
  const definition = getSchemaDefinition(schemaType);
  const values = emptyValues(definition);
  const repeaters = emptyRepeaters(definition);

  if (useSample) {
    Object.assign(values, definition.sample.values);
    for (const [key, items] of Object.entries(
      definition.sample.repeaters || {},
    )) {
      repeaters[key] = items.map((item) => makeRepeaterItem(item));
    }
  }

  return {
    schemaType,
    pageUrl: useSample ? definition.sample.pageUrl : "",
    pageContext: useSample ? definition.sample.pageContext : "",
    values,
    repeaters,
    includeWebPage: schemaType !== "website" && schemaType !== "breadcrumb",
    includeBreadcrumbs: false,
    breadcrumbs: [makeRepeaterItem(), makeRepeaterItem()],
    visibleContentConfirmed: useSample,
  };
}

export const SCHEMA_SUPPORT_STYLES = {
  google:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  limited:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  retired:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300",
  schema:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
} as const;
