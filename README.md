# BINKOD Tech Web

Static public websites for **BINKOD Tech** — the brand and company behind
Family Path Locator and upcoming applications.

## Purpose

This repository hosts BINKOD Tech's public web presence: the overall BINKOD
Tech homepage at the site root, plus a dedicated section for each application.
New applications can be added independently without restructuring existing
pages.

- Brand / company: **BINKOD Tech** (Binkod)
- BINKOD website: <https://www.binkod.in/>
- Contact email: `binkodtech@gmail.com` — displayed on the root homepage
  (contact section + footer, as a `mailto:` link), on
  `/family-path-locator/contact/` (plain text) and on
  `/family-path-locator/delete-account/` (as a `mailto:` link, required for the
  Google Play account-deletion flow); nowhere else on the site

## Technology

- Static **HTML5 / CSS3 / vanilla JavaScript**
- No frameworks, no package managers, no build step, zero runtime dependencies
- **No backend, no API, and no Firebase integration is required** for this
  website — it is a purely static site
- Homepage theme: light by default with an accessible light/dark switcher in
  the header; the choice is saved in `localStorage` under `binkod.theme` and
  applied before first paint by an inline `<head>` snippet (no flash). Theming
  is homepage-only (`css/home.css`, sections 16–17)
- Brand icons for the homepage Technology section live in
  `public/assets/tech/*.svg`; logos belong to their respective owners and no
  partnership, certification or deployment is implied by their presence
