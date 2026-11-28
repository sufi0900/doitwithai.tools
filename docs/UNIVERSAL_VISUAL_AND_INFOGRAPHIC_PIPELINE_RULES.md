# Universal 6-Layer Visual & Pinterest 2:3 Infographic Pipeline Rules

> **Applies To**: All 26+ Visual & Infographic Tools (`lib/blog-infographic-studio/*`, `features/blog-infographic-studio/*`, and the Autonomous Campaign Studio `features/autonomous-campaign-studio/*`)

---

## 1. Core Architectural Principle: Zero-Token Programmatic SVG Synthesis

Every visual produced across `doitwithai.tools`—whether inside the standalone **Free AI Blog Section Infographic Generator** (`/tools/blog-section-infographic-generator`), the **AI Content Writer**, or the **Autonomous Campaign & Pinterest Growth Studio** (`/ai-content-writer/automation`)—must pass through the **6-Layer Agentic Visual Pipeline**:

1. **Layer 1 — Section & Article Relevance Gate (`filterProcessableArticleSections`)**:
   - Automatically strips non-substantive sections (`Conclusion`, `Final Thoughts`, `TL;DR`, `Summary`, `FAQ`, `References`, `Author Bio`, `Table of Contents`) before any visual is planned unless the user explicitly overrides the filter.
   - Prevents wasted cards on generic wrap-up paragraphs.
2. **Layer 2 — Topic Domain & Semantic Palette Intelligence**:
   - Infers domain palette and contextual iconography from both the article topic and section text (`ai_automation`, `seo_growth`, `finance_roi`, `security_governance`, `healthcare_bio`, `education_research`, `sustainability_energy`, `editorial_general`).
   - Harmonizes user brand colors (`brandPrimaryHex` / `brandSecondaryHex`) so custom hues remain high-contrast and WCAG AA legible.
3. **Layer 3 — Concept & Evidence Synthesis**:
   - Never dumps raw sentences or cuts off mid-clause with `...` or dangling prepositions (`including`, `that preserves`, `for checking`).
   - Synthesizes each card into a **3–6 word Conceptual Headline** + **1-sentence Proof/Action Micro-Summary** grounded in the source text's numbers, percentages, and named entities.
4. **Layer 4 — Content-Driven Layout & Aspect Ratio Router**:
   - Dynamically assigns the right visual structure based on section semantics:
     - `timeline` → Numbered step-by-step workflow (`1080×1350` or `1000×1500`)
     - `comparison` → Side-by-side VS / Before-vs-After matrix
     - `editorial` → High-impact KPI stat bento grid
     - `checklist` → Actionable verification checklist
5. **Layer 5 — Dynamic Canvas Height & Zero-Clipping Geometry**:
   - Calculates exact line counts and card heights before emitting SVG coordinates.
   - Expands or compacts card padding so 3, 4, 5, or 6 cards fill the canvas cleanly with zero overlapping text and zero bottom cutoffs.
6. **Layer 6 — Multi-Channel Export & Attribution Footer**:
   - Supports `1000×1500` (`2:3` Pinterest Vertical Pin), `1080×1350` (`4:5` LinkedIn/Instagram Carousel), `1200×675` (`16:9` Blog Hero), and `1080×1080` (`1:1` Square) with dynamic source domain attribution.

---

## 2. Autonomous Pinterest 2:3 Fresh-Pin Multi-Variant Rule (3 Pins per Article)

Pinterest's 2026–2027 ranking algorithm rewards **Fresh Pins** (distinct visual layouts + distinct headline hooks pointing to the same canonical URL, spaced across multiple days). For every article generated in the Autonomous Campaign Studio:

| Pin Variant | Aspect Ratio | Scheduled Day Offset | Psychological Hook Angle | Layout Variant |
| :--- | :--- | :--- | :--- | :--- |
| **Pin #1 (Launch Pin)** | `2:3` (`1000×1500`) | **Day 0** (Publish Day) | **Step-by-Step Timeline Playbook** | `timeline` |
| **Pin #2 (Comparison Pin)** | `2:3` (`1000×1500`) | **Day +4** | **Myth vs. Reality / Manual vs. Agentic** | `comparison` |
| **Pin #3 (Checklist Pin)** | `2:3` (`1000×1500`) | **Day +8** | **Actionable Audit Checklist & FAQ** | `checklist` |
