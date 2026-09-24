# Portfolio — Animesh Mondal

A simple, elegant, fully static portfolio. No build step, no dependencies.

```
portfolio/
├── index.html               # Markup + content + structured data
├── styles.css               # Design system + layout + interactions
├── script.js                # Theme toggle, parallax, micro-interactions
├── assets/
│   ├── img/animesh-mondal.{avif,webp,jpg}  # Hero portrait (AVIF/WebP with JPG fallback)
│   ├── icons/*.png                   # Project app icons (Grovely, LoomBox, Zoca, Repruvia)
│   └── Animesh-Mondal-Resume.pdf     # Résumé linked from the nav
├── 404.html                 # Branded not-found page (GitHub Pages serves it automatically)
├── favicon.svg / favicon.ico        # "AM" monogram (SVG + 16/32/48 ICO)
├── apple-touch-icon.png             # 180×180
├── icon-192.png / icon-512.png      # PWA icons
├── icon-maskable-512.png            # PWA maskable icon (content inside the safe zone)
├── og-image.png / og-image.svg      # 1200×630 social card + its source
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

### Icons & social card

All icons and `og-image.png` are already generated from the brand mark (Geist / Geist Mono glyphs converted to outlines, so they render the same everywhere). If you edit `og-image.svg`, re-export it at 1200×630, e.g. open it in Chrome and screenshot it, or run
`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --screenshot=og-image.png --window-size=1200,630 og-image.svg`.

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
- **Design:** Geist + Geist Mono, a near-black (`#0c0e12`) / warm off-white (`#fafaf7`) palette with a single emerald accent (`#34d399`, darkened via `color-mix` in light mode). Breakpoints follow the design canvas (1440 / 834 / 390).
- **Theme:** dark by default, follows the OS until the visitor picks one; the pick is stored in `localStorage` (`am.theme`). A tiny inline script in `<head>` applies it before first paint. Switching uses a circular View Transition that grows from the toggle button.
- **Motion:** staggered hero line-reveal, word-by-word section headings, IntersectionObserver reveals, metric and GPA count-ups with a settle "tick", drifting hero grid, a nav pill that slides between links, magnetic + springy buttons, arrow fly-through on link hover, copy-icon to check-mark morph, 3D tilt with glare on the portrait and project cards, cursor-following border glow, an experience timeline that draws itself in, staggered stack chips, and a burger that morphs into a close icon. Everything animates `transform`/`opacity` only. Pointer effects run only on fine pointers, and `prefers-reduced-motion` turns motion off.
- **Copy-to-clipboard email** with a toast, falling back to `mailto:` when the clipboard is unavailable.
- **Accessible by default:** semantic landmarks, skip link, visible focus rings, 44px touch targets, ARIA labels on icon buttons, `aria-expanded` on the mobile menu (Escape closes it).
- **SEO + share-ready** — see SEO checklist above.

## Customizing

- **Content:** edit `index.html` directly. Sections are numbered in HTML comments (`01 HERO` … `07 CONTACT`).
- **Colors / typography:** design tokens live at the top of `styles.css` under `:root` (dark) and `:root[data-theme="light"]`. Change `--accent-raw` / `--accent-rgb` to re-tint the whole site.
- **Adding a project:** duplicate any `<div data-reveal><article class="card">…</article></div>` block inside `#work`; set `--tint` (an `r,g,b` triple) for the icon glow.
- **Metrics:** each `.metric .n` carries `data-count`, `data-prefix`, `data-suffix` and `data-decimals`; its text content is the final value shown without JS.
