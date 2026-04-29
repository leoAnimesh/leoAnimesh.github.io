# Portfolio — Animesh Mondal

A simple, elegant, fully static portfolio. No build step, no dependencies.

```
portfolio/
├── index.html               # Markup + content + structured data
├── styles.css               # Design system + layout + interactions
├── script.js                # Theme toggle, parallax, micro-interactions
├── favicon.svg              # Inline-style monogram favicon
├── og-image.svg             # 1200x630 social card (convert to .png — see below)
├── manifest.webmanifest     # PWA-lite metadata
├── robots.txt               # Crawl rules + sitemap pointer
└── sitemap.xml              # Search-engine sitemap
```

## Local preview

```bash
# Python 3
python3 -m http.server 8080

# Node
npx serve .
```

Visit http://localhost:8080.

## Deploy to GitHub Pages

### Option A — User site (recommended)

1. Create a repo named **`leoanimesh.github.io`** (must match your username).
2. Push everything to `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/leoanimesh/leoanimesh.github.io.git
   git push -u origin main
   ```
3. Settings → Pages → Source: **Deploy from a branch**, Branch: **`main` / root**.
4. Live at **https://leoanimesh.github.io/** within a minute.

### Option B — Project site

Any repo, push to `main`, enable Pages on root. URL becomes `https://leoanimesh.github.io/<repo>/` — if you use this, update absolute URLs (canonical, og:url, sitemap, robots) to match.

## SEO checklist (already wired up)

The portfolio ships with full SEO baked into `index.html`:

- **Title + meta description** tuned for "Animesh Mondal frontend engineer" queries.
- **Canonical URL** — points to `https://leoanimesh.github.io/`. Update if you use a custom domain.
- **Open Graph** (Facebook, LinkedIn, Slack) and **Twitter Card** with `summary_large_image`.
- **JSON-LD structured data** — Person + WebSite + ProfilePage graphs so search engines and AI crawlers understand the page is a person's profile, with job, employer, alumni, location, skills, and social profiles linked.
- **`robots.txt`** allowing all good crawlers and pointing to the sitemap.
- **`sitemap.xml`** with image extension referencing the OG card.
- **PWA `manifest.webmanifest`** for installable / mobile-bookmark behavior.
- **Favicon** as inline-clean SVG.
- **Theme color meta tags** that flip between light/dark for browser chrome on iOS/Android.
- **Performance hints** — `preconnect` and `dns-prefetch` for Google Fonts, `preload` for the stylesheet.

### Generate the PNG OG image (required)

Most social platforms (Twitter/X, LinkedIn, Slack) only render PNG/JPG OG images, not SVG. Convert `og-image.svg` to `og-image.png` once:

**Option 1 — ImageMagick (CLI)**
```bash
brew install imagemagick    # macOS
magick og-image.svg -resize 1200x630 og-image.png
```

**Option 2 — Inkscape (CLI)**
```bash
inkscape og-image.svg --export-type=png --export-filename=og-image.png \
  --export-width=1200 --export-height=630
```

**Option 3 — Online**
Open `og-image.svg` in a browser, take a 1200×630 screenshot, save as `og-image.png`.

Commit the PNG alongside the rest of the files.

### Apple touch icon (optional but recommended)

Generate `apple-touch-icon.png` (180×180) and `favicon.ico` from `favicon.svg`:

```bash
# 180×180 apple touch icon
magick favicon.svg -resize 180x180 apple-touch-icon.png

# Multi-size .ico
magick favicon.svg -define icon:auto-resize=16,32,48 favicon.ico
```

Or use a free service like https://realfavicongenerator.net/ — upload `favicon.svg`, download the bundle, drop the files in next to `index.html`.

### After deploying — submit your site

1. Add the property in **Google Search Console** (`https://search.google.com/search-console`).
2. Verify by adding the meta tag GSC gives you to `<head>`.
3. Submit `https://leoanimesh.github.io/sitemap.xml`.
4. Repeat for **Bing Webmaster Tools** (free, gets you in DuckDuckGo and other Bing-powered engines).
5. Validate the structured data at https://search.google.com/test/rich-results.
6. Validate Open Graph at https://www.opengraph.xyz/ or https://cards-dev.twitter.com/validator.

## Custom domain

1. Buy a domain.
2. Add a `CNAME` file at the repo root containing only your domain on one line:
   ```
   animesh.dev
   ```
3. DNS: ALIAS/ANAME at apex → `leoanimesh.github.io`, or A records to GitHub Pages IPs.
4. Settings → Pages → set custom domain, enable HTTPS.
5. **Update `<link rel="canonical">`, `og:url`, `twitter:url`, `sitemap.xml`, and `robots.txt` to use the new domain.**

## What's inside (engineering choices)

- **No framework, no build step.** Loads instantly, deploys anywhere static.
- **CSS custom properties** drive the entire design system; `data-theme` swaps the palette in one attribute.
- **System theme by default** — first visit follows the OS preference; user override is persisted in `localStorage`. Live changes to the OS theme propagate when no override is set.
- **View Transitions API** for an animated circular-reveal theme switch, with a graceful 550ms cross-fade fallback.
- **IntersectionObserver** reveal-on-scroll with staggered children. `prefers-reduced-motion` fully respected.
- **Cursor-tracking spotlight** across the entire viewport, plus 3D card tilt and magnetic primary buttons (skipped on coarse pointers).
- **Sticky blurred header**, ambient drifting gradient blobs, fixed left/right rails (social links + scroll progress) — all rendered on devices ≥1100px.
- **Accessible by default:** semantic landmarks, skip link, visible focus rings, `aria-pressed` on toggle, ARIA labels on icons.
- **SEO + share-ready** — see SEO checklist above.

## Customizing

- **Content:** edit `index.html` directly. Sections are clearly labeled with HTML comments.
- **Colors / typography:** all design tokens live at the top of `styles.css` under `:root` (light) and `[data-theme='dark']` (dark).
- **Sections:** add new sections by copying any `<section class="section reveal">` block.
- **Adding a new project:** duplicate any `<article class="card">` block inside the `#work` section.
