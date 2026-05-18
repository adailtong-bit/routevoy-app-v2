import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

function extractDomain(url: string): string {
  if (!url) return 'Desconhecido';
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '')
  } catch (e) {
    return url;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const payload = await req.json()
    const { query, limit = 10, url } = payload

    const APIFY_API_KEY = Deno.env.get('APIFY_API_KEY') || 'apify_api_YJoWmr8wuxrtBHG0iHjqYTMflDdCBo3hRqDK'

    let extractedItems: any[] = [];

    if (url && url !== 'all') {
      const apifyUrl = `https://api.apify.com/v2/acts/apify~cheerio-scraper/run-sync-get-dataset-items?token=${APIFY_API_KEY}`
      
      const response = await fetch(apifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [{ url }],
          pageFunction: `async function pageFunction(context) {
            const $ = context.$;
            const title = $('title').text() || $('h1').first().text();
            const description = $('meta[name="description"]').attr('content') || '';
            const imageUrl = $('meta[property="og:image"]').attr('content') || '';
            
            const items = [];
            $('article, .card, [class*="product"], [class*="job"], [class*="offer"]').each((i, el) => {
               const itemTitle = $(el).find('h2, h3, .title').first().text().trim();
               const itemDesc = $(el).find('p, .description, .summary').first().text().trim();
               const itemLink = $(el).find('a').first().attr('href');
               const itemImg = $(el).find('img').first().attr('src');
               const price = $(el).find('[class*="price"]').first().text().trim();
               if(itemTitle && itemLink) {
                 items.push({
                   title: itemTitle,
                   description: itemDesc,
                   productLink: itemLink,
                   imageUrl: itemImg,
                   price: price,
                   storeName: new URL(context.request.url).hostname
                 });
               }
            });
            
            if(items.length > 0) return items;
            return [{ title, description, imageUrl, productLink: context.request.url }];
          }`,
          proxyConfiguration: { useApifyProxy: true }
        })
      });

      const data = await response.json();
      if(data && Array.isArray(data)) {
        data.forEach(d => {
          if(Array.isArray(d)) extractedItems.push(...d);
          else extractedItems.push(d);
        });
      }
    } else {
      const apifyUrl = `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=${APIFY_API_KEY}`
      
      const response = await fetch(apifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queries: [query || 'vagas oportunidades descontos'],
          resultsPerPage: limit,
          countryCode: 'br',
          languageCode: 'pt'
        })
      });

      const data = await response.json();
      
      if(data && Array.isArray(data)) {
        data.forEach((d: any) => {
          if(d.organicResults) {
            d.organicResults.forEach((r: any) => {
              extractedItems.push({
                title: r.title,
                description: r.description,
                productLink: r.url,
                storeName: r.displayedUrl,
                category: 'Geral',
                status: 'pending'
              });
            });
          }
        });
      }
    }

    const finalItems = extractedItems.slice(0, limit).map(item => {
      const titleClean = item.title ? item.title.substring(0, 100).toLowerCase().trim() : '';
      const cleanLink = (item.productLink || item.url || '').split('?')[0].trim();
      
      let hashNum = 0;
      const hashBase = `${cleanLink}|${titleClean}`;
      for (let i = 0; i < hashBase.length; i++) {
        hashNum = (hashNum << 5) - hashNum + hashBase.charCodeAt(i);
        hashNum = hashNum & hashNum;
      }
      const uniqueHash = `apify_${Math.abs(hashNum).toString(16)}`;

      return {
        title: item.title?.substring(0, 255) || 'Oferta sem título',
        description: item.description,
        product_link: item.productLink || item.url,
        image_url: item.imageUrl || null,
        store_name: item.storeName || extractDomain(item.productLink || item.url),
        category: item.category || 'Geral',
        status: 'pending',
        captured_at: new Date().toISOString(),
        unique_hash: uniqueHash,
        environment: 'production'
      }
    });

    let savedCount = 0;
    if (finalItems.length > 0) {
      const { data: saved, error } = await supabaseClient
        .from('discovered_promotions')
        .upsert(finalItems, { onConflict: 'unique_hash', ignoreDuplicates: true })
        .select();
        
      if (error) {
        console.error("Error inserting items:", error);
      } else {
        savedCount = saved?.length || 0;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        found: extractedItems.length,
        imported: savedCount,
        items: finalItems 
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
