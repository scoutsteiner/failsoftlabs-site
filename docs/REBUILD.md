> Historical first-pass report. Blog and Projects navigation described below were superseded by [SECOND-PASS.md](SECOND-PASS.md).

# Fail Soft Labs rebuild handoff

## Inspection and preservation

The working directory already contained an uncommitted migration from HTML to Astro when this task started. Initial installed versions: Astro 7.1.3, sitemap 3.7.3, Vitest 4.1.10. Existing scripts were `dev`, `build`, `preview`, and `test`; no lint script existed. Node on this machine is 24.15.0. Compatible dependency updates brought Astro to 7.3.4 and Vitest to 4.1.11 and cleared the npm audit findings.

The original Git repository and `origin` (scoutsteiner/failsoftlabs-site) are unchanged. `astro.config.mjs` remains static output with the existing domain and sitemap integration. `public/CNAME` remains intact. There were no Wrangler files, Pages Functions, or checked-in deployment workflows in the inspected workspace. Remote Cloudflare settings were not accessible from local configuration and have not been changed. The pre-existing deleted root HTML/CNAME files were already deleted before this work; this rebuild did not initiate those deletions.

Reusable pieces: the subnet calculator and its tests, base layout metadata, favicon and social SVGs, existing legacy routes. The SVG palette now follows charcoal/orange/cyan. The old Ticket Goblin concept route remains accessible but is not promoted in the new projects index. Old unpublished project data remains in source, not rendered onto the new homepage.

## Architecture and changed areas

