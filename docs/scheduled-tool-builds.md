# Scheduled tool creation

Authorized by Sufian on October 27, 2026. Repository: `sufi0900/doitwithai.tools`. Branch: `feat/homepage-tools-learning`.

The requested start is three hours after scheduling. The scheduler checks hourly and processes one queued tool at a time.

Queue order is stored in `docs/tool-build-queue.json`. Read the current branch copy on every run, because local workspaces may be temporary.

## Sequencing

1. Finish the three remaining off-page tools first.
2. Build the first five conversion tools in their agreed order.
3. Build Markdown, EPUB, newsletter, LinkedIn carousel, MP3 download, and podcast-script capabilities.
4. Resume unfinished work before selecting another item. Do not create overlapping builds.
5. Stop and disable the automation when every requested item is verified complete.

An hourly start is not a promise that every tool takes one hour. Long-running work or failed checks can delay the next item.

## Per-tool quality requirements

- Independently research user problems, competing workflows, keywords, relevant primary documentation, and useful differentiation.
- Do not invent search volumes, traffic forecasts, quality scores, claims, or test results.
- Read repository instructions, existing implementations, research notes, and queue state before editing.
- Keep the initial form simple. Advanced settings remain optional and collapsed.
- Required fields need inline errors, useful examples, accessible labels, and focus navigation.
- Show a visible loading dialog with a blurred backdrop. Move focus and scroll position to results on completion.
- Handle inaccessible pages, failed extraction, malformed inputs, provider limits, interruptions, and partial results honestly.
- Include accurate metadata, canonical URLs, useful headings, explanatory content, examples, limitations, relevant FAQs, and natural internal links.
- Add a live catalog entry only after the actual tool works. Keep incomplete or blocked tools out of the live tool inventory.
- Verify the main flow on desktop and mobile, including dark mode, downloads, errors, keyboard behavior, and responsive overflow.
- Run meaningful feature tests, required foundation checks, type checking, lint, and the production build.
- Validate exported assets in their actual format. Open or parse files, render documents where appropriate, and test audio playback.
- Push completed, validated work to the named branch. Do not merge or promote production.
- Report the commit, implemented behavior, checks, limitations, and blockers to Sufian in this task conversation.

## Download requirements

PDF and DOCX tools must produce actual valid PDF and DOCX files. Markdown needs an `.md` download, and EPUB needs a valid EPUB package.

Scripts need downloadable text and editable document output. Social posts need text or structured exports. Newsletter drafts need text and HTML downloads.

Carousel conversion needs an actual designed PDF and slide-image exports. A list of slide ideas alone does not complete that requested converter.

Read-aloud and MP3 work must support actual downloadable audio when completed. Browser speech playback alone does not satisfy the requested audio-download capability.

Use an audio generation or encoding method that is available and authorized. Never rename text files as audio or advertise missing downloads.

Read-aloud and MP3 can share an engine. Research whether separate pages serve distinct intents; avoid redundant thin pages for the same function.

The podcast item requests a script. Actual podcast audio and fully rendered video are outside the current queue unless separately authorized.

## Durable progress and concurrency

Claim a queue item with an expected-head GitHub update before starting implementation. Record a unique run identifier and an expiring lease.

Refresh the checkpoint and lease during sustained work. Before pushing, verify that the current run still owns the lease.

If another run has a valid lease, do not start a parallel build. Resume failed or timed-out work after confirming its lease is stale.

Store status, implementation commit, validation evidence, and unresolved issues with the queue entry. Never advance solely because an hourly slot elapsed.

If a prerequisite needs new credentials, spending, unavailable execution capabilities, or human input, record the blocker and pause the automation.

Do not substitute a mock, placeholder, reminder, or feature plan for the implementation. Do not buy services or change paid plans without authorization.

## Schedule setup validation

The queue contains fourteen unique pending items: three off-page tools followed by eleven conversion items. The enabled automation starts October 27, 2026, at 03:57:47 in Asia/Karachi.

The expanded category passed production-browser checks for eleven planned formats, category navigation, canonical metadata, noindex, sitemap exclusion, and existing catalog behavior. No runtime errors or horizontal mobile overflow were observed.

All eleven foundation checks, type checking, lint, and the production build passed. Existing unrelated repository warnings remain. These checks validate scheduling setup and the category update; they do not mark any queued tool complete.
