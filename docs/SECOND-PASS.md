# Second-pass refinement

Preserved the existing Astro design and static deployment configuration. No Git remote, DNS, Cloudflare or Worker configuration was changed.

Local news previously had an empty RSS URL. LehighValleyNews.com now redirects to Lehigh Valley Public Media; the old /index.rss returns 404. Use the publisher's working https://www.lehighvalleypublicmedia.org/news/rss/ feed. Headlines are fetched at build time, attributed, and link to the publisher. Failure states and direct source links remain; rebuild to refresh headlines.

Digital Safety & Security uses FTC Consumer Advice's consumer feed, listed by https://www.ftc.gov/news-events/stay-connected/ftc-rss-feeds . Its practical fraud/privacy/account-safety coverage is separate from the enterprise-oriented security tile. Editorial coverage varies by publication; no invented headlines.

Life uses the supplied 152px Spotify player, a direct playlist fallback, and Instagram profile link. A live Instagram feed needs a supported authorized integration or selected public post embeds; no credentials were requested or embedded. Facebook uses a direct public page card; a future supported Page plugin can replace that reserved area if Meta permits it. Neither integration is required for navigation.

Moxie space is reserved in the banner, by the toolbox, and in the existing corner for gremlins/signs. No images generated.

Blog routes and RSS removed. Original unused template files are retained in ignored .second-pass-backup. Projects and legacy notes URLs redirect to Lab; project detail content lives under Lab. Advocacy retains its existing content with only the dead Blog link removed.

Validation: npm run build, all 11 unit tests, and npm run test:browser passed. Additional browser checks verified external/internal link behavior across generated pages, internal destinations, removed Blog/RSS routes, legacy redirects, navigation, and Life/Lab widths of 390/768/1440px. Dark/light/mobile screenshots reviewed. Local feed returned 15 headlines and FTC 10 without failures. Spotify player loaded the FSL Radio playlist; audio playback was not exercised. No lint script is configured.
