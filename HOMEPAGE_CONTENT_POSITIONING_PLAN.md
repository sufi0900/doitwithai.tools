# Homepage content positioning plan

Status: homepage content implemented. Design and animation code preserved.
Prepared: 10 October 2026.
Working branch: feat/homepage-tools-learning.
Before implementation, confirm the latest remote commit and preserve newer user edits.

## Positioning

Audience: marketers doing SEO and content work, including agency teams and founders handling their own marketing.
Promise: practical help planning, refining, and preparing website content with AI and human judgment.
Digital marketing remains an expansion boundary, rather than a claim to cover every marketing discipline.
Do not describe connected projects, saved briefs, factual verification, or exports unless those capabilities exist.

## Preservation rules

Keep section order, DOM structure, CSS classes, widths, spacing, typography, colors, images, and responsive breakpoints.
Keep the featured article layout, resource carousel, contact form, founder portrait, and character physics.
Keep navigation, canonical routes, filtering, links, animations, timing, and accessibility controls.
Compare rendered line wrapping, rather than forcing identical character counts.
If copy overflows, shorten the copy before considering any layout change.

## Hero copy

Brand: Do It With AI Tools.
Headline: Put AI to work on your SEO and content.
Description: Plan and refine your website content with practical AI tools, clear guides, and free resources built for everyday marketing work.
Five existing badges: SEO / Content / Marketers / Agencies / Founders.
These badges describe work and users without claiming five separate product markets.
Cards heading: Three ways to improve your content workflow.

Card 1 title: Find the right tool for the task.
Card 1 body: Compare title ideas, build article outlines, and refine your content with editable results you can review before publishing.
Card 1 action: Explore tools.

Card 2 title: Learn the reasoning behind the work.
Card 2 body: Follow practical SEO and content guides with examples that help you make informed choices and apply AI with human judgment.
Card 2 action: Read SEO guides.

Card 3 title: Start with a useful resource.
Card 3 body: Find free prompts and learning resources, then adapt them to your audience, page purpose, and content task.
Card 3 action: Explore resources.

Hero closing heading: Ready to put AI to work on your content?
Hero closing body: Start with a practical guide, choose a relevant tool, and review the results for your audience before putting them to use.
Supporting chips: Practical SEO tools / Clear content guides / Free AI resources / Human judgment.
Primary action: Explore SEO tools.
Secondary action: Read SEO guides.
Trust line: Tools for the task. Guidance for the decisions. Resources to get started.
Audience line: For marketers, agency teams, and founders handling their own SEO and content.
Synchronize visible action text and accessible names.

## Sections below the hero

Tools eyebrow: Practical tools for everyday marketing.
Tools heading: Choose a tool for your SEO and content work.
Tools description: Plan articles, compare metadata, and refine your content with tools that help you review your options before publishing.
Keep tool names and accurate registry descriptions. Do not rewrite the global catalog merely to change homepage positioning.
Search example: Try titles, outlines, or readability.

Learning eyebrow: Learn the process behind the output.
Learning heading: Make better decisions about your SEO and content.
Learning description: Read practical guides with examples, prompts, and review steps you can apply to your own website or client work.
Keep published article titles, excerpts, destinations, and featured selection sourced from Sanity.

Resources eyebrow: Useful starting points.
Resources heading: Free resources for your next content task.
Resources description: Explore free prompts and learning resources, then choose what fits your audience and the work you need to complete.
Keep the existing resource data and carousel. Do not claim every resource is specifically for SEO.

Journey eyebrow: From understanding to action.
Journey heading: Learn it. Prepare it. Do it with AI.
Journey description: Understand the task, gather useful starting points, and use our tools to develop results you can review and refine.
Project node: Your next content task.
Step 1 title: Understand the content task.
Step 1 description: Follow a guide to understand your page purpose, reader needs, and the choices behind a useful result.
Step 1 detail: Know what your page needs to achieve.
Step 1 note: Review the examples, identify your audience, and decide what belongs in your content.
Step 2 title: Gather your starting points.
Step 2 description: Choose a relevant prompt or resource, then adapt it to your topic, audience, and page purpose.
Step 2 detail: Give your content a clear starting point.
Step 2 note: Bring your own context and supporting information rather than relying on a generic prompt.
Step 3 title: Put your plan into practice.
Step 3 description: Use a relevant tool, compare the output, and refine it before adding it to your website or client work.
Step 3 detail: Develop a draft you can review.
Step 3 note: Check meaning, factual claims, and page context before using the result.
Audit remaining labels and simulation captions for alignment. Preserve realistic demo labels and mark simulated output as illustrative.
Do not imply that guides, resources, and tools currently share an automatic project state.

