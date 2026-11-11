# DoItWithAI.tools — Master Industrial Tool Optimization Handbook & Universal AI Upgrade Prompt

This handbook documents the complete engineering, visual design, canvas geometry, user experience (UX), and SEO/AEO architecture developed across multiple iterations while transforming the **Free AI Testimonial Card Generator (`/tools/quote-stat-testimonial-card-studio`)** into a flagship, competitor-beating industrial studio.

Use this handbook—and the **Copy-Paste Master Prompt in Section 8**—whenever upgrading any tool in the `doitwithai.tools` catalog (whether with Gemini, Claude, Cursor, Windsurf, Copilot, or a human developer).

## Scope: transfer engineering practices, never unrelated content

Portrait framing and photo controls below apply only when a person's image belongs in the tool's output. **The blog section infographic studio must not contain executive portrait presets, testimonial copy or photo-framing controls.** It uses content-driven diagrams, optional editorial artwork and a company logo. Its detailed implementation contract is in `docs/INFOGRAPHIC_STUDIO_DESIGN.md`.

Reuse measured spacing, responsive controls, live previews, accessible interactions and export consistency. Do not copy testimonial headlines, ratings, invented results, or a competitor's artwork. Treat the portrait-specific examples and checklist items in this handbook as conditional, including the master prompt.

## 1. Evolution Post-Mortem: Every Problem We Solved & Why It Matters

During the multi-turn overhaul of `/tools/quote-stat-testimonial-card-studio`, we encountered and permanently solved seven critical failure modes that commonly break AI-built visual and interactive tools:

| Iteration Stage | Defect / Bottleneck Observed | Root Cause | Permanent Engineering Fix Applied |
| :--- | :--- | :--- | :--- |
| **Stage 1: Generic Tool UI** | The tool looked like a generic form rather than a dedicated SaaS product (like Aragon or Senja). | Controls were scattered, the hero had no visual proof, and templates used generic static icons. | Built a unified 2-column studio (`lg:col-span-5` sticky left control deck + `lg:col-span-7` live HD canvas & live template gallery) plus an auto-cycling right-side Hero Showcase. |
| **Stage 2: Raw Gray Background Boxes on Portraits** | Preset portraits (`Marcus`, `Daniel`, `Tariq`, `Sufian`) and uploaded photos displayed ugly rectangular gray/dark studio walls over cream cards, arches, and rings. | The renderer assumed preset PNGs had alpha transparency (`cutout: true`) and drew raw unclipped rectangles (`ctx.drawImage` / `<Image className="object-contain">`). | Created **Architectural Portrait Framing** (clipping photos directly inside Concentric Rings, Rounded Arches, or Bordered Architectural Windows) + an instant `<15ms` client-side border flood-fill background remover (`removeStudioBackdropInstant`) paired with MediaPipe. |
| **Stage 3: Concentric Rings Behind Square Photos** | In ring templates (`obsidian-gold-rings`), concentric rings were drawn on the background while a rectangular photo sat awkwardly on top of them. | Rings and portrait were rendered as separate unlinked layers instead of a unified circular mask. | Centered the 3 concentric rings at `(rcx, rcy)` and **clipped the portrait inside the inner circle (`innerR`)** with a glowing accent ring border and studio gradient backdrop inside the circle. |
| **Stage 4: Full-Bleed & Split Layout Text Overlap** | In `full-bleed-portrait` and split templates, quote lines, author attribution, and trust pills collided with the person's shoulder or face. | Text column width (`60%`) and portrait zone width (`55%`) overlapped in the middle `15%` of the card, and hero `fill` images overflowed their column. | Enforced **Strict Non-Overlapping Column Math** (left text column bounded to `tw = pz.x - tx - colGap` with a minimum `32px` gutter) and replaced raw full-bleed hero fills with a **Sleek Architectural Rounded Portrait Window (`rounded-3xl border-[2.5px]`)** + radial aura + floating badge. |
| **Stage 5: Rigid Photo & Logo Placement** | Users could not adjust how their uploaded face sat inside a ring or arch, nor resize their uploaded company logo. | Only basic X-offset and scale sliders existed; Y-offset (Up/Down), corner radius, ring size, and logo badge styles were missing. | Added **5 Real-Time Photo Sliders** (`Photo Zoom`, `Ring / Frame Size`, `Position Up / Down`, `Position Left / Right`, `Circle / Corner Radius 0%–50%`), **5 Frame Mode Pills**, and **Logo Scale + Badge Style (`Auto`, `Brand Pill`, `White Box`, `Dark Box`, `No Box`)**. |
| **Stage 6: Generic Template Listing Icons** | Below the canvas, the template selector used generic SVG icons instead of showing what each template actually looks like. | Static thumbnail components did not reflect the template's real layout or the user's active quote/photo/colors. | Built `TemplateThumb`, which renders a live miniature `<canvas>` (`0.35x` scale via `useDeferredValue`) of each of the 14 templates using the user's own quote, photo, logo, and brand colors. |
| **Stage 7: Dropped "Free AI" Keywords & Import Mismatches** | An intermediate rewrite shortened the title to `"Free Testimonial Card Generator"`, dropping `"AI"`, and used barrel imports that failed on build. | Over-trimming copy removed core search intent (`free AI testimonial card generator`), and `@/features/tool-ui` lacked an `index.ts` barrel. | Restored `"Free AI [Tool Name]"` across Meta Title, H1, single-sentence Meta Description, Quick Answer, and FAQs, and standardized explicit module imports (`@/features/tool-ui/visualCardExport`, etc.) plus `features/tool-ui/index.ts`. |

