# Content conversion series

Research date: October 27, 2026. Owner: Sufian Mustafa, Do It With AI Tools.

Sufian authorized scheduled creation of the remaining off-page tools, followed by all eleven requested article-conversion capabilities. See `docs/tool-build-queue.json`.

This change creates the category foundation and research roadmap. It does not publish unfinished converter pages or advertise them as working tools.

## Category and audience

- Public name: Content Conversion.
- Category route: `/tools/categories/content-conversion`.
- Future discovery topic: `conversion`.
- Accent: coral orange, `#9A3412` for light-surface text and `#FDBA74` for dark surfaces. Decorative color: `#F97316`.
- Existing blue branding remains the site identity. The coral palette identifies this collection.
- Audience: creators repurposing owned articles, marketers, readers, students, researchers, and editors.

The core promise is an article URL, a reviewable source preview, and an output that serves a specific task.

## Evidence quality and search volume

No verified Google monthly search-volume dataset was available during this research.

The connected GSC Wizard refused the Bing keyword-stat request because its subscription was inactive. No further paid requests were made.

Public search results surfaced third-party keyword estimates with unclear geography, dates, or methods. They were excluded from the prioritization numbers.

There are no invented search volumes, keyword difficulty scores, traffic forecasts, or revenue estimates in this plan.

Priorities below reflect product usefulness, user-discussion evidence, brand fit, and implementation reuse. They are judgments rather than measured market sizes.

Search-result presence and competing products validate existing terminology and workflows. They do not independently prove exact demand or ease of ranking.

The discussion evidence includes older threads still describing relevant problems. The plan does not treat their retrieval date as their publication date.

## User problems observed