- `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `Footer.astro`, `src/styles/global.css`: semantic, responsive shell; visible focus; skip link; dark default and saved light mode; reduced-motion support.
- `src/pages/index.astro`: compact Command Deck, conditions strip, quick tools, Moxie placeholder, honest empty notes/projects, and small identity panel.
- `src/components/CommandDeck.astro`, `src/lib/news.ts`, `src/data/newsSources.ts`, `src/pages/news.json.ts`: build-time RSS/Atom aggregation.
- `src/components/Conditions.astro`: fixed Bethlehem hourly NWS forecast and 511PA link; no visitor geolocation.
- `src/data/tools.ts`: all 19 external tools requested, plus the existing local subnet calculator. `src/pages/tools/index.astro` provides name/description search and category filtering.
- `src/data/site.ts`: site name, tagline, contact, navigation, and social profiles.
- `src/content.config.ts`, `src/content/{blog,projects}`, `src/pages/blog/*`, `src/pages/projects/[...id].astro`: Markdown collections, draft filtering, chronological blog, tags, title/tag filtering, RSS, and content routes.
- Minimal Lab, Life, Advocacy, Projects, and Links pages. Comedy has a route but no primary navigation entry. Legacy Notes points to the new Blog. Contact now uses the supplied public support address.
- `src/tests/news.test.ts` and `scripts/browser-check.mjs`: parser/failure tests and browser verification.

## Command Deck

Click a topic to expand its stories on the homepage. Another topic closes the old one; Collapse or Escape closes the feed and returns focus. Articles show publisher, supplied publication time, headline, excerpt when available, and a direct article link. Dated items sort newest first; undated ones follow. Duplicate URLs and normalized titles are removed. Article HTML is not injected into the page; URL protocols are restricted to HTTP(S), XML DTD/entities are rejected, and requests have timeouts.

Feeds are fetched on the build machine, never scraped in visitors' browsers. A process-level promise cache shares a single snapshot between homepage and JSON output. Cloudflare can serve the resulting static assets through its normal cache. There is no durable last-good feed cache: a failed source is explicitly reported and other sources still render. All-source failure produces an empty state with publisher links. Build/network failures do not masquerade as live news.

The snapshot refreshes **only when the site builds**. Its Eastern-time timestamp is visible. There is no scheduled refresh or Worker deployed. This avoids changing the existing deployment integration. For frequent updates later, add a reviewed scheduled build hook or a Worker cache; keep any hook secret server-side. `news.json` is a public snapshot for future consumers, not a live API.

MS and incontinence use curated, non-fetish health/advocacy resources pending verified feeds. Local news links directly to Lehigh Valley Public Media. Its [RSS terms](https://www.lehighvalleypublicmedia.org/rss-terms-of-service/) restrict public mobile syndication, so it is not ingested. ScienceDaily's corrected feed is listed in its [official feed directory](https://www.sciencedaily.com/newsfeeds.htm). These are resources/headlines, not medical advice authored by Beth.

## Edit news and tools

Edit `src/data/newsSources.ts`. Each topic has a unique `id`, friendly `name`, short `hint`, and `sources`. Each source has `name`, absolute RSS/Atom `url`, and publisher `home`. An empty `url` means a resource link only. Use reputable, topic-specific feeds and check their syndication terms before adding them. Rebuild, inspect `dist/news.json`, and open that topic to verify attribution and failure behavior.

Edit `src/data/tools.ts` to add a tool's `name`, `href`, `category`, and `description`. Categories populate automatically. The homepage's short selection is in `src/pages/index.astro`; the full toolbox includes every configured entry. All supplied additional tools are included: MXToolbox, Qualys SSL Labs, SecurityHeaders.com, CISA KEV, and IPinfo. External links navigate normally; only news article links open a labeled new tab.

## Publish Markdown

Copy `src/content/blog/authoring-template.md` to a descriptive filename, for example `dns-lessons.md`. Replace the frontmatter and body:

```yaml
---
title: "DNS lessons"
description: "A brief excerpt."
date: 2026-09-22
tags: [lab, tech]
draft: false
---
```

Write standard Markdown below the frontmatter. The filename becomes `/blog/dns-lessons/`. Drafts default to true, and future-dated posts are excluded until a build on/after the date. Build to publish changes; dates do not trigger builds themselves. The homepage, blog index, and `/blog/rss.xml` update together. Use standard Markdown links/images rather than Obsidian-only wikilinks or embeds. Place public images under `public/images/` and include descriptive alt text. Review copied content for private material. Nothing in the Obsidian vault is read or modified.

Projects use the same frontmatter under `src/content/projects/`; published files populate the Projects index. No fictional posts or essays were added. The templates remain drafts. The blog layout has an explicit future-comments insertion point, but no comment service is installed.

## Moxie

Put final approved artwork in `public/images/moxie.webp` (or another public asset path), then replace the `.moxie-placeholder` element in `src/pages/index.astro` with an image using explicit width/height, responsive `max-width:100%`, and descriptive alt text. Keep the corner compact. No final mascot artwork or AI personality has been invented.

## Deployment and integrations

No API keys are needed. The [NWS API](https://www.weather.gov/documentation/services-web-api) uses a fixed public Bethlehem coordinate; weather requests go directly from the browser to NWS. Forecast availability therefore depends on NWS connectivity and CORS. An unavailable forecast is clearly labeled with a permanent official forecast link. Traffic uses [511PA](https://www.511pa.com/); no incident data is fabricated. A future traffic adapter would need a verified licensed public feed before replacing that link.

Local commands (use `npm.cmd` on this Windows machine if PowerShell execution policy blocks `npm.ps1`):

```sh
npm ci
npm run build
npm test
npm run preview -- --host 127.0.0.1
# In another terminal, with Edge installed:
npm run test:browser
```

No lint command is configured. The browser checker uses Playwright with the installed Edge channel and saves screenshots/results in ignored `.qa/`.

Review and commit the working tree when ready, then use the existing GitHub/Cloudflare deployment path. Do not reinitialize Git or create a replacement Pages project. Verify the existing project's build command is `npm run build`, output directory is `dist`, and its Node runtime meets Astro's installed requirement (Node 24.15.0 works locally). These are the existing [Astro Pages deployment conventions](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/); no remote settings were changed or verified here. If the existing deployment actually uses Workers rather than Pages, review that pipeline before changing anything. No push, production deployment, DNS change, or Worker change was performed.

Cloudflare Web Analytics can be considered later through the existing dashboard; no tracker, cookie banner, new database, SPA framework, or analytics script has been added. Theme preference is stored locally, and works for the current page even if storage is blocked.

## Deliberately later / limits

Final Moxie art and interactive personality; authored blog/project/advocacy/life/comedy content; continuous feed updates and durable stale cache; verified feeds for resource-only topics; live traffic adapter; comments; status monitoring; analytics; YouTube/Discord URLs. Third-party links can redirect, require sign-in, rate-limit, or block automated checks. Fixed-location weather is an hourly forecast, not a live observation. Open Graph artwork remains SVG, whose preview support varies between social platforms.

## Verification on September 22, 2026

- Production build passed. All 11 unit tests passed, covering the retained subnet calculator and RSS/Atom normalization, dates, deduplication, unsafe links/entities, partial failure, and complete failure.
- Headless Edge checks passed at 1440px desktop and 390px mobile widths. Checked routes, horizontal overflow, feed switching/collapse/Escape, theme persistence after reload, tool search/category/empty results, weather failure, and no-JavaScript source links. No JavaScript exceptions were observed. Screenshots in both themes and mobile were visually reviewed; encoding issues found during that review were corrected.
- A real NWS forecast displayed successfully. A blocked request also produced the explicit unavailable message.
- Temporary published Markdown fixtures verified blog/project routing, rendered body formatting, RSS inclusion, and draft exclusion. They were removed before the final build.
- Eight topics produced actual headlines: AI, Tech, Cybersecurity, Safety & Security, Weird Science, Music, World, and Disability / Accessibility. All configured RSS sources succeeded in the verified online build. The three resource-only topics do not pretend to have headlines.
- Read-only checks of the 19 external tool URLs returned 200 for 15; SecurityHeaders, DNS Checker, Lenovo, and Cloudflare Dashboard returned 403 to automated requests. Supplied URLs were retained; 403 is not proof a link is broken for a human browser. 511PA and NWS returned 200. The public homepage could not be retrieved through the web research tool, so this rebuild follows the supplied brief and inspected local implementation rather than a verified live-site comparison.
- Dependency audit reported zero vulnerabilities after compatible updates. Targeted source/public scans found no credential patterns or obsolete private contact addresses introduced by the rebuild. No remote Cloudflare settings or production deployment were verified or changed.