## 2. Core Principle: Tool-Specific Competitor Analysis & Custom Templates (Never Copy-Paste Layouts Across Different Tools!)

Every tool on `doitwithai.tools` competes against dedicated, single-purpose SaaS websites. Therefore, **never copy-paste the Testimonial Card Studio's templates onto an unrelated tool**. Every tool must have its own domain-specific templates, controls, and hero showcase tailored to its exact user job:

| Tool Category / Example Slug | What Dedicated Competitors Offer | Required Custom Templates (10–14 Per Tool) | Required Custom Dashboard Controls |
| :--- | :--- | :--- | :--- |
| **Testimonial, Quote & Social Proof Studio** (`/tools/quote-stat-testimonial-card-studio`) | Senja, Aragon, Testimonial.to | 1. Arch Aura Split, 2. Concentric Ring Portrait, 3. Flagship Studio Split, 4. Editorial Dot-Grid, 5. Curved Wave + 3 Pills, 6. Full-Bleed Split, 7. Left Portrait, 8. KPI Stat + Ring, 9. Verified Social Post, 10. Founder Memo, 11. Before/After, 12. Myth/Reality, 13. Podcast Waveform, 14. Quote + 3 Takeaways | Customer Photo upload + 4 male executive presets, Auto BG cutout, Frame Mode (`Auto`, `Circle in Ring`, `Arch`, `Radius`, `Cutout`), Up/Down/Left/Right/Zoom/Radius sliders, Brand Logo upload + Scale + Badge Style, 3 Proof Pills |
| **LinkedIn PDF Carousel & Slide Studio** (`/tools/blog-to-linkedin-carousel`) | Taplio, AICarousels, Contentdrips | 1. Bold Hook Cover Slide, 2. Numbered Step-by-Step Card, 3. Problem vs. Solution Split, 4. Giant KPI Stat Slide, 5. Framework Matrix (2×2), 6. Checklist Cheat-Sheet Slide, 7. Code / Prompt Terminal Slide, 8. Case Study Timeline, 9. Contrarian Myth/Truth, 10. Author CTA & Follow Outro Slide | Slide-by-slide switcher (`Slide 1..10`), Swipe Arrow style toggle, Page Number indicator toggle, Author Header/Footer toggle, Portrait Ring/Window in Cover & Outro slides, Multi-Page PDF + ZIP PNG export |
| **Data-to-Chart & KPI Visual Maker** (`/tools/data-to-chart-visual-card-maker`) | ChartBlocks, Infogram, Flourish | 1. Horizontal Benchmark Bar Card, 2. Multi-Metric KPI Scorecard Grid, 3. Before/After Delta Bar Chart, 4. Growth Trend Area/Line Card, 5. Donut Share Breakdown, 6. 2×2 Quadrant Matrix, 7. Funnel Conversion Stages, 8. Executive Stat + Portrait Callout | Interactive Data Rows editor (`Label`, `Value`, `Benchmark/Delta`, `Highlight toggle`), Unit prefix/suffix (`$`, `%`, `x`, `ms`), Chart Sort toggle, Gridline & Value Label toggles, Source Citation footer |
| **Pinterest Pin & Vertical Graphic Studio** (`/tools/pinterest-pin-visual-generator`) | Tailwind Create, Canva Pin Maker | 1. Top Photo + Center Ribbon Title (`1000×1500`), 2. Split 2-Photo Collage Pin, 3. Numbered Listicle / Checklist Pin, 4. Step-by-Step Tutorial Pin, 5. Editorial Magazine Cover Pin, 6. Dark SaaS / Prompt Cheat-Sheet Pin, 7. Before/After Transformation Pin | Aspect Ratio (`2:3 Standard Pin 1000×1500`, `1:2.1 Long Pin`, `1:1 Square`), Hero Photo Upload + Pan/Zoom/Arch/Circle mask, Ribbon/Badge text, Domain Pill position, Batch 5-Pin variation generator |
| **SEO Calculators, Audits & Schema Validators** (`/tools/seo-roi-calculator`, `/tools/faq-schema-validator`, etc.) | Ahrefs/Semrush Free Widgets, TechnicalSEO.com | Interactive Gauge / Readiness Ring, Live Google SERP / Rich Result Preview Card, Color-Coded Pass/Warn/Fail Diagnostic Matrix, Downloadable Executive Summary Card | Real-time sliders + numeric inputs with instant recalculation (zero page reload), 1-click presets (`SaaS`, `E-Commerce`, `Local Business`, `Agency`), Copy JSON-LD / Export CSV / Download Report PNG |

