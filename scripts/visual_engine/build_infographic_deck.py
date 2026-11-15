#!/usr/bin/env python3
"""
DoItWithAI.tools · Programmatic AI Visual & Carousel Deck Generator
===================================================================
Generates pixel-exact 1080x1350 (4:5 portrait) multi-page PDF carousels and
per-section PNG infographics using HTML5/CSS3/SVG + headless Chromium.

Usage:
  python3 scripts/visual_engine/build_infographic_deck.py \
    --output-pdf doitwithai_linkedin_carousel.pdf \
    --output-dir ./slides_out
"""

from __future__ import annotations
import argparse
import html
import json
import os
from pathlib import Path
from typing import Any, Dict, List


DEFAULT_BRAND_TOKENS = {
    "site_name": "DoItWithAI.tools",
    "site_Tagline": "AI Tools · SEO Playbooks · Free Utilities",
    "bg_primary": "#121723",
    "bg_surface": "#1D2430",
    "bg_elevated": "#252E3E",
    "brand_primary": "#4A6CF7",
    "brand_gold": "#FBB040",
    "text_main": "#FFFFFF",
    "text_muted": "#94A3B8",
}


DEFAULT_SLIDES: List[Dict[str, Any]] = [
    {
        "kind": "hook",
        "eyebrow": "2026 AI SEARCH PLAYBOOK",
        "counter": "01 / 06",
        "headline_parts": [
            {"text": "Why Your Content Ranks on Google—But Gets "},
            {"text": "Ignored", "color": "gold"},
            {"text": " by "},
            {"text": "AI Search.", "color": "primary"},
        ],
        "subheadline": "5 structural shifts to turn traditional SEO pages into cited answers across ChatGPT, Perplexity, and Google AI Overviews.",
        "cards": [
            {
                "badge": "AEO",
                "title": "Answer Engine Optimization",
                "detail": "Front-load a 50-word direct answer under every H2 question so answer engines extract your definition verbatim.",
            },
            {
                "badge": "GEO",
                "title": "Generative Engine Optimization",
                "detail": "Back every claim with verifiable entities, structured tables, and original benchmarks that LLMs trust.",
            },
        ],
        "callout_badge": "FREE PLAYBOOK",
        "callout_text": "Swipe through all 5 structural shifts → doitwithai.tools",
    },
    {
        "kind": "step",
        "eyebrow": "SHIFT 01 · DIRECT ANSWER BLOCKS",
        "counter": "02 / 06",
        "headline_parts": [
            {"text": "Lead Every H2 With a "},
            {"text": "45–55 Word", "color": "primary"},
            {"text": " Direct Answer."},
        ],
        "subheadline": "AI retrieval pipelines score passages by how directly the first paragraph resolves the heading's question.",
        "cards": [
            {
                "badge": "BEFORE",
                "title": "300-Word Narrative Intro",
                "detail": "Burying the core definition under generic throat-clearing causes AI crawlers to skip your page.",
            },
            {
                "badge": "AFTER",
                "title": "Encyclopedic Answer First",
                "detail": "State the definition, mechanism, and outcome in the first 50 words—then expand with examples below.",
            },
        ],
        "callout_badge": "FREE TOOL",
        "callout_text": "Test your headings with the On-Page AI SEO Analyzer at doitwithai.tools",
    },
]


def render_headline_html(parts: List[Dict[str, str]], tokens: Dict[str, str]) -> str:
    out: List[str] = []
    for p in parts:
        txt = html.escape(p.get("text", ""))
        col = p.get("color")
        if col == "primary":
            out.append(f'<span style="color:{tokens["brand_primary"]}">{txt}</span>')
        elif col == "gold":
            out.append(f'<span style="color:{tokens["brand_gold"]}">{txt}</span>')
        else:
            out.append(txt)
    return "".join(out)