| Problem                                                                                             | Evidence                                                                                                                                               | Implication                                                                                           |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Readers want saved articles without rendering problems, plus highlights and long-document support.  | [Read-it-later requirements](https://www.reddit.com/r/ProductivityApps/comments/1o3nz42/what_are_the_best_readitlater_apps_in_2025/)                   | A clean, reviewable article export matters more than copying browser clutter.                         |
| Listeners dislike repeated copy-paste, crashes, missing automatic playback, and unreliable seeking. | [Article listening requests](https://www.reddit.com/r/rss/comments/1oj4jdu/any_recommendations_of_a_good_text_to_speech_app/)                          | Reliable pause, resume, paragraph navigation, and preserved position belong in an audio tool.         |
| Creators want lightweight scripting with hooks, flow, and tone controls.                            | [Short-form scripting request](https://www.reddit.com/r/content_marketing/comments/1mi5v8t/which_tool_can_i_use_for_script_writing_for/)               | Prioritize an editable spoken script and a clear scene structure over a complex production interface. |
| Bloggers ask to turn post URLs or feeds into platform-specific social content.                      | [Blog repurposing request](https://www.reddit.com/r/Blogging/comments/1gb5z8j/any_blog_repurpose_and_distribution_tool/)                               | Source import, channel-specific drafts, and easy copying are useful. Publishing is a separate scope.  |
| Users care about setup friction and whether repurposed copy sounds like them.                       | [Newsletter and social workflow discussion](https://www.reddit.com/r/Emailmarketing/comments/1k8tg7u/how_do_you_turn_one_newsletter_into_content_for/) | Keep required inputs minimal and allow source-voice preservation.                                     |
| Readers want long web articles on e-readers without writing RSS recipes.                            | [Web article to EPUB request](https://www.reddit.com/r/Calibre/comments/111ccw5/how_to_convert_webpage_articles_into_epub_without/)                    | A structured article-to-EPUB export is a credible later addition.                                     |
| Bookmarked article collections need separate EPUB outputs.                                          | [Multiple URLs to EPUB request](https://www.reddit.com/r/Calibre/comments/1gb3hrz/how_to_turn_dozens_website_links_into_their_own/)                    | Batch conversion is a later feature, after single-article extraction is reliable.                     |

Use the original questions as problem evidence. Many replies contain vendor promotion, so they are not independent endorsements.

Quora search was attempted, but the service blocked access. No Quora discussion is claimed as reviewed evidence.

## Existing product baselines

| Baseline                                                                                             | Observed capability                                                                   | Our implication                                                                                                       |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [PrintFriendly](https://www.printfriendly.com/extensions/firefox)                                    | Reader-oriented PDF export, clutter removal, editing, and page-format controls.       | Basic browser printing is insufficient differentiation. Source preview and clean formatting are minimum expectations. |
| [Pictory](https://pictory.ai/link-to-video)                                                          | URL content import, scripts, visuals, captions, narration, and actual rendered video. | Keep a video-script tool clearly labeled. It cannot claim full video conversion without video output.                 |
| [Buffer blog-to-social generator](https://buffer.com/free-tools/blog-to-social-media-post-generator) | Blog URL input, channel selection, multiple draft angles, and a paste fallback.       | A generic summary is insufficient. Adapt to channel limits and preserve the original argument.                        |
| [Inoreader text-to-speech](https://www.inoreader.com/features/text-to-speech)                        | Listening, position controls, and speed changes for articles.                         | Long-form playback reliability is central to the read-aloud experience.                                               |

The Word/DOCX concept has weaker independent user-request evidence in this research. It remains useful because Sufian requested it and it reuses document extraction.

Markdown, newsletter, and carousel converters are plausible extensions. They require their own deeper competitor and keyword checks before implementation.

## Recommended first build sequence

### 1. Article to PDF

Keyword family: article to PDF, webpage to PDF, URL to PDF, save article as PDF, clean article PDF.

Intent: a downloadable reading copy. Some broad searches instead want a pixel-perfect page capture, which is a separate output mode.

User benefit: archive, share, print, and annotate readable content without navigation or advertisements.

Required features:

- Article URL with pasted text or HTML fallback.
- Editable extraction preview before export.
- Preserve headings, paragraphs, lists, links, tables, and selected article images where supported.
- Show title, source link, and verified byline/date fields without inventing metadata.
- Image inclusion control, readable typography, A4/Letter choice, margins, and sensible page breaks.
- Download an actual PDF. Label browser print separately if offered.
- Explicit warnings for omitted sections, blocked images, or incomplete extraction.
- Unicode fonts and export checks for English and Pakistani Urdu content when testing multilingual inputs.

Differentiation: readable article layout, source provenance, and manual cleanup. Avoid promising exact capture of every website.

Build rationale: concrete utility and the shared extraction foundation. Competition is substantial; this is not presented as an easy-ranking keyword.

### 2. Article to Word

Keyword family: webpage to Word, URL to Word, article to Word, webpage to DOCX.

Intent: editable document output, rather than another PDF converter.

Required features: real DOCX download, heading styles, editable lists and tables, source links, selected images, Unicode text, and clean filenames.

Do not create a renamed HTML file and call it DOCX. Validate the exported document in an actual document reader.

Build rationale: reuse the PDF tool's source model and image handling. The second position reflects implementation reuse, not stronger measured demand.

### 3. Blog to video script

Keyword family: blog to video script, article to YouTube script, blog post to video script, article to Shorts script.

Intent: a writing output for later video production. Broad blog-to-video queries often expect an actual video file and should not be treated as identical intent.

Required features:

- Reviewed article import, intended platform, and optional duration.
- Hook options, spoken narration, scene beats, visual suggestions, on-screen text, and an appropriate CTA.
- Long-form and short-form modes with distinct structure.
- Preserve claims, names, statistics, and source references. Do not invent examples or studies.
- A source-based content checklist showing important points retained or omitted.
- Editable script and copy/TXT/DOCX output.
- Label duration as an estimate based on a visible speaking-rate assumption.

Differentiation: source-grounded scripts with useful production notes, rather than generic scripts loosely related to the title.

### 4. Article read aloud

Keyword family: read article aloud, article reader, website text to speech, listen to articles.

Intent: listening playback. Offline downloadable audio is a related but different requirement.

Required features: article cleanup, voice and speed controls, pause/resume/stop, paragraph navigation, current-text highlighting where supported, and reliable long-text segmentation.

Browser synthesis voices vary by device. Test unavailable voices, voice loading, interruptions, mobile behavior, and playback after tab changes.

[MDN SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) documents device voices and playback control. It is not an MP3 encoder interface.

The scheduled scope now requires real downloadable audio. Browser playback alone does not complete this item; an available audio-generation or encoding pipeline is required.

### 5. Blog to social posts

Keyword family: blog to social media posts, article to LinkedIn post, blog to X thread, content repurposing tool.

Required features: source URL import, channel-specific structure, several useful angles, source-voice preservation, optional CTA/link, editable drafts, and copy/download.

Keep scheduling and publishing separate unless explicitly implemented and authorized. Existing Buffer integration is not part of this converter's initial scope.

Differentiation: faithful source points, meaningful variations, and destination-aware CTAs. Avoid duplicating generic prompt output across thin platform pages.

## Additional scheduled converters

| Priority group | Candidate                 | Benefit                                                                          | Requirement before building                                                                              |
| -------------- | ------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Next           | Article to Markdown       | Reuse article content in notes, documentation, CMSs, and AI workflows.           | Preserve headings, lists, links, code, tables, and image references. Validate developer-specific demand. |
| Next           | Blog to newsletter        | Produce an email draft with subject options, preview text, body, and source CTA. | Confirm a distinct workflow beyond generic social repurposing.                                           |
| Next           | Blog to LinkedIn carousel | Turn an article into slide-by-slide educational content.                         | Create an actual designed PDF and downloadable slide PNGs.                                               |
| Next           | Article to EPUB           | Read articles on e-readers with reflowable text and a navigation structure.      | Validate EPUB packaging and test in e-reader software.                                                   |
| Later          | Article to MP3            | Download narration for offline listening.                                        | Select an audio service or encoder, test byte output, costs, quotas, voices, and retention.              |
| Later          | Article to podcast script | Produce a solo or two-speaker adaptation from article evidence.                  | Keep the script distinct from generated audio and preserve source claims.                                |
| Later          | Blog to rendered video    | Deliver an actual playable video file.                                           | Requires rendering infrastructure, asset handling, audio, captions, progress, and controlled costs.      |

[ElevenLabs API documentation](https://elevenlabs.io/docs/overview/intro) demonstrates a separate text-to-audio service producing MP3 output. No provider has been selected or purchased.

Generic summarizers, FAQ generators, and duplicate platform-specific pages are not immediate priorities. Existing writing tools already cover several adjacent tasks.

## Shared conversion foundation

Build article extraction once, then use a shared source model across converters:

1. Accept one article URL, with a clearly labeled paste fallback.
2. Fetch safely using public-network checks, bounded redirects, timeouts, response limits, and relevant access handling.
3. Identify main article content, using a tested reader-mode extractor where suitable.
4. Preserve document structure and source provenance.
5. Show the imported source for review and correction.
6. Create the chosen output only from reviewed content.

The current on-page analyzer already extracts bounded text evidence. It should not be assumed to preserve all formatting needed by PDF or DOCX exports.

[Mozilla Readability](https://github.com/mozilla/readability) is a candidate extraction component. Its documentation also notes that extracted HTML needs sanitization before use.

Never execute fetched scripts. Image downloading, HTML preview, and embedded links need their own handling rather than bypassing the existing public-network guards.

Loading dialogs, field-level errors, clear output labels, and automatic result navigation remain required across the series.

Advanced options stay collapsed. The initial experience should ask for the article and only the settings needed for that output.

## Search validation before launch

When keyword-volume data is available, record its source, collection date, geography, language, match type, monthly range, and reporting period.

Otherwise, document keyword intent and evidence from current research. Missing paid keyword data does not block implementation and must never become invented metrics.

Start with English queries in the United States. Check the United Kingdom, Canada, and Australia separately where data is available.

Do not sum close variants as unique users. Separate source-preserving conversion, AI rewriting, and full media generation when grouping keywords.

Use relevant user questions to define usability tests. Measure successful extraction, completed exports, repeat use, and whether output files open correctly.

Rankings, traffic, and conversion rates need observation after launch. Product completeness does not guarantee indexing or search visibility.

## Current implementation status

- The new category and coral visual identity are added to category navigation and the collection page.
- Planned formats are read-only descriptions. They do not link to nonexistent tool pages.
- The topic metadata is ready for the first live converter. Empty discovery topics remain hidden until tools exist.
- The empty category keeps noindex and stays outside live-tool sitemaps until its first real tool ships.
- The updated status record and build queue authorize scheduled off-page work before the conversion series.
- No conversion engine, TTS service, video renderer, or individual converter is included in this foundation change.

## Foundation validation

- All 489 feature checks and 11 foundation checks passed.
- The existing contrast check now also covers the planned conversion palette in light and dark navigation states.
- Type checking and the production build passed, including build-time lint. Existing unrelated repository warnings remain.
- Production-browser checks passed for category navigation, planned-format labels, the empty ItemList, canonical metadata, noindex, and sitemap exclusion.
- The existing live catalog still filters correctly. The planned collection does not expose fake converter links or conversion forms.
- Desktop and mobile light/dark layouts were reviewed. The tested flow had no runtime errors or horizontal mobile overflow.
- Browser script: `scripts/content-conversion-smoke.cjs`.

## Scheduled scope update

Sufian explicitly added all six later candidates to the build queue: Markdown, EPUB, newsletter, LinkedIn carousel, MP3, and podcast script.

All converters require useful downloads. The active queue contains three off-page tools and eleven conversion items, for fourteen requested items overall.

Full rendered video remains outside this queue. Read-aloud and MP3 should share an engine where appropriate, with distinct outputs and no redundant thin pages.

## Article to PDF implementation, October 27, 2026

The first converter now supports public URL import, local pasted text/HTML, editable source review, and genuine A4/Letter PDF downloads with headings, tables, clickable references, and selected PNG/JPEG images. The collection and tool registry expose only this completed converter. Other formats remain queued. Research, implementation decisions, verification evidence, and live-fetch limitations are recorded in `docs/article-to-pdf.md`.