## 3. Pixel-Perfect Canvas & Layout Engineering Rules (Zero Overlap Guarantee)

Whenever a tool renders visuals on an HTML5 `<canvas>` or inside a DOM preview card, enforce these mathematical layout rules:

### Rule 3.1: Strict Non-Overlapping Zone Allocation (Mathematical Gutters)
Never allow text boxes and image/portrait zones to share overlapping coordinates.
1. Define outer card margins: `m = Math.round(Math.min(W, H) * 0.045)`, `cx = m`, `cy = m`, `cw = W - m * 2`, `ch = H - m * 2`, `pad = Math.round(cw * 0.052)`.
2. Reserve footer height first: `fh = footer === "bar" ? Math.round(ch * 0.17) : footer === "wave" ? Math.round(ch * 0.20) : 0`, `bodyH = ch - fh`.
3. Reserve portrait/visual column width `pw` and a mandatory gutter `colGap = Math.round(cw * 0.032)` (`~34px` on a 1080p canvas):
   - If portrait is on the right:
     - Portrait Zone `pz = { x: cx + cw - pad * 0.75 - pw, y: cy + Math.round(bodyH * 0.05), w: pw, h: Math.round(bodyH * 0.91) }`
     - Text Column `tx = cx + pad`, `tw = pz.x - tx - colGap`
   - If portrait is on the left:
     - Portrait Zone `pz = { x: cx + pad * 0.75, y: cy + Math.round(bodyH * 0.05), w: pw, h: Math.round(bodyH * 0.91) }`
     - Text Column `tx = pz.x + pz.w + colGap`, `tw = cx + cw - pad - tx`
4. **Hard Boundary Constraint**: Every text element (`drawRichQuote`, `drawStars`, `drawPills`, `drawNameBlock`, KPI callouts, checklists) must pass `tw` as its maximum width and wrap or truncate inside `tw`.