def build_deck_html(
    slides: List[Dict[str, Any]],
    tokens: Dict[str, str] = DEFAULT_BRAND_TOKENS,
    logo_data_uri: str = "",
) -> str:
    slide_blocks: List[str] = []
    for idx, s in enumerate(slides):
        eyebrow = html.escape(s.get("eyebrow", f"SECTION 0{idx + 1}"))
        counter = html.escape(s.get("counter", f"{idx + 1:02d} / {len(slides):02d}"))
        headline_html = render_headline_html(s.get("headline_parts", []), tokens)
        subheadline = html.escape(s.get("subheadline", ""))
        cards_html: List[str] = []
        for c_idx, card in enumerate(s.get("cards", [])):
            accent_col = (
                tokens["brand_primary"] if c_idx % 2 == 0 else tokens["brand_gold"]
            )
            cards_html.append(
                f"""
                <div class="concept-card" style="border-left: 6px solid {accent_col};">
                  <div class="card-badge" style="color:{accent_col}">{html.escape(card.get("badge", f"0{c_idx+1}"))}</div>
                  <h3 class="card-title">{html.escape(card.get("title", ""))}</h3>
                  <p class="card-detail">{html.escape(card.get("detail", ""))}</p>
                </div>
                """
            )
        callout_html = ""
        if s.get("callout_text"):
            callout_html = f"""
            <div class="callout-bar">
              <span class="callout-badge">{html.escape(s.get("callout_badge", "KEY TAKEAWAY"))}</span>
              <span class="callout-text">{html.escape(s.get("callout_text", ""))}</span>
            </div>
            """
        logo_img = (
            f'<img src="{logo_data_uri}" alt="Logo" class="brand-logo" />'
            if logo_data_uri
            else '<span class="brand-dot"></span>'
        )
        slide_blocks.append(
            f"""
            <section class="slide" id="slide-{idx + 1}">
              <div class="bg-dots"></div>
              <div class="glow-primary"></div>
              <div class="glow-gold"></div>
              <header class="slide-header">
                <div class="brand-pill">
                  {logo_img}
                  <div>
                    <div class="brand-name">{html.escape(tokens["site_name"])}</div>
                    <div class="brand-sub">{html.escape(tokens["site_Tagline"])}</div>
                  </div>
                </div>
                <div class="counter-pill">{counter}</div>
              </header>
              <main class="slide-body">
                <div class="eyebrow-pill"><span class="eyebrow-dot"></span>{eyebrow}</div>
                <h1 class="slide-headline">{headline_html}</h1>
                <p class="slide-subheadline">{subheadline}</p>
                <div class="cards-stack">
                  {"".join(cards_html)}
                </div>
              </main>
              <footer class="slide-footer">
                {callout_html}
                <div class="footer-meta">
                  <span>{html.escape(tokens["site_name"])} · Programmatic Visual Studio</span>
                  <span>Swipe →</span>
                </div>
              </footer>
            </section>
            """
        )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>{html.escape(tokens["site_name"])} — Visual Deck</title>
