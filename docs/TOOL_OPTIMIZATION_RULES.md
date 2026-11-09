# DoItWithAI.tools — Master Tool UI, Responsive Canvas & SEO Optimization Standards

Every tool upgrade across `doitwithai.tools` must strictly follow these engineering, visual responsiveness, and SEO rules:

## 1. Visual & Portrait Rules
- **100% Male Executive Portraits Only**: Never include female avatars, illustrations, or stock photos in any tool hero showcase, preset selector, or promotional card.
- **Architectural Portrait Framing (Zero Raw Rectangular Boxes)**:
  - Never place an unclipped rectangular photo over a contrasting card surface, decorative arch, or concentric ring pattern.
  - **Ring Layouts (`ring-circle`)**: Customer portraits must be clipped **inside the inner circle** of the concentric rings with a cohesive studio backdrop gradient and glowing accent ring border.
  - **Arch Layouts (`arch`)**: Customer portraits must be clipped **inside the rounded-top arch container** (`rounded-t-full`) so no square corners ever protrude outside the arch.
  - **Full-Bleed Split Layouts (`bleed`)**: Dedicate a strict right-hand panel (`42%` width) with a multi-stop horizontal gradient seam blending into the card surface, while keeping all text and attribution strictly bounded inside the left `54%` column.
  - **Rounded / Editorial Frames (`rounded`)**: Clip portraits inside a bordered frame with an adjustable corner radius (`0%` square to `50%` full circle).
- **Real-Time Photo & Logo Customization Controls**:
  - Every visual studio with portraits must provide real-time sliders for:
    1. **Photo Zoom / Size (`portraitScale`)** (`70%` to `145%`)
    2. **Position Up / Down (`portraitOffsetY`)** (`-25%` to `+25%`)
    3. **Position Left / Right (`portraitOffsetX`)** (`-25%` to `+25%`)
    4. **Circle / Corner Radius (`portraitRadius`)** (`0%` Square to `50%` Full Circle)
    5. **Ring / Frame Size (`portraitRingScale`)** (`75%` to `120%`)
    6. **Logo Size (`logoScale`)** & **Logo Container Style (`logoBgStyle`)** (`Auto`, `Brand Pill`, `White Box`, `Dark Box`, `Plain`)

## 2. Responsive Layout & Zero-Overlap Geometry
- **Strict Column Separation**: Text columns and portrait zones must maintain a mathematical gutter (`>= 32px` on 1080p canvas) so quote text, star badges, author attribution, and proof pills never collide with the portrait at any quote length (`10–240` characters) or aspect ratio (`1:1`, `4:5`, `16:9`).
- **Live Visual Template Thumbnails**: Template pickers must render real miniature previews (`TemplateThumb`) of each template's actual layout (showing rings, arches, splits, waveforms, and before/after boxes) rather than generic static icons.
- **Unified Left Control Dashboard**: Keep all customization steps in a single sticky, scrollable left column (`lg:col-span-5`) and the live HD canvas + template gallery in the right column (`lg:col-span-7`).

## 3. Hero Bar & Right-Side Animated Showcase
- **Primary Dominant CTA**: `"Use Tool Now"` must always be the first, dominant high-contrast button in `PortableToolHeroBar`, with `"Use in Do It AI"`, `"Customize & Embed"`, and `"Download PC App (.ZIP)"` styled as secondary buttons.
- **Right-Side Interactive Hero Showcase**: Every flagship tool hero must include an auto-cycling, interactive visual showcase on the right side with clickable template tabs and a direct `"Customize this layout in Studio ↓"` action.

## 4. SEO, AEO & Internal Linking Architecture
- **High-Intent "Free AI ..." Keyword Targeting**: Include `"Free AI [Tool Name]"` naturally in the Meta Title, H1 heading, single-sentence Meta Description, 50-word Quick Answer box, 3-Step Workflow, and FAQ schema.
- **Single-Sentence Meta Description**: Keep every page's `description` metadata to one natural, high-CTR sentence (`145–160` characters).
- **Natural "Do It With AI" (`/do-it-ai`) Integration**: Include a dedicated workflow section showing how users can chain the tool inside `/do-it-ai`.
- **Three Visually Distinct Internal-Linking Promo Card Grids**:
  1. **Prompt Pack Cards**: Dark terminal-snippet cards linking to `/prompts/*`.
  2. **Editorial Blog Cards**: Clean magazine article cards linking to `/guides`, `/ai-seo`, and `/ai-tools`.
  3. **Free AI Course Cards**: Emerald curriculum module cards linking to `/ai-learn-earn`, `/ai-code`, and `/what-our-ai-tool-can-do`.
