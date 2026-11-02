# Do It With AI: SEO Inspector, Content Converter & Social Studio (Chrome Extension — Manifest V3)

An all-in-one Manifest V3 Chrome Extension built for **DoItWithAI.tools**, uniting **On-Page/Technical/Off-Page SEO Inspection**, **1-Click Article Content Conversion (PDF/Word/Markdown/MP3)**, and **15-Post Social Media Repurposing** in a fast Ahrefs-inspired dark 2-pane interface with Chrome Side Panel support.

## How to Load in Google Chrome (Developer Mode — 30 Seconds)

1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable the **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select this `chrome-extension` folder (or extract `doitwithai-chrome-extension-mv3.zip` and select the extracted folder).
5. Pin **Do It With AI Studio** to your Chrome toolbar and click the icon on any webpage (or click **◧** inside the extension header to dock it to Chrome's Side Panel).

## How to Publish on the Google Chrome Web Store

1. Visit the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and complete the one-time $5 developer account registration if not already registered.
2. Click **New Item** and upload `doitwithai-chrome-extension-mv3.zip`.
3. Fill in the Store Listing details:
   - **Title**: `Do It With AI: SEO Inspector, Content Converter & Social Studio`
   - **Category**: `Search Tools` or `Productivity`
   - **Single Purpose Description**: `Inspect on-page/technical SEO signals, convert web articles into readable documents/audio, and generate social media posts from the active tab.`
   - **Permission Justifications**:
     - `activeTab` & `scripting`: Extracts headings, meta tags, links, schema, and article text from the active tab only when the user opens the extension.
     - `sidePanel`: Allows the user to dock the SEO & Content Studio into Chrome's side panel while browsing.
     - `storage`: Saves the user's preferred Dark/Light UI theme locally.
4. Click **Submit for Review**.