### Rule 3.2: Vertical Stack Budgeting (Bottom-Up Reservation)
To prevent quotes or headings from colliding with bottom trust pills or author attribution bars:
1. Compute `qTop` (the Y coordinate below the top quote mark / star rating / KPI stat).
2. Compute `bottomLimit` starting from `cy + bodyH - Math.round(pad * 0.45)`:
   - Subtract the measured height of the proof pills (`pl = layoutPills(ctx, pills, tw, pillFontPx); bottomLimit -= pl.height + 16`).
   - If author attribution is inside the column rather than in a bottom bar, subtract the avatar + name block height (`bottomLimit -= avatarR * 2 + 18`).
3. Pass `box: { x: tx, y: qTop, w: tw, h: Math.max(110, bottomLimit - qTop) }` to `drawRichQuote()`.
4. Inside `drawRichQuote()`, iterate font size downward (`for (size = maxSize; size >= minSize; size -= 2)`) until `lines.length * size * lineHeightRatio <= box.h`. This guarantees that a 30-character quote renders large and bold while a 240-character quote automatically scales down to fit without ever touching the pills or footer.

### Rule 3.3: Architectural Portrait & Image Framing (Never Draw Raw Unclipped Boxes)
Never draw an uploaded or preset image directly onto a card without an architectural frame or clean cutout mask:
1. **Concentric Ring Mode (`ring-circle`)**:
   - Draw 2–3 outer concentric rings (`outerR = innerR * 1.30`, `midR = innerR * 1.15`) + 4 orbital accent nodes + a soft radial glow behind the rings.
   - Clip the canvas to the inner circle (`ctx.beginPath(); ctx.arc(rcx, rcy, innerR, 0, Math.PI * 2); ctx.clip()`).
   - Fill a studio radial gradient inside the circle (`shade(accent, 0.42)` to `#0B1120` on dark cards; `alpha(accent, 0.28)` to `#CBD5E1` on light cards).
   - Draw the portrait cover-fitted to `innerR * 2` with user pan/zoom (`portraitScale`, `portraitOffsetX`, `portraitOffsetY`).
   - Restore clip and stroke a `4.5px` accent ring + `1.5px` inner white specular ring around `innerR`.
2. **Architectural Arch Mode (`arch`)**:
   - Draw an offset accent arch shadow behind the main arch.
   - Clip to `ctx.roundRect(archX, archY, archW, archH, [archW / 2, archW / 2, botR, botR])`.
   - Fill studio interior gradient, draw cover-fitted portrait with pan/zoom, restore clip, and stroke a `4px` accent border.
3. **Adjustable-Radius / Editorial Window Mode (`rounded`)**:
   - Map `portraitRadius` (`0%` to `50%`) to pixel corner radius `rPx = Math.round((radiusPct / 50) * (Math.min(boxW, boxH) / 2))`.
   - Draw an offset accent card (`boxX + 10, boxY + 10`), clip to `roundRect(boxX, boxY, boxW, boxH, rPx)`, fill studio interior, draw cover-fitted portrait, restore clip, and stroke a `3.5px` accent border.
4. **Full-Bleed Split Mode (`bleed`)**:
   - In the Canvas Renderer: clip to the right `42%` panel, draw cover-fitted portrait, and overlay a multi-stop horizontal gradient seam (`0%` card surface color -> `38%` `alpha(surface, 0.72)` -> `100%` transparent) plus a bottom vignette.
   - In the DOM Hero Showcase (`HeroAnimatedTestimonialShowcase.tsx`): use a **Sleek Architectural Rounded Portrait Window (`rounded-3xl border-[2.5px] bg-slate-900 shadow-2xl`)** over an ambient radial glow aura and dot-grid accent, with a subtle bottom fade and floating `⚡ Verified Founder` pill badge so the portrait never collides with adjacent text on any screen width.

### Rule 3.4: Real-Time User Customization Controls
Every visual tool where users upload or select photos and logos must provide these real-time controls in Step 1 of the left panel:
- **Photo Frame Mode Selector**: `Auto (Template)`, `Circle in Ring`, `Arch Frame`, `Radius Frame`, `Cutout Aura` + `Reset Fit` button.
- **Photo Sliders**:
  1. `Photo Zoom` (`portraitScale`: `0.70` to `1.45`, default `1.0`)
  2. `Ring / Frame Size` (`portraitRingScale`: `0.75` to `1.20`, default `1.0`)
  3. `Position Up / Down` (`portraitOffsetY`: `-0.25` to `0.25`, default `0`)
  4. `Position Left / Right` (`portraitOffsetX`: `-0.25` to `0.25`, default `0`)
  5. `Circle / Corner Radius` (`portraitRadius`: `0%` Square to `50%` Full Circle, default `24%`)
