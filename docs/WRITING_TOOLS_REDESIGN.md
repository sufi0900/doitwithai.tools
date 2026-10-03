# Writing tool design and workflow update

The first writing tools used a basic form and three generic result cards. This redesign follows the existing title and slug generators' visual language and adds a fuller editing workflow.

## Visual system

- Dark slate hero, blue/cyan gradients, subtle dotted background, and the existing `#5271FF` brand accents.
- Large editorial headings, numbered workflow steps, rounded panels, and a contextual brief sidebar.
- Both tool pages use the same layout vocabulary as the existing generators without changing their functionality.
- Larger directory actions use the brand blue with bold 19px labels. Guide links sit below the primary action in a quieter footer.
- Directory, category, and homepage featured cards share one reusable component with tool-specific icons.

## Different tools, different workspaces

| Detail | Meta Description Generator | H1 Heading Generator |
| --- | --- | --- |
| Generated options | Six, two per direction | Six, two per direction |
| Directions | Clear summary, reader benefit, next step | Topic first, task first, audience first |
| Live preview | Illustrative snippet with mobile/desktop layouts | Main heading and optional user-supplied H2 sections |
| Title comparison | Literal overlap and useful detail beyond the title | Literal overlap with shared wording explicitly allowed |
| Final output | Plain text or escaped meta tag | Plain text or escaped H1 element |

The brief now supports page type, intent, audience, useful detail, title tag, existing wording, brand, and tone. Only the page context is required. Example and reset controls help users start quickly.

## Editing behavior

Selecting a candidate opens the lab and focuses its editor. Each candidate retains its local edits when users switch options. The original reasoning is labeled after edits. Restore original, before-and-after comparison, copy text, copy HTML, and download controls are available.

Regeneration failures preserve the current options and local edits. Successful generation replaces the set with a new one. Changes to the brief do not silently change the context of existing results.

Checks cover character/word counts, literal keyword presence, repeated phrases, title overlap, and a small strong-claim word list. The claim check does not verify facts. None of the checks predicts rankings, traffic, clicks, or AI citations.

The snippet preview deliberately labels its two-/three-line layout as illustrative. The H2 preview uses local user input and does not invent article sections. HTML export escapes quotes, angle brackets, and ampersands.

## API compatibility and bounds

New input fields have defaults. Existing request bodies remain valid. Responses now require six distinct candidates, two per supported direction. Update client and server together. The configured provider must support Responses structured output.

The output allowance increased from 1800 to 2500 tokens for the six-option response. Request bounds, timeout, zero retries, explicit model configuration, and Redis safeguards remain in place. No real provider calls or billing were exercised.

## Scope

This phase changes tool design, writing workflow, and card hierarchy. It does not edit Sanity documents or deploy schemas. The provided SEO Studio URL is the entry point for the next editorial pass:

https://www.sanity.io/@oCvkgv1G6/studio/pp3nlkkdfr4ogyqntfc2vihj/default/studio/structure/seo

The earlier correction drafts are outside this phase. A complete article audit is still separate work.

## Validation

35 AI-tool tests and 10 foundation tests passed. Type checking and the production build passed. Desktop/mobile browser checks passed for all six candidates, selection focus, preserved local edits, before-and-after comparison, both previews, and regeneration failures. Light/dark screenshots were reviewed. Dark editor contrast, mobile overflow, primary card hierarchy, and fixed-header scroll positions passed their checks. Canonicals, redirects, empty index policy, 404s, and sitemap discovery also passed. Provider calls were mocked. No live AI model output was evaluated.
