import { getNews } from '../lib/news';
export async function GET() { return new Response(JSON.stringify(await getNews()), {headers: {'Content-Type':'application/json'}}); }