- **Logo Sliders & Styles**:
  1. `Logo Scale` (`logoScale`: `0.70` to `1.45`, default `1.0`)
  2. `Logo Container Style` (`logoBgStyle`: `Auto`, `Brand Pill`, `White Box`, `Dark Box`, `No Box`)

## 4. Hero Section, Navbar & Interactive Showcase Rules

1. **Clean Single-Line Navbar (`components/Header/index.tsx`)**:
   - Never use `<h1>`–`<h6>` heading tags inside the site header or mega-menu dropdowns (use `<p>` or `<span>` so SEO heading crawlers only see page-content headings).
   - Keep top-level navigation items concise (`Home`, `Tools`, `AI Agents`, `SEO Hub`, `Prompts`, `Resources`) with `whitespace-nowrap` so the navbar never wraps onto two lines.
2. **Left Hero Column (`app/tools/[slug]/page.tsx`)**:
   - Top trust pill: `Free AI [Tool Name] · No Signup · Zero Watermark ★ 4.9/5`.
   - Category eyebrow in uppercase tracking.
   - **H1 Heading**: Must start with or naturally feature the primary `"Free AI [Tool Name]"` keyword (e.g., `Free AI Testimonial Card Generator: Customer Quote, Photo & Logo Studio`).
   - **Hero Action Bar (`PortableToolHeroBar`)**:
     - **Primary Button #1 (Dominant)**: `"Use Tool Now: [Action Label]"` (smooth-scrolls to `#tool-studio-workspace`).
     - **Secondary Buttons**: `"Use in Do It AI →"`, `"Customize & Embed"`, and `"Download PC App (.ZIP)"`.
3. **Right Hero Column (`HeroAnimated...Showcase.tsx`)**:
   - Auto-cycles every `3200ms` (pauses on mouse hover, skips ticks when `document.hidden`).
   - Top bar displays clickable template pills (`Arch Frame`, `Circle in Ring`, `Editorial Grid`, `Full-Bleed Split`, `KPI Stat + Ring`) so users can manually switch slides.
   - Fixed-height stage (`h-[365px] sm:h-[380px]`) using stacked absolute slides with smooth opacity/scale transitions so the hero height never jumps.
   - Bottom quick-action bar displays `"Customize this layout in Studio ↓"`, which dispatches `new CustomEvent("select-testimonial-template", { detail: { template, portraitPreset, accent } })` and smooth-scrolls to `#tool-studio-workspace`.
4. **Strict 100% Male Executive Portraits Rule**:
   - Across all preset selectors, hero showcase slides, and sample cards, use **100% male executive portraits only** (`Marcus Vance`, `Daniel Mercer`, `Tariq Al-Mansoor`, `Sufian Mustafa`). Never add female avatars or stock photos.

## 5. Verified Next.js / TypeScript Import & State Rules

To guarantee zero build errors on Vercel and local `next build`:

1. **Use Verified Module Imports**:
   ```tsx
   import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
   import {
     ToolHeroBackground,
     toolHeroHeading,
     toolHeroSurface,
   } from "@/features/tool-ui/ToolHero";
   import PlatformBrandIcon from "@/features/tool-ui/PlatformBrandIcon";
   import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
   import ToolRunOverlay, {
     focusToolSection,
   } from "@/features/tool-ui/ToolRunOverlay";
   import {
     copyCanvasImageToClipboard,
     downloadCanvasAsEmbeddedSvg,
     downloadCanvasAsPng,
     printCanvasAsPdfPoster,
     resolveStudioTheme,
     STUDIO_COLOR_THEMES,
     type CustomStudioColorOverrides,
     type StudioColorThemeId,
   } from "@/features/tool-ui/visualCardExport";
   ```
2. **Use Valid `StudioColorThemeId` Defaults**:
   - Default `themeId` must be a valid key from `STUDIO_COLOR_THEMES` in `visualCardExport.ts` (such as `"royal-cobalt"`).