<style>
  @page {{
    size: 1080px 1350px;
    margin: 0;
  }}
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }}
  body {{
    background: {tokens["bg_primary"]};
    color: {tokens["text_main"]};
    font-family: 'Inter', 'Plus Jakarta Sans', Arial, sans-serif;
  }}
  .slide {{
    width: 1080px;
    height: 1350px;
    position: relative;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    background: {tokens["bg_primary"]};
    padding: 64px 72px 54px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }}
  .bg-dots {{
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(74, 108, 247, 0.16) 1.5px, transparent 1.5px);
    background-size: 28px 28px;
    pointer-events: none;
  }}
  .glow-primary {{
    position: absolute;
    width: 680px;
    height: 680px;
    right: -180px;
    top: -160px;
    background: radial-gradient(circle, rgba(74, 108, 247, 0.24) 0%, transparent 70%);
    pointer-events: none;
  }}
  .glow-gold {{
    position: absolute;
    width: 560px;
    height: 560px;
    left: -160px;
    bottom: -160px;
    background: radial-gradient(circle, rgba(251, 176, 64, 0.14) 0%, transparent 70%);
    pointer-events: none;
  }}
  .slide-header {{
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}
  .brand-pill {{
    display: flex;
    align-items: center;
    gap: 14px;
  }}
  .brand-logo {{
    width: 44px;
    height: 44px;
    border-radius: 10px;
    object-fit: contain;
  }}
  .brand-dot {{
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: {tokens["brand_primary"]};
    box-shadow: 0 0 16px {tokens["brand_primary"]};
  }}
  .brand-name {{
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }}
  .brand-sub {{
    font-size: 13px;
    color: {tokens["text_muted"]};
    margin-top: 2px;
  }}
  .counter-pill {{
    padding: 8px 18px;
    border-radius: 999px;
    background: {tokens["bg_surface"]};
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 15px;
    font-weight: 700;
    color: {tokens["text_muted"]};
  }}
  .slide-body {{
    position: relative;
    z-index: 2;
    margin-top: 28px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }}
  .eyebrow-pill {{
    display: inline-flex;
    align-items: center;
    gap: 10px;
    width: fit-content;
    padding: 8px 18px;
    border-radius: 999px;
    background: rgba(74, 108, 247, 0.14);
    border: 1px solid rgba(74, 108, 247, 0.45);
    color: #93C5FD;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 22px;
  }}
  .eyebrow-dot {{
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: {tokens["brand_gold"]};
  }}
  .slide-headline {{
    font-size: 56px;
    line-height: 1.12;
    font-weight: 900;
    letter-spacing: -0.025em;
    margin-bottom: 20px;
  }}
  .slide-subheadline {{
    font-size: 24px;
    line-height: 1.45;
    color: {tokens["text_muted"]};
    margin-bottom: 36px;
  }}
  .cards-stack {{
    display: flex;
    flex-direction: column;
    gap: 22px;
  }}
  .concept-card {{
    background: {tokens["bg_surface"]};
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 22px;
    padding: 28px 32px;
    box-shadow: 0 18px 40px rgba(0,0,0,0.28);
  }}
  .card-badge {{
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }}
  .card-title {{
    font-size: 30px;
    font-weight: 800;
    margin-bottom: 10px;
  }}
  .card-detail {{
    font-size: 22px;
    line-height: 1.45;
    color: {tokens["text_muted"]};
  }}
  .slide-footer {{
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }}
  .callout-bar {{
    display: flex;
    align-items: center;
    gap: 16px;
    background: {tokens["bg_elevated"]};
    border: 1px solid rgba(251, 176, 64, 0.45);
    border-radius: 16px;
    padding: 14px 20px;
  }}
  .callout-badge {{
    background: {tokens["brand_gold"]};
    color: #0F172A;
    font-size: 13px;
    font-weight: 900;
    padding: 6px 12px;
    border-radius: 8px;
    letter-spacing: 0.06em;
  }}
  .callout-text {{
    font-size: 18px;
    font-weight: 700;
    color: {tokens["text_main"]};
  }}
  .footer-meta {{
    display: flex;
    justify-content: space-between;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 14px;
    font-size: 16px;
    color: {tokens["text_muted"]};
  }}
</style>
</head>
<body>
{"".join(slide_blocks)}
</body>
</html>"""


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build 1080x1350 PDF carousel and section PNGs."
    )
    parser.add_argument("--input-json", help="Optional JSON file with slides specification.")
    parser.add_argument(
        "--output-html",
        default="infographic_deck.html",
        help="Output self-contained HTML deck path.",
    )
    parser.add_argument("--output-pdf", help="Optional output PDF path (uses Playwright Chromium).")
    args = parser.parse_args()

    slides = DEFAULT_SLIDES
    if args.input_json and os.path.exists(args.input_json):
        with open(args.input_json, "r", encoding="utf-8") as f:
            data = json.load(f)
            slides = data.get("slides", data) if isinstance(data, dict) else data

    html_content = build_deck_html(slides)
    out_html = Path(args.output_html)
    out_html.write_text(html_content, encoding="utf-8")
    print(f"Wrote self-contained HTML deck ({len(slides)} slides) -> {out_html}")

    if args.output_pdf:
        try:
            from playwright.sync_api import sync_playwright

            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(viewport={"width": 1080, "height": 1350})
                page.goto(out_html.resolve().as_uri(), wait_until="networkidle")
                page.pdf(
                    path=args.output_pdf,
                    width="1080px",
                    height="1350px",
                    print_background=True,
                    margin={"top": "0px", "right": "0px", "bottom": "0px", "left": "0px"},
                )
                browser.close()
            print(f"Exported pixel-exact PDF carousel -> {args.output_pdf}")
        except Exception as exc:
            print(f"Playwright PDF export skipped ({exc}); open {out_html} in browser and Save as PDF.")


if __name__ == "__main__":
    main()
