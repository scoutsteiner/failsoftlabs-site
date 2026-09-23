import {describe,it,expect} from 'vitest';
import {parseFeed,normalize,aggregateTopic,safeUrl} from '../lib/news';
const source={name:'Example',url:'https://example.org/feed',home:'https://example.org'};
const rss='<rss><channel><item><title>Example &amp; test</title><link>https://example.org/a?utm_source=rss</link><pubDate>Tue, 22 Sep 2026 10:00:00 GMT</pubDate><description><![CDATA[<p>Text only</p>]]></description></item></channel></rss>';
describe('news boundary',()=>{
 it('normalizes RSS, dates, attribution, tracking URLs, and plain text',()=>{const [a]=parseFeed(rss,source,'tech');expect(a).toMatchObject({title:'Example & test',url:'https://example.org/a',published:'2026-09-22T10:00:00.000Z',description:'Text only',source:'Example',topic:'tech'});});
 it('handles Atom links and missing dates',()=>{expect(parseFeed('<feed><entry><title>Atom</title><link rel="self" href="/feed/1"/><link rel="alternate" href="/article"/></entry></feed>',source,'tech')[0]).toMatchObject({url:'https://example.org/article',published:null});});
 it('rejects executable links and XML entities',()=>{expect(safeUrl('javascript:alert(1)',source.url)).toBeNull();expect(()=>parseFeed('<!DOCTYPE rss [<!ENTITY a "secret">]><rss/>',source,'tech')).toThrow();expect(()=>parseFeed('<html/>',source,'tech')).toThrow();});
 it('deduplicates stories and sorts newest first, undated last',()=>{const [a]=parseFeed(rss,source,'tech');const newer={...a,title:'Newer',url:'https://example.org/b',published:'2026-09-23T00:00:00Z'};expect(normalize([a,{...a,url:'https://example.org/duplicate'},newer,{...a,title:'Undated',url:'https://example.org/c',published:null}]).map(x=>x.title)).toEqual(['Newer','Example & test','Undated']);});
 it('preserves good sources when another fails',async()=>{const result=await aggregateTopic({id:'tech',name:'Tech',hint:'',sources:[source,{...source,url:'https://broken.example/feed'}]},async(input)=>{if(String(input).includes('broken'))throw new Error('offline');return new Response(rss);});expect(result.failedSources).toBe(1);expect(result.items).toHaveLength(1);});
 it('returns an honest empty result when every source fails',async()=>{const result=await aggregateTopic({id:'tech',name:'Tech',hint:'',sources:[source]},async()=>new Response('',{status:503}));expect(result.items).toEqual([]);expect(result.failedSources).toBe(1);});
});