3. **Handle `UrlArticleExtractorBar` Payload Correctly**:
   - In `onExtracted={(data) => ...}`, read `data.url`, `data.domain`, `data.author`, `data.paragraphs`, and `data.cleanText`.
4. **Never Wipe User Edits When Switching Templates or Sizes**:
   - Memoize the fallback card pack only on `[input.sourceContent, input.brandDomain]`—never on `[input]`—so clicking a new template, aspect ratio, portrait preset, or slider updates the live canvas without overwriting the text the user typed into Card 1, Card 2, or Card 3.

## 6. Below-the-Fold SEO, AEO & Internal Linking Architecture

Every upgraded tool page (`app/tools/[slug]/page.tsx`) must include these structured, keyword-optimized sections below the interactive workspace:

1. **Metadata & JSON-LD Schema `@graph`**:
   - **Title**: Includes `"Free AI [Tool Name]"` + primary use case (`55–62` characters).
   - **Single-Sentence Meta Description**: Exactly one natural, high-CTR sentence (`145–160` characters) stating what the user can create/analyze for free and what formats they can export.
   - **JSON-LD `@graph`**: Includes `WebApplication` (with `featureList` and `offers: { price: "0" }`), `HowTo` (3 concrete steps), `BreadcrumbList`, and `FAQPage` (8–10 rich Q&As).
2. **50-Word Quick Answer Box**:
   - Directly below the workspace, provide a concise, bold-key-phrase 50-word answer to the primary `"How do you..."` query to win Google AI Overviews, Perplexity citations, and Featured Snippets.
3. **3-Step Visual Workflow Section**:
   - Three numbered cards (`1`, `2`, `3`) explaining the exact workflow in plain, scannable language.
4. **Template / Capability Breakdown Grid**:
   - Lists all built-in templates or diagnostic modules with their layout badge (`Arch Frame`, `Circle in Ring`, `Before / After`, etc.) and an anchor link `"Preview in live studio above ↑"`.
5. **6 Industry Use-Case Cards**:
   - Tailored to high-value segments (`SaaS & B2B landing pages`, `AI automation & marketing agencies`, `Local businesses`, `Coaches & creators`, `E-commerce & Shopify`, `Founders & executives`).
6. **3 Deep-Dive Differentiator Cards + Competitor Comparison Table**:
   - Compares `DoItWithAI Studio` vs. `Single-Purpose Paid Generators` vs. `Manual Design Software` across Templates, Framing/Customization, AI URL Extraction, and Export Formats/Price.
7. **Natural "Do It With AI" (`/do-it-ai`) Command Center Integration**:
   - A high-contrast dark gradient banner explaining how users can chain this tool with related tools inside `/do-it-ai?tool=[slug]`, with direct links to 2–3 companion tools.
8. **Three Visually Distinct Internal-Linking Promotional Card Grids**:
   - **Grid 1 — Ready-Made AI Prompt Packs (`PROMPT_PROMO_CARDS`)**: Dark slate cards (`bg-slate-950 border-purple-500/25`) with hero image, purple badge, and a `<pre>` monospace prompt snippet linking to `/prompts/*`.
   - **Grid 2 — Editorial Blog & Strategy Guides (`BLOG_GUIDE_CARDS`)**: Clean white/dark magazine cards with cover image, category + read time, summary, and author attribution (`By Sufian Mustafa`) linking to `/guides`, `/ai-seo`, and `/ai-tools`.
   - **Grid 3 — Free AI Courses & Learn-and-Earn Tracks (`COURSE_LEARNING_CARDS`)**: Emerald curriculum cards (`border-emerald-500/25 bg-emerald-50/40`) with module checklists (`Module 1`, `Module 2`, `Module 3`) linking to `/ai-learn-earn`, `/ai-code`, and `/what-our-ai-tool-can-do`.
9. **Related Tools Grid + `ToolResources` + `ToolFaq`**.

## 7. Pre-Push Quality & Responsiveness Checklist

Before committing or pushing any tool upgrade to `sufi0900/doitwithai.tools`, verify every item below:

- [ ] **Zero Text-Image Overlap**: Tested with both short (30-char) and maximum (240-char) text across all templates and all 3 aspect ratios (`1:1`, `4:5`, `16:9`).
- [ ] **Zero Unclipped Background Boxes**: Every portrait or uploaded image sits cleanly inside its Ring Circle, Arch Frame, Rounded Architectural Window, or transparent studio cutout.
- [ ] **Real-Time Sliders Work Smoothly**: Zoom, Ring/Frame Size, Position Up/Down, Position Left/Right, Corner Radius (`0%–50%`), and Logo Scale + Badge Style all update the canvas in real time.
- [ ] **Live Template Previews**: Every card in the template selector renders a live miniature preview of that exact layout rather than a generic icon.
- [ ] **Hero Showcase Polish**: Right-side hero showcase rotates smoothly, has clickable template tabs, uses architectural portrait framing with zero overflow, and links directly to the studio via `CustomEvent`.
- [ ] **100% Male Portraits Only**: Verified across all presets, hero slides, and sample data.
- [ ] **"Free AI [Tool Name]" SEO**: Verified in Meta Title, H1, single-sentence Meta Description, Quick Answer, and FAQs.
- [ ] **Verified Imports**: All imports match `features/tool-ui/*` and `features/portable-tool-kit/PortableToolHeroBar` with zero TypeScript errors.

## 8. Copy-Paste Master Prompt for Any AI Agent or Developer

Copy and paste the prompt below into any AI coding agent (Gemini, Claude Code, Cursor, Windsurf, Copilot) whenever you want to upgrade another tool in `doitwithai.tools` to this exact industrial standard:

> **MASTER TASK PROMPT — UPGRADE DOITWITHAI TOOL TO PIXEL-PERFECT INDUSTRIAL STUDIO**
>
> You are upgrading the tool **`[TOOL_NAME]`** at route **`/tools/[TOOL_SLUG]`** (`app/tools/[TOOL_SLUG]/page.tsx` and `features/[TOOL_SLUG]/...`) in the `doitwithai.tools` Next.js App Router repository.
>
> Read `docs/TOOL_OPTIMIZATION_RULES.md` and reference `features/quote-stat-testimonial-card-studio/` (`model.ts`, `cardRenderer.ts`, `portraitCutout.ts`, `HeroAnimatedTestimonialShowcase.tsx`, `QuoteStatTestimonialCardStudioClient.tsx`) and `app/tools/quote-stat-testimonial-card-studio/page.tsx` as your gold-standard reference implementation.
>
> Execute the following 8 requirements with 100% precision:
>
> 1. **Competitor-Beating Domain-Specific Templates (10–14 Layouts)**:
>    - Do NOT copy-paste unrelated templates from other tools. Design 10–14 distinct, purpose-built templates specifically for **`[TOOL_NAME]`** that match or beat dedicated SaaS competitors in this niche.
>    - In the template selector gallery below the canvas, render **live miniature visual previews (`TemplateThumb`)** of each template using the user's active content, colors, photo, and logo (`useDeferredValue` + `<canvas>` at `0.35x` scale) with a clear layout badge on each card—never generic static icons.
>
> 2. **Pixel-Perfect Responsive Canvas & Zero-Overlap Geometry**:
>    - Enforce strict mathematical column/zone separation (`colGap >= 32px` on 1080p canvas) between text columns and visual/portrait zones so headings, body text, badges, and footers **never** overlap or collide with images at any text length or aspect ratio (`1:1 Square 1080×1080`, `4:5 Portrait 1080×1350`, `16:9 Landscape 1600×900`).
>    - Use bottom-up vertical space budgeting and dynamic font auto-scaling (`maxSize` down to `minSize`) so long text automatically scales to fit its bounding box without touching pills, charts, or footers.
>
> 3. **Architectural Portrait / Image Framing & Real-Time Sliders**:
>    - Never render raw, unclipped rectangular photos with mismatched gray/studio backgrounds on top of cards, arches, or concentric rings.
>    - Frame portraits/images inside architectural containers: **Circle-in-Ring (`ring-circle` — clipped inside the inner circle of concentric rings)**, **Rounded Arch (`arch`)**, **Adjustable-Radius Frame (`rounded` with `0%–50%` radius)**, **Sleek Architectural Portrait Window**, or **In-Browser Auto Cutout (`removeStudioBackdropInstant` + MediaPipe)**.
>    - Provide real-time sliders in Step 1 for: **Photo Zoom (`70%–145%`)**, **Ring / Frame Size (`75%–120%`)**, **Position Up / Down (`-25% to +25%`)**, **Position Left / Right (`-25% to +25%`)**, **Circle / Corner Radius (`0% Square to 50% Circle`)**, **Reset Fit**, and **Brand Logo Upload + Logo Scale (`70%–145%`) + Logo Badge Style (`Auto`, `Brand Pill`, `White Box`, `Dark Box`, `No Box`)**.
>    - **Strict Site-Wide Portrait Rule**: Any person portrait or preset used in the tool, hero showcase, or promo cards must be **100% male executive portraits only**.
>
> 4. **Unified 2-Column Studio Dashboard Experience**:
>    - Place all step-by-step customization controls in a single sticky, scrollable left column (`lg:col-span-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto`).
>    - Place the multi-card/item tabs, HD export toolbar (`PNG`, `All .ZIP`, `Copy`, `SVG`, `PDF`, `Caption`), zoomable live canvas stage, and live template preview gallery in the right column (`lg:col-span-7`).
>    - Switching templates, aspect ratios, or color themes must **never** wipe or reset the user's edited text.
>
> 5. **Hero Section & Interactive Right-Side Showcase**:
>    - Left Hero Column: Trust badge (`Free AI ... · No Signup · Zero Watermark ★ 4.9/5`), H1 featuring **`Free AI [Tool Name]`**, concise value proposition, and `PortableToolHeroBar` where **`"Use Tool Now: [Action]"`** is the primary dominant button and `"Use in Do It AI"`, `"Customize & Embed"`, and `"Download PC App (.ZIP)"` are secondary buttons.
>    - Right Hero Column: Build a dedicated, auto-cycling 5-slide interactive visual showcase (`h-[365px] sm:h-[380px]`) with clickable template tabs, pause-on-hover, architectural portrait/visual framing (zero overflow or text collision), and a `"Customize this layout in Studio ↓"` button that dispatches a `CustomEvent` to load that exact template in the workspace below.
>
> 6. **Below-the-Fold SEO, AEO & Internal Linking Sections**:
>    - Optimize for **`[PRIMARY_KEYWORDS]`** (always including `"Free AI [Tool Name]"`).
>    - Write a **single-sentence Meta Description** (`145–160` chars).
>    - Include JSON-LD `@graph` (`WebApplication`, `HowTo`, `BreadcrumbList`, `FAQPage` with 8–10 Q&As).
>    - Include: (a) **50-Word Quick Answer Box**, (b) **3-Step Visual Workflow**, (c) **Full Template/Capability Breakdown Grid**, (d) **6 Industry Use Cases**, (e) **3 Differentiator Cards + Competitor Comparison Table**, (f) **Natural "Do It With AI" (`/do-it-ai?tool=[TOOL_SLUG]`) Workflow Integration Banner**, and (g) **3 Visually Distinct Internal-Linking Promo Card Grids** (1. Dark Terminal Prompt Pack Cards -> `/prompts/*`, 2. Clean Magazine Editorial Blog Cards -> `/guides`, `/ai-seo`, `/ai-tools`, 3. Emerald Curriculum Course Cards -> `/ai-learn-earn`, `/ai-code`, `/what-our-ai-tool-can-do`).
>
> 7. **Verified Imports & Clean TypeScript Build**:
>    - Use exact verified module paths (`@/features/portable-tool-kit/PortableToolHeroBar`, `@/features/tool-ui/ToolHero`, `@/features/tool-ui/visualCardExport`, `@/features/tool-ui/UrlArticleExtractorBar`, `@/features/tool-ui/ToolRunOverlay`, `@/features/tool-ui/PlatformBrandIcon`) and verify zero TypeScript or Next.js build errors.
