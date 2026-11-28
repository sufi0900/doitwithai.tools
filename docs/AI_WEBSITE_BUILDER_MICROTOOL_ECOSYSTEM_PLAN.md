# DoItWithAI.tools — AI Website Builder Reusable Micro-Tool Ecosystem, Custom Code Intake & 48-Tool Master Catalog (v1.1)

> **Purpose:** Product, security, and engineering specification for adding interactive, lead-generating micro-tools inside the **DoItWithAI AI Website Builder** without competing against `doitwithai.tools` public SEO tools and without risky AI code generation.

---

## 1. Zero-Conflict Positioning Strategy

- **On `doitwithai.tools` (Public Platform):** Host free SEO/AI utilities strictly as lead magnets showcasing what the platform can do (*"Built with DoItWithAI — Launch custom AI tools for your own niche in 60 seconds"*).
- **Inside AI Website Builder (Client Sites):**
  - Offer **42 Builder-Exclusive Niche Tools** (never published on `doitwithai.tools`) across Real Estate, Home Services/Solar, Health/Fitness, Education/Creators, E-Commerce, B2B SaaS, and Legal/HR/Events—so you never outrank or compete with your own clients.
  - Offer **6 White-Label SEO & Marketing Agency Tools** specifically for freelance SEOs and local agencies who want branded lead-capture utilities on their own domains.

---

## 2. Three Safe Tool Creation Paths (Zero Raw Client Code Execution)

### Path A — 1-Click Pre-Built Tool Library ($0.00 Creation Cost)
- Users browse 48 categorized JSON tool templates across 8 verticals and install any tool in 1 click.
- Automatically inherits the client's `TenantBrandDNA` hex palette, typography, logo, and optional email lead-capture gate.

### Path B — Builder Copilot Custom Tool Command (~$0.002 Creation Cost)
- Users chat naturally with the **Builder Copilot** (e.g., *"Add a Solar Battery Payback Calculator for Lahore homeowners"*).
- Instead of generating fragile React/JS code, Copilot outputs a **Zod-validated 30-line JSON config** rendered instantly by one of **3 pre-built Master React Engines**:
  1. **Engine 1: Formula Calculator Engine ($0.00 runtime)** — Sliders/numeric inputs + whitelisted arithmetic AST parser (zero `eval()`).
  2. **Engine 2: Scored Quiz & Audit Engine ($0.00 runtime)** — 5–8 questions + weighted score tiers + personalized result card + email lead gate.
  3. **Engine 3: AI Prompt-Wrapper Engine (Metered API)** — 2–4 structured form inputs + hidden niche prompt + per-IP visitor rate limit deducted from the site owner's token quota or BYOK key.

### Path C — "Submit Custom Tool" (User-Submitted Code Intake & Admin Decode Pipeline)
Allows advanced users to submit their own custom tool built in **any framework** (HTML/CSS/JS, React, Vue, Next.js, Python/Streamlit) safely:
1. **Submission UI:** Inside the Builder Tool Library, users click **Submit Custom Tool**, provide the tool name, industry, description, pasted code or ZIP/snippet, and choose visibility (`Private to My Site` or `Allow Listing in Global Directory`).
2. **Inactive Backend Storage:** Saved strictly as inert text/blob in Supabase (`custom_tool_submissions` with status `pending_review`). Submitted code is **never** executed directly on Cloudflare Workers.
3. **Admin Decode & Rebuild Workflow:** Your admin backend (assisted by an internal code-analyzer workflow) inspects the submitted framework, extracts UI layout, inputs/outputs, and business logic, runs a security audit, and converts it into either a **3-Engine JSON config** or a **clean native React component**.
4. **Directory Promotion & Sync:** Approved tools unlock directly on the submitter's website in their Brand DNA—and if opted in, expand your Global Builder Directory for all future customers.

---

## 3. Master Catalog: 48 Pre-Built Tools Across 8 Major Verticals

| # | Industry Vertical | Pre-Built Tools (6 per Vertical) | Engine Distribution |
| :-: | :--- | :--- | :--- |
| **1** | **Real Estate & Finance** *(Exclusive)* | Mortgage & EMI Calculator, Rent vs. Buy Estimator, Rental Yield & Cashflow Calc, Refinance Break-Even, Home Readiness Quiz, Property Listing Copy AI | 4 Calc · 1 Quiz · 1 AI |
| **2** | **Home Services, Solar & Trades** *(Exclusive)* | Solar Savings & Payback Calc, HVAC Tonnage & Cost Estimator, Roof/Paint Sq-Ft Quoter, Instant Project Scope Quiz, Seasonal Maintenance Checklist, Local Review Reply AI | 3 Calc · 2 Quiz · 1 AI |
| **3** | **Health, Fitness & Coaching** *(Exclusive)* | TDEE & Macro Planner, Ideal Protein & Hydration Calc, Body Composition Estimator, Fitness Readiness Quiz, Custom Workout Split Finder, Meal Prep Idea AI | 3 Calc · 2 Quiz · 1 AI |
| **4** | **Education, Courses & Creators** *(Exclusive)* | GPA & Final Grade Calculator, Study Schedule & Pomodoro Planner, Course Pricing & Launch Revenue Calc, Learning Style Quiz, Skill Level Placement Quiz, Lesson Outline AI | 3 Calc · 2 Quiz · 1 AI |
| **5** | **E-Commerce & Retail** *(Exclusive)* | Profit Margin & Pricing Calculator, Bundle Discount Savings Calc, Apparel/Size Finder Quiz, Product Matchmaker Quiz, Gift Finder Quiz, Product Description & FAQ AI | 2 Calc · 3 Quiz · 1 AI |
| **6** | **B2B SaaS & Consultants** *(Exclusive)* | SaaS ROI & Payback Calculator, Freelance Hourly Rate Calculator, Churn & LTV Calculator, Business Maturity Audit Quiz, Proposal Scope Estimator, Cold Outreach Hook AI | 3 Calc · 2 Quiz · 1 AI |
| **7** | **Legal, HR, Events & Travel** *(Exclusive)* | Wedding & Event Budget Planner, Trip Cost & Packing Estimator, Employee Hiring Cost Calc, Contract Readiness Quiz, Visa/Service Eligibility Quiz, Job Description AI | 3 Calc · 2 Quiz · 1 AI |
| **8** | **White-Label Marketing & SEO** *(Opt-In)* | White-Label SEO Readiness Quiz, Meta Title & Pixel Checker, Schema JSON-LD Generator, Readability & Density Check, Content Marketing ROI Calc, Ad Spend ROAS Calculator | 3 Calc · 2 Util · 1 Quiz |

---

## 4. Security, Agency OS Synergy & Rollout Sequence

- **Zero XSS / Zero `eval()`:** Engine 1 uses a strict math AST parser; Path C code never executes raw in production.
- **Abuse Protection:** Engine 3 enforces per-IP visitor rate limits (e.g., 5 runs/day) and bills against the site owner's quota or BYOK key.
- **Agency OS SEO Loop:** Every tool published via the Builder automatically registers in `TenantBrandDNA.live_sitemap_urls`, giving the 24/7 AI Agency's Article Writer high-converting internal link targets.
- **Recommended Build Order:** Complete **Phases 1–8 of `docs/AI_AGENCY_COMMERCIAL_MASTER_BLUEPRINT.md`** first, then execute this Website Builder Micro-Tool Ecosystem as the dedicated follow-up sprint.
