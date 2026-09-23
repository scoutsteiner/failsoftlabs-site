# Fail Soft Labs

A compact personal command center: news, public troubleshooting tools, social links and music, and room to tinker. Astro, static output, and the existing GitHub/Cloudflare deployment relationship.

## Run locally

```sh
npm ci
npm run dev
```

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

## Verify

```sh
npm run build
npm test
npm run preview -- --host 127.0.0.1
# In a second terminal (Microsoft Edge required):
npm run test:browser
```

Build output: `dist/`. No lint script is configured. News is fetched at build time and gracefully degrades when sources are unavailable. The homepage labels its snapshot time; rebuild to refresh.

## Edit

- Tools: `src/data/tools.ts`
- News topics and sources: `src/data/newsSources.ts`
- Contact, socials, navigation: `src/data/site.ts`
- Lab project Markdown: `src/content/projects/` (published under `/lab/`)
- Moxie placeholder: `src/pages/index.astro`
- Theme/layout: `src/styles/global.css`

[Original rebuild report](docs/REBUILD.md) records the first pass. See [Second-pass changes and integration notes](docs/SECOND-PASS.md) for the current navigation, feeds, and social integrations.

Everything is public. Keep credentials, internal URLs, private infrastructure, and personal live-location information out of content and configuration. No API keys are required for this first pass. No production deployment or infrastructure changes were performed.
