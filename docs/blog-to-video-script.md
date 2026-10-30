# Blog to Video Script

Research and implementation date: October 27, 2026. Route: `/tools/blog-to-video-script`. Queue item six only.

## Research and intent

Creators need a recording draft with source context, a useful opening, spoken sequence, visual directions, and an editable handoff. Search intent families include blog to video script, article to YouTube script, blog post to script, and article to Shorts script. Broad blog-to-video searches can instead expect rendered media; the public page explicitly limits this tool to script output. No verified keyword-volume dataset was available. No volume, rankings, retention, traffic, or conversion claims are invented.

First-party sources retrieved October 27, 2026:

- [Pictory URL workflow](https://kb.pictory.ai/en/articles/10979583-how-to-turn-your-urls-into-video-with-pictory), published April 28, 2025: URL import, platform/duration choice, editable scripts, and later storyboard/video generation are separate workflow steps. This informed format choice and review, while our output remains a script. No competitor performance was measured.
- [Canva video-script guide](https://www.canva.com/docs/video-script/): audiovisual/two-column script planning separates spoken content from what appears on screen. This informed editable narration/visual/screen fields and native two-column DOCX scene tables.
- [Wistia script guidance](https://wistia.com/blog/wistias-scripting-tips): spoken drafts need a natural voice and read-through. This informed the explicit read-aloud/manual-edit step rather than a claim of finished recording copy.
- [MDN Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter): locale-sensitive sentence segmentation. Complete sentence selection avoids cutting a numeric claim or qualification mid-sentence; it does not establish factual completeness.
- [YouTube Shorts documentation](https://support.google.com/youtube/answer/15424877?hl=en): the three-minute format informed short-form target choices. Script target timing alone does not establish upload eligibility. No claims about other platforms' current maximum durations are made.

These sources establish workflows and technical behavior, not market size or superiority. Research links are repository-only, with no public competitor/source section.

## Decisions

Reuse the guarded article importer and reviewed text model. Extend the existing PDF/Word client with a dynamically loaded script editor. PDF/Word defaults stay intact. The script path never fetches images and tells users that image references, tables and code need manually verified spoken explanations.

This implementation is deterministic extractive drafting, explicitly labeled publicly. It selects complete sentences in article order, without AI rewriting, ranking importance, translation, or fact-checking. It does not require an unavailable provider or paid credential. Users can choose source sections and manually edit every scene. This offers a concrete source-grounded starting draft rather than fake generation or an unimplemented API.

YouTube long-form uses opening, up to eight source chapters, and closing; short-form choices use a hook, up to three source points, and takeaway. Hook options come from the title or a source sentence. Opening/closing framing and visual notes are distinguishable from source-linked narration. Custom CTA is optional. No source content is padded to fill a target; a complete first sentence can exceed it with an explicit warning.

Timing uses Unicode word counts and a visible 120/140/160 words-per-minute assumption. Per-scene seconds round up. Only spoken narration counts; production pauses and demonstrations do not. It is a rough planning aid, particularly for languages without spaces.

Coverage maps reviewed source section IDs to literal sentence matches in linked scenes. Edits are flagged for verification, and removed scenes update omissions. This is not semantic verification or a claim that all important context is retained. The source/setup snapshot warns when a script is stale; rebuilding replaces script edits.

TXT contains current edited narration, scene notes, timing assumptions, coverage, source links, and limitations. Native DOCX uses the verified OOXML engine with actual editable paragraphs, headings, audio/visual tables, and reference relationships. Source byline is labeled as source attribution rather than script authorship. No audio, captions, licensed media, rendered video, or publishing is provided.

UI includes native labels and keyboard controls, inline required title and source-selection errors, a blurred loading dialog, cancellation preserving the previous script, focus/scroll to results, responsive layouts and dark mode. Export failures and clipboard denial are surfaced. Files are local and temporary; no source/edit persistence or article-text AI request is introduced.

Shared URL safety, extraction/rate-limit/timeouts and partial-import notes are inherited, including paste fallbacks. Existing source limits apply. Scene edits are bounded and exports validate titles, narration, and output size. Public metadata, canonical URL, instructions, worked example, limitations, FAQs and named internal links accompany the working tool.

## Validation

Blocked before final validation on October 27, 2026. The resumed fresh clone contains the implementation and 11 meaningful feature tests, but none of their results are claimed as passing. The browser harness passed JavaScript syntax checking. Standard repository formatting, type checking, complete test suites, production build, browser flow, and actual file parsing/rendering remain unverified for the resumed source.

The online frozen installation was interrupted by the execution policy: network access to `https://registry.npmjs.org:443` was blocked. An offline frozen install reused 1,533 cached packages but failed with `ERR_PNPM_NO_OFFLINE_TARBALL`, naming `@emotion/react` 11.14.0 as missing. Do not bypass the network restriction. Resume in an execution environment permitted to install the frozen repository dependencies or supplied with a complete matching package cache.

The implementation is stored in the queue entry's recovery commit, not published as a live tool. No registry, category, search, sitemap or manifest entry was added. No implementation completion or successful DOCX download is claimed. The queue remains on Blog to Video Script; later items must wait. Restore recovery files onto a fresh current-branch checkout, check contributor changes, reclaim the lease, then run all required validation before publishing.

A curl header request reached the public source article during the resumed run, but this does not verify the native guarded importer or the application URL flow. Those checks remain pending.
