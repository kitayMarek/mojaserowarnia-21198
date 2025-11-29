import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const staticPages = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/baza-kultur', priority: 0.9, changefreq: 'weekly' },
  { path: '/przepisy', priority: 0.8, changefreq: 'weekly' },
  { path: '/poradniki', priority: 0.8, changefreq: 'weekly' },
  { path: '/wiadomosci', priority: 0.8, changefreq: 'daily' },
  { path: '/kontakt', priority: 0.7, changefreq: 'monthly' },
  { path: '/poradnik', priority: 0.7, changefreq: 'monthly' },
  { path: '/narzedzia', priority: 0.7, changefreq: 'monthly' },
  { path: '/prawo', priority: 0.7, changefreq: 'monthly' },
  { path: '/bakterie-kultury', priority: 0.6, changefreq: 'monthly' },
  { path: '/porownywarka-kultur', priority: 0.6, changefreq: 'monthly' },
  { path: '/sila-podpuszczki', priority: 0.6, changefreq: 'monthly' },
  { path: '/gdzie-kupic-podpuszczke', priority: 0.6, changefreq: 'monthly' },
  { path: '/kalkulator-miar', priority: 0.6, changefreq: 'monthly' },
  { path: '/kalkulator-beaugel', priority: 0.6, changefreq: 'monthly' },
  { path: '/kalkulator-kosztu-sera', priority: 0.6, changefreq: 'monthly' },
  { path: '/kalkulator-pasz', priority: 0.6, changefreq: 'monthly' },
  { path: '/porowranie-wartosci-odzywczych', priority: 0.6, changefreq: 'monthly' },
  { path: '/prawo/rhd', priority: 0.6, changefreq: 'monthly' },
  { path: '/prawo/rhd/dokumenty', priority: 0.5, changefreq: 'monthly' },
  { path: '/prawo/mol', priority: 0.6, changefreq: 'monthly' },
  { path: '/prawo/mol/dokumenty', priority: 0.5, changefreq: 'monthly' },
  { path: '/prawo/akty-prawne-ue', priority: 0.5, changefreq: 'monthly' },
  { path: '/prawo/rzeznia-rolnicza', priority: 0.5, changefreq: 'monthly' },
  { path: '/prawo/system-ewidencji', priority: 0.5, changefreq: 'monthly' },
  { path: '/nota-prawna', priority: 0.3, changefreq: 'yearly' },
];

const recipes = ['asiago', 'caciotta', 'dunlop', 'feta-bulgarska', 'yorkshire'];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting sitemap generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published news from database
    const { data: news, error } = await supabase
      .from('news_banners')
      .select('link_url, updated_at')
      .eq('is_published', true)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
    }

    console.log(`Fetched ${news?.length || 0} news items`);

    const currentDate = new Date().toISOString().split('T')[0];

    // Build XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>https://mojaserowarnia.pl${page.path}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add recipe pages
    for (const recipeId of recipes) {
      xml += '  <url>\n';
      xml += `    <loc>https://mojaserowarnia.pl/przepisy/${recipeId}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    }

    // Add news from database with actual updated dates
    if (news && news.length > 0) {
      for (const item of news) {
        // Skip if link_url is not a valid path
        if (!item.link_url || item.link_url.startsWith('http')) {
          continue;
        }

        const lastmod = item.updated_at 
          ? new Date(item.updated_at).toISOString().split('T')[0]
          : currentDate;

        xml += '  <url>\n';
        xml += `    <loc>https://mojaserowarnia.pl${item.link_url}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';

    console.log('Sitemap generated successfully');

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