Founder eyebrow: Human judgment, AI assistance.
Founder heading: Built by someone who puts AI to work.
Founder body: I’m Sufian Mustafa, founder of Do It With AI Tools, a developer and marketer working with SEO and content.
Founder supporting body: I build practical tools and share guidance that combines AI assistance with careful review and clear explanations.
Keep portrait and profile link.

Closing heading: Put your next content task into motion.
Closing description: Choose an SEO tool, follow a useful guide, or find a free resource to support the work ahead.
Keep the three current action destinations.

Contact eyebrow: Help shape what we build next.
Contact heading: What would make your marketing work easier?
Contact description: Share a tool idea, tell us where your content workflow gets difficult, or get in touch about a collaboration.
Keep fields, validation, submission, and consent wording unchanged.

## Search and social metadata

Meta title: Put AI to Work on Your SEO and Content | Do It With AI Tools
Meta description: Plan and refine website content with AI tools, practical SEO guides, and free resources for marketers, agency teams, and founders.
Open Graph and Twitter title: Put AI to Work on Your SEO and Content.
Open Graph and Twitter description: use the meta description.
Social image headline: Put AI to work on your SEO and content.
Social image alt: Do It With AI Tools: practical AI tools and guides for SEO and content.
Keep the homepage canonical, social accounts, author identity, logo, image dimensions, and metadata type.
Preview title width. Character counts do not guarantee search display or prevent truncation.
Do not add a meta keywords field or unsupported keyword variants.

## Structured data

Keep the existing Organization, Person, WebSite, WebPage, and ItemList graph and stable identifiers.
Update Organization and WebPage descriptions to match the new positioning.
Update WebPage name from the shared title.
Add WebSite description from the same shared content source if useful.
Rename featured list labels to Practical SEO and content tools and SEO and content guides.
Keep list membership and URLs accurate to visible items.
Do not add ratings, invented testimonials, guaranteed outcomes, or unsupported software capabilities.
Do not add FAQ markup without a visible FAQ section.

## File map

| File | Planned work |
| --- | --- |
| features/homepage/content.ts | Centralize approved hero copy, metadata, audience labels, and reusable action text |
| components/Hero/index.tsx | Replace broad hardcoded labels, closing text, badges, and accessible action names |
| features/homepage/HomeToolFinder.tsx | Update section introduction and relevant accessible labels |
| features/homepage/HomeSections.tsx | Update learning, founder, and closing copy |
| features/homepage/HomeResources.tsx | Update resource introduction only |
| features/homepage/HomeJourney.tsx | Update journey heading, step descriptions, detail text, and project label |
| features/homepage/JourneySimulation.tsx | Inspect and update any broad simulation captions; keep mechanics and character untouched |
| components/Contact/index.tsx | Update homepage-only introduction; preserve text on other pages |
| app/page.jsx | Align title, description, Open Graph, Twitter, social image query, and alt text |
| features/homepage/schema.ts | Align descriptive fields and list names with visible content |
| app/api/og/route.js | Inspect homepage variant; edit only if broad fallback copy is hardcoded |
| scripts/homepage-smoke.cjs | Adjust obsolete copy assertions only if necessary |

app/HomePageCode.jsx needs no structural edit.
features/homepage/data.ts needs no query change unless inspection exposes a positioning-specific issue.
app/layout.jsx should be inspected for conflicting inherited metadata. Avoid changing site-wide wording unnecessarily.
features/site-assistant/config.ts should be inspected for conflicting mission facts; any shared mission edit needs separate scope review.
No new UI components or styles are needed.

## Implementation and verification sequence

1. Confirm the latest branch and commit. Preserve unrelated changes.
2. Finish text inventory, including simulation, metadata inheritance, and social image fallback.
3. Update shared copy first, then component-local text.
4. Align metadata and structured data with the visible content.
5. Check sentences, claims, action destinations, and exact-match keyword stuffing.
6. Run TypeScript and the relevant existing homepage checks. Run the production build.
7. Compare before and after at 360px, 390px, 768px, and desktop widths in both themes.
8. Check headline wraps, card height, badges, carousel, journey, contact, and keyboard access.
9. Inspect rendered metadata and JSON-LD for consistency and valid URLs.
10. Review the diff for unintended layout, animation, routing, or shared-content changes.

The user authorized implementation and submission to the existing GitHub branch. Production promotion remains outside this change.