- Hosting: [Vercel](https://vercel.com) (clean URLs via `vercel.json`)
- Source control: [GitHub](https://github.com)

## Applications

### Family Path Locator (primary product)

- Tagline: *Connected Families, Always Safe*
- A private family location-sharing and safety app for Android — family map,
  current location sharing, family chat, Safety Alerts, GeoTag camera, and
  more. Designed as a free Android application.
- Path: `/family-path-locator/`
- Design system: `css/family-path.css`; reveal animation logic in
  `js/family-path.js`

### Device Matrix: System Info (Android utility)

- Tagline: *System Info*
- An Android utility for understanding a phone's hardware and system
  information: processor, memory, storage, battery and device specifications.
- Public site: <https://app.binkod.in/device-matrix/>
- Pages: `/device-matrix/` (overview), `/device-matrix/features/`,
  `/device-matrix/plans/`, `/device-matrix/contact/` and
  `/device-matrix/privacy-policy/`
- Design system: `device-matrix/css/device-matrix.css`; behavior in
  `device-matrix/js/device-matrix.js`; public settings in
  `device-matrix/config.js`
- Version manifest: `device-matrix/latest-version.json` (see below)

### BINKOD ABC (upcoming)

- Status: **Upcoming / in development — not yet released.** Has a dedicated
  public product page at `/binkod-abc/` presenting it as an upcoming project.
- A pre-primary learning and practice application for Nursery, LKG and UKG
  children (early learning, English/Hindi, phonics, listening,
  identification, general knowledge, practice activities, and progress
  tracking) — all content on the page is described as planned/in development.
- No release date, pricing, store link, screenshots, or unsupported features
  are claimed — do not invent any.
- Page: `binkod-abc/index.html`, styles `css/binkod-abc.css`, script
  `js/binkod-abc.js`, icon `public/assets/binkod-abc/icons/app-icon.png`

## Main Routes / Pages

| Route | Page |
| --- | --- |
| `/` | Root — **BINKOD Tech homepage**. Light-first design with a light/dark switcher in the header (light default; choice saved in `localStorage` under `binkod.theme`). Sections in order: hero ("Building useful products with intelligent technology.") with a rotating product card; **Products** (Family Path Locator and Device Matrix cards marked *Internal testing*, BINKOD ABC and Disk Matrix cards marked *Under development*, and a **General smart applications** panel for custom digital-productivity work — CRM, SaaS, tools for shopkeepers, schools and organisations); **Technology** (five cards: mobile — Flutter / React Native / Android; backend & API — .NET, Python, Node.js, REST, one unified API & MCP integrations tile; web — a single .NET section covering ASP.NET MVC / Razor Pages / Blazor; cloud & infrastructure — only Azure / AWS / Cloudflare / Firebase, shown with logos; AI & emerging technologies); **AI Engineering Lab** (language models, RAG, embeddings/vector search, agents & MCP, evaluation — general education); **AI architecture** (six-layer reference with the AI layers marked optional); **Product engineering** (general principles); contact section + footer. The contact email `binkodtech@gmail.com` is displayed in the contact section and the footer Support column. Only the Products section names products; everything else is general engineering education. |
| `/binkod-abc/` | BINKOD ABC — upcoming-product page (in development) |
| `/family-path-locator/` | Family Path Locator homepage |
| `/family-path-locator/privacy-policy` | Family Path Locator Privacy Policy |
| `/family-path-locator/terms-and-conditions` | Family Path Locator Terms & Conditions |
| `/family-path-locator/disclaimer` | Family Path Locator Disclaimer |
| `/family-path-locator/contact` | Contact & Support — heading **"Help Center / Support"**: App Support, one prominent **Account & Data Deletion** card linking to the deletion page ("Learn More About Account Deletion"), "Before you write" topic links, Support & Privacy document cards. Displays `binkodtech@gmail.com` as plain text (no `mailto:`). |
| `/family-path-locator/delete-account` | **Account & Data Deletion** — the public page intended as the *Delete account URL* in Google Play Console: in-app deletion steps (Profile → scroll to bottom → Delete Account, no Settings step), the family-administrator restriction, email deletion request (`mailto:` with a pre-filled subject), request processing, and a contact CTA. No company name is used in user-facing instructions. |
| `/device-matrix/` | Device Matrix: System Info homepage — overview, screenshots, features and FAQ, with links to Features, Plans, Contact and the privacy policy. |
| `/device-matrix/features/` | Device Matrix feature guide — readings, hardware checks, apps and permissions, reports and widgets. |
| `/device-matrix/plans/` | Device Matrix plan comparison — Free, Remove ads and Pro. |
| `/device-matrix/contact/` | Device Matrix support and contact page. |
| `/device-matrix/privacy-policy/` | Device Matrix privacy policy — draft with `noindex` until legal review. |
| `/404.html` | Not-found page |

The Family Path Locator legal pages are **product-specific to Family Path
Locator** and live only inside the `/family-path-locator/` structure. They are
not linked from the root homepage, its navigation, or the BINKOD ABC page. The
Device Matrix privacy policy lives at `/device-matrix/privacy-policy/` and is
linked only from the Device Matrix footer, contact page and support areas.

## Project Structure

```
binkod-tech-web/
├── public/
│   ├── assets/
│   │   ├── shared/
│   │   │   ├── binkod-wordmark-473x135.png  # BINKOD Tech wordmark (links to binkod.in)
│   │   │   ├── binkod-header-1600x639.jpeg  # social preview image (og:image)
│   │   │   └── binkod.png            # previous wordmark (kept, no longer referenced)
│   │   ├── tech/                     # brand icons for the homepage Technology section
│   │   ├── binkod-abc/
│   │   │   └── icons/app-icon.png    # BINKOD ABC project icon (upcoming)
│   │   ├── device-matrix/            # Device Matrix logos, icons and screenshots
│   │   └── family-path/              # Family Path visual assets
│   │       ├── images/               # Illustrations (filenames may contain spaces)
│   │       ├── screenshots/          # Reserved for real app screenshots
│   │       └── icons/                # Family Path app icon
│   └── favicon/                      # fav-96.png, apple-touch-icon.png
├── family-path-locator/               # Family Path pages (directory routes)
│   ├── index.html                    # Homepage (hero, features, about)
│   ├── privacy-policy/index.html
│   ├── terms-and-conditions/index.html
│   ├── disclaimer/index.html
│   ├── contact/index.html
│   └── delete-account/index.html      # Public deletion page (Google Play delete URL)
├── binkod-abc/                       # BINKOD ABC upcoming-product page
│   └── index.html
├── device-matrix/                    # Device Matrix: System Info pages
│   ├── index.html                    # Overview, screenshots, features, FAQ
│   ├── config.js                     # Play Store URL + privacy noindex flag
│   ├── latest-version.json           # App version manifest
│   ├── features/index.html
│   ├── plans/index.html
│   ├── contact/index.html
│   ├── privacy-policy/index.html     # Draft privacy policy (noindex)
│   ├── css/                          # device-matrix.css, screenshot-showcase.css
│   └── js/device-matrix.js           # Device Matrix page behavior
├── css/
│   ├── global.css                    # Design tokens + site-wide styles (nav, buttons, footer)
│   ├── home.css                      # Homepage styles (dark base tokens, light default, light theme block)
│   ├── family-path.css               # Family Path styles + hero/scroll animations
│   └── binkod-abc.css                # BINKOD ABC styles (playful, educational theme)
├── js/
│   ├── global.js                     # Nav toggle + SITE_CONFIG + install bar
│   ├── home.js                       # Homepage behavior (header, reveal, spotlight, theme switcher)
│   ├── family-path.js                # Scroll-reveal enhancement (Family Path homepage)
│   └── binkod-abc.js                 # Scroll-reveal enhancement (BINKOD ABC page)
├── index.html                        # Root — BINKOD Tech homepage
├── 404.html                          # Not-found page
├── robots.txt                        # Crawler policy + sitemap reference
├── app-ads.txt                       # AdMob app-ads.txt authorization file
├── sitemap.xml                       # Public routes
├── vercel.json                       # Static hosting configuration (clean URLs)
├── .gitignore
└── README.md
```

Important asset locations:

- **BINKOD Tech wordmark:** `public/assets/shared/binkod-wordmark-473x135.png`
  — use for every BINKOD Tech logo appearance; always link it to
  <https://www.binkod.in/>. The square company logo (favicon source) is
  `public/assets/shared/binkod-logo-500x500.png`.
- **BINKOD ABC icon:** `public/assets/binkod-abc/icons/app-icon.png`.
- **Family Path icon:** `public/assets/family-path/icons/familypath.png`.
- Illustration filenames may contain spaces — `%20`-encode them in `src`.

## Local Development

No build step and no dependencies to install.

1. Open the folder in VS Code.
2. Serve it with any static file server, for example:

   ```
   python -m http.server 8080
   ```

   Then open `http://localhost:8080/`.

Alternatives: the VS Code **Live Server** extension (recommended — serves over
HTTP like production), or opening files directly (quicker, but directory URLs
like `/family-path-locator/` behave best over a local server).

## Deployment

Intended workflow: **GitHub → Vercel → Custom Domain**

1. Push to GitHub (repository name: `binkod-tech-web`).
2. Import into Vercel — Framework Preset *Other*, no build command, no
   environment variables.
3. Attach the custom domain in Vercel project settings and configure DNS.

`vercel.json` enables `cleanUrls`, so pages are served at extensionless paths
such as `/family-path-locator/privacy-policy`.

## Advertising Authorization File

- **File:** `app-ads.txt` — use this exact filename.
- **Location:** repository root, served at
  <https://app.binkod.in/app-ads.txt>.
- **Purpose:** authorizes the digital sellers listed by Google AdMob to sell
  advertising inventory for the **Device Matrix** Android app.
- Keep the file at the site root; do not move it into an app subdirectory.
  It must contain the exact authorization record supplied by AdMob (Apps →
  app-ads.txt), and the public URL is listed in `sitemap.xml`.

## App Version Manifest

- **File:** `device-matrix/latest-version.json` — served at
  <https://app.binkod.in/device-matrix/latest-version.json>.
- **Purpose:** the Device Matrix Android app reads this file to check for
  updates. `version` is the public version name and `versionCode` is the
  integer Play Store version code; keep both in sync with each release.
- Keep the file at this exact path and filename. The app requests this URL
  directly, so do not add a redirect or rename the directory.

## Pending Items (tracked TODOs in the code)

1. **Canonical / Open Graph URLs** — the root homepage now carries
   `rel="canonical"`, the full `og:*` / `twitter:*` set, JSON-LD and shares
   `https://app.binkod.in/` as its canonical URL, with
   `public/assets/shared/binkod-header-1600x639.jpeg` as the preview image.
   Product pages still need the same treatment once their final domain is
   confirmed (marked in each `<head>`).
2. **Screenshots** — the homepage shows labelled device placeholders. Replace
   them with real app screenshots in `public/assets/family-path/screenshots/`
   (instructions are in HTML comments on the page).
3. **BINKOD ABC content** — expand `/binkod-abc/` (detailed activities,
   screenshots, store link) as the application progresses. Keep "in
   development" / "coming soon" wording until the app is actually released;
   add no Play button before an approved listing exists.

## Content Rules

- Product pages stay **product-first**: their main content covers only the
  product itself. Do not add "About BINKOD" / company-description / blog
  sections to product pages. BINKOD Tech branding (wordmark, "by BINKOD
  Tech", binkod.in links) belongs only in the navigation brand, product
  footers, and the footer — never in product-page content flow.
- The **root homepage** is the one place general engineering topics are
  allowed (Technology, AI Engineering Lab, AI architecture, Product
  engineering). Keep them as general education: no
  claims about shipped features, production systems, partnerships or
  certifications, no invented roadmaps, and no product names outside the
  Products section.
- Never claim: location history, guaranteed accuracy, emergency-service
  replacement, chat push/typing/read receipts, iOS support, subscriptions,
  or continuous second-by-second tracking.
- Location updates follow the app's configured update/movement policy —
  avoid "live tracking" / "real-time tracking" wording.
- Safety Alerts require internet and notification permissions; they are not a
  replacement for emergency services.
- The official contact email is `binkodtech@gmail.com`. It is displayed as a
  `mailto:` link in the root homepage's contact section and footer Support
  column. On `/family-path-locator/contact/` display it as plain styled
  text — **no `mailto:` link**. On `/family-path-locator/delete-account/` it
  must be a clickable `mailto:` link (with the pre-filled subject
  `Family Path Locator — Account Deletion Request`) because the page is used
  as the *Delete account URL* in Google Play Console. The email must not
  appear on any other page — not the Family Path homepage or its footer, not
  the Family Path legal pages, not the BINKOD ABC page.
- Family Path Locator Google Play CTAs are **visual only**: they keep the
  Play icon and button styling but have no store URL. Do not add a Play Store
  link or restore a URL in `js/global.js` unless the public listing is
  approved. Device Matrix Play buttons use the real listing URL with
  `target="_blank" rel="noopener noreferrer"`.
- Never use the word "Legal" as a UI label (navigation, footer, headings,
  labels). The footer column that groups Privacy Policy, Terms & Conditions,
  Disclaimer and Contact is titled **"Support"**. Do not change the wording
  inside the legal documents themselves.
- Never invent Play Store URLs, dates, pricing, or legal entity details.
- Do not alter the legal page wording; do not add legal links to the root
  homepage or its navigation.
- Illustration files with spaces must be `%20`-encoded in `src` attributes.

## Security

- No secrets, API keys, or credentials may be committed to this repository.
- The website has **no backend**, no database, no authentication, and no
  server-side code.
- Google Tag Manager (`GTM-TXD678MR`) is the only analytics integration. Its
  container snippet is included in the `<head>` of every tracked HTML page;
  analytics data is handled client-side by Google Tag Manager.
- `.env` files are ignored by `.gitignore` as a safeguard, even though none
  are used.

## Future Expansion

New application sections are added independently:

- `/family-path-locator/` — Family Path Locator (live)
- `/device-matrix/` — Device Matrix: System Info (public site live; Android app
  listed as internal testing)
- `/binkod-abc/` — BINKOD ABC (upcoming; public product page live, app still
  in development)

Each new section brings its own pages, stylesheet, script file, and asset
folder, following the structure of `family-path-locator/`.
