# Fun4Guests Rebuild — Project Brief

**For:** a new Claude Cowork session working in a fresh project folder.
**Owner:** Richard Standen (richardstanden@gmail.com), Event Stuff Ltd, Thetford. GitHub: standr80.
**Goal:** rebuild www.fun4guests.com as a modern static site with a blog, following the proven Megacheques playbook (June 2026), then cut over DNS.

---

## 1. What the business is

Fun4Guests hires out games and vintage sideshow attractions for parties, weddings, corporate events, fundraising and product launches (crazy golf, football pool, face-in-the-hole boards, giant jigsaws, fun house mirrors, kissing booth, etc.). It is **enquiry-driven, not e-commerce** — no Stripe/checkout needed. Phone 01842 337 100. Sister brands to cross-link in footer: putterfingers.com (minigolf), designsonprint.com (print), megacheques.co.uk (giant cheques), photocutouts.co.uk.

## 2. Current site (verified June 2026)

- Hand-coded static HTML, ~2015 Bootstrap 3 template: jQuery 2.1.4, Modernizr 2.6.2, Superfish menus, animate.css, icomoon icons. Pages are individual `.html` files plus `contact.php`. PHP shared hosting.
- ~25 pages: home, ~22 hire/product pages (see nav), about.html, green-credentials.html, contact.php, terms-and-conditions.html, privacy-policy.html.
- **Marketing tags to KEEP (Richard's decision): HubSpot** portal `26935772` — collected forms (`collectedforms.js`) and chat (`conversations-embed.js`). Keep the HubSpot contact form instead of building a custom one (no Resend needed for forms).
- Other tags present: two Facebook pixels (`774697228947707`, `126094184760794`), Pinterest (`pinit_main.js`). Ask Richard which to keep; gate any kept tracking pixels behind cookie consent.
- **Analytics is dead**: the site runs old Universal Analytics (`analytics.js`), switched off by Google in 2023. Replace with a new GA4 property + consent-mode cookie banner (pattern below).
- Keep these verifications at rebuild: meta `facebook-domain-verification=7i778ziyikt4itgb8x2kkl2bxa5xmj`, meta `google-site-verification=ycCDTT_ZBBjFqmPFsN0bOb-J5pvwOCW9x3Zih6yy2RU`.
- Logo: `/images/logo.svg` on the live site. Client logos (ITV, BBC, Asda, Unilever, RAF, National Trust…) shown on homepage — keep this trust strip.

## 3. Target stack (same as Megacheques)

- **Astro (v6+) static output** in a `site/` subfolder, **Tailwind 4** via `@tailwindcss/vite`, **@astrojs/vercel** adapter, deployed on **Vercel**, repo under github.com/standr80.
- Blog via **Astro content collections**: markdown files in `site/src/content/blog/`, a `/blog/` index, `/blog/[slug]/` pages, RSS feed (`@astrojs/rss`), and blog posts in the sitemap. Write one sample post so Richard sees the workflow (a `.md` file with frontmatter = a post).
- `@astrojs/sitemap` + robots.txt + canonical URLs + JSON-LD (LocalBusiness sitewide; Service schema on each hire page).

## 4. Build order (follow the Megacheques playbook)

1. **Crawl first**: copy `fun4guests-crawl.js` (supplied alongside this brief) and the `.env` file from the Megacheques folder (contains `FIRECRAWL_API_KEY`) into the new project. `npm install @mendable/firecrawl-js dotenv`, then `node fun4guests-crawl.js`. This saves every page as markdown/HTML plus an image list to `crawl-output/`.
2. **Scaffold** the Astro site; rebuild pages from the crawl content with a fresh, mobile-first design (include a hamburger menu from day one). Keep the playful, colourful brand feel; reuse the existing logo.svg.
3. **Self-host all images.** IMPORTANT: the Cowork sandbox cannot fetch arbitrary domains. Generate a `download-images.sh` script from `crawl-output/images.json` for Richard to run in Terminal, then convert to WebP (max 1400px, q80) with ImageMagick in the sandbox.
4. **HubSpot embeds**: re-add the portal 26935772 scripts (forms on the contact page, chat sitewide if Richard confirms). Load tracking-type scripts only after cookie consent.
5. **GA4 + consent banner**: copy the pattern from Megacheques — `PUBLIC_GA_ID` env var, gtag with Consent Mode v2 default-denied, accept/decline banner storing choice in localStorage. Richard creates the GA4 property and supplies the G- ID.
6. **SEO migration pack**: sitemap, robots.txt, and **301 redirects for every old `.html` URL** (use `crawl-output/index.json` as the source of truth). Lesson learned: Astro config `redirects` only match the exact path — also add a server-rendered catch-all page (`[...notfound].astro`, prerender=false) plus middleware reading a shared redirect map, so trailing-slash and stray variants 301 correctly instead of 404ing. Branded 404 page.
7. **Verify before cutover** (use Claude in Chrome against the Vercel preview URL): every page 200, all redirects, sitemap/robots, mobile hamburger, consent banner, HubSpot form submits.
8. **Cutover**: find where DNS is hosted (likely GoDaddy like megacheques.co.uk — export the zone first and save it to the project folder). Point apex + www at the new Vercel project, keep all verification TXT records. Lower TTL to 600 first. Submit sitemap in Search Console after the switch. Keep old hosting alive for a couple of weeks as fallback.

## 5. Operational lessons from the Megacheques build (sandbox quirks)

- `npm run build` fails with EPERM on `node_modules/.vite` inside the mounted folder — **rsync the site to /tmp and build there** for verification.
- File deletes in the mounted folder fail until you call the `allow_cowork_file_delete` tool.
- Commit with `git -c user.name="Richard Standen" -c user.email="richardstanden@gmail.com" commit …`. **Pushes must be run by Richard in Terminal** (no GitHub credentials in the sandbox).
- After Richard pushes, **verify the deploy actually happened** (fetch the live page and check for new markup). Vercel webhooks occasionally skip — an empty commit re-triggers.
- The sandbox network allowlist blocks most external domains — use the Claude in Chrome browser for fetching/testing live sites, or have Richard run download scripts in Terminal.
- Stripe checkout/payment pages cannot be automated by Claude in Chrome — Richard does payment steps manually (not relevant here; no checkout on this site).

## 6. Conventions Richard likes

- Concise, direct communication. Verify everything live after deploy. Commit at each milestone with clear messages. Test results presented as short pass/fail summaries.
- Email infrastructure (if ever needed beyond HubSpot): Resend, domain-verified senders, `CONTACT_TO` office@eventstuff.ltd with `CONTACT_BCC` richard@eventstuff.ltd.
