import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { topics, type Source, type Topic } from '../data/newsSources';
export interface Article { title: string; source: string; published: string | null; url: string; description: string; topic: string }
const list = (value: any): any[] => value == null ? [] : Array.isArray(value) ? value : [value];
const plain = (value: any): string => String(typeof value === 'object' ? value?.['#text'] ?? '' : value ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
export function safeUrl(value: string, base: string): string | null {
  try { const url = new URL(value, base); if (!['http:', 'https:'].includes(url.protocol)) return null; url.hash = ''; for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key); return url.href; } catch { return null; }
}
export function parseFeed(xml: string, source: Source, topic: string): Article[] {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) throw new Error('Invalid feed');
  const data = new XMLParser({ignoreAttributes: false, parseTagValue: false}).parse(xml);
  if (!data.rss && !data.feed && !data['rdf:RDF']) throw new Error('Not an RSS or Atom feed');
  const entries = list(data.rss?.channel?.item ?? data.feed?.entry ?? data['rdf:RDF']?.item);
  return entries.slice(0, 80).flatMap((item): Article[] => {
    const link = list(item.link).find(l => typeof l === 'string' || !l['@_rel'] || l['@_rel'] === 'alternate');
    const raw = typeof link === 'string' ? link : link?.['@_href'] ?? link?.['#text'];
    const url = raw ? safeUrl(raw, source.url) : null;
    const title = plain(item.title).slice(0, 240);
    const date = Date.parse(item.pubDate ?? item.published ?? item.updated ?? item['dc:date']);
    if (!url || !title) return [];
    return [{title, source: source.name, published: Number.isFinite(date) ? new Date(date).toISOString() : null, url, description: plain(item.description ?? item.summary ?? item.content).slice(0, 260), topic}];
  });
}
export function normalize(items: Article[]): Article[] {
  const urls = new Set<string>(); const titles = new Set<string>();
  return [...items].sort((a,b) => (Date.parse(b.published ?? '') || 0) - (Date.parse(a.published ?? '') || 0)).filter(item => {
    const title = item.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    if (urls.has(item.url) || titles.has(title)) return false;
    urls.add(item.url); titles.add(title); return true;
  }).slice(0, 16);
}
export async function aggregateTopic(topic: Topic, fetcher: typeof fetch = fetch) {
  const results = await Promise.all(topic.sources.filter(s => s.url).map(async source => {
    try {
      const response = await fetcher(source.url, {signal: AbortSignal.timeout(7000), headers: {'User-Agent':'FailSoftLabs/1.0 (+https://failsoftlabs.com)', Accept:'application/rss+xml, application/atom+xml, application/xml, text/xml'}});
      if (!response.ok) throw new Error('Source unavailable');
      const xml = await response.text();
      if (xml.length > 2_000_000) throw new Error('Feed too large');
      return {items: parseFeed(xml, source, topic.id), failed: false};
    } catch { return {items: [] as Article[], failed: true}; }
  }));
  return {id: topic.id, items: normalize(results.flatMap(r => topic.perSourceLimit ? normalize(r.items).slice(0, topic.perSourceLimit) : r.items)), failedSources: results.filter(r => r.failed).length};
}
// Build-process cache: homepage and JSON share one bounded fetch per source.
let snapshot: ReturnType<typeof collect> | undefined;
async function collect() { return {generated: new Date().toISOString(), topics: await Promise.all(topics.map(t => aggregateTopic(t)))}; }
export function getNews() { return snapshot ??= collect(); }
