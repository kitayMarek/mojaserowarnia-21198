import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Static recipes data
const recipes = [
  {
    id: 'asiago',
    name: 'Asiago',
    description: 'Asiago to tradycyjny ser alpejski z regionu Veneto we Włoszech. Młody Asiago dolce ma delikatny, słodkawy smak i miękką konsystencję, podczas gdy dojrzały Asiago pressato jest twardszy z wyraźnym, pikantnym smakiem.',
    image: 'https://mojaserowarnia.pl/asiago.jpg',
  },
  {
    id: 'dunlop',
    name: 'Dunlop',
    description: 'Dunlop to tradycyjny szkocki ser, podobny do cheddara, ale o łagodniejszym smaku i bardziej wilgotnej strukturze. Idealny dla początkujących serowarów.',
    image: 'https://mojaserowarnia.pl/dunlop.jpg',
  },
  {
    id: 'feta-bulgarska',
    name: 'Feta Bułgarska (Sirene)',
    description: 'Autentyczna feta bułgarska (Sirene) to biały ser solankowy o kremowej konsystencji i słonym, lekko kwaskowym smaku. Idealny do sałatek i dań śródziemnomorskich.',
    image: 'https://mojaserowarnia.pl/feta-bulgarska.jpg',
  },
  {
    id: 'yorkshire',
    name: 'Yorkshire (Wensleydale)',
    description: 'Yorkshire (Wensleydale) to tradycyjny angielski ser o delikatnej, kruchej strukturze i łagodnym, słodkawym smaku z nutą miodu. Doskonale komponuje się z owocami.',
    image: 'https://mojaserowarnia.pl/yorkshire.jpg',
  },
  {
    id: 'caciotta',
    name: 'Caciotta',
    description: 'Caciotta to wszechstronny włoski ser półtwardy o delikatnym, mlecznym smaku i gładkiej konsystencji. Doskonały zarówno jako ser stołowy, jak i do gotowania.',
    image: 'https://mojaserowarnia.pl/caciotta.jpg',
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published news from database
    const { data: news, error } = await supabase
      .from('news_banners')
      .select('*')
      .eq('is_published', true)
      .order('date', { ascending: false })
      .limit(45);

    if (error) {
      console.error('Error fetching news:', error);
      throw error;
    }

    const baseUrl = 'https://mojaserowarnia.pl';
    const rssUrl = `${supabaseUrl}/functions/v1/generate-rss`;
    const buildDate = new Date().toUTCString();

    // Build RSS items
    const items: Array<{ date: Date; xml: string }> = [];

    // Add recipe items
    recipes.forEach(recipe => {
      items.push({
        date: new Date(), // Recipes use current date
        xml: `    <item>
      <title>Przepis: ${recipe.name}</title>
      <link>${baseUrl}/przepisy/${recipe.id}</link>
      <description>${escapeXml(recipe.description)}</description>
      <guid isPermaLink="true">${baseUrl}/przepisy/${recipe.id}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <category>Przepisy</category>
      <enclosure url="${recipe.image}" type="image/jpeg"/>
    </item>`
      });
    });

    // Add news items
    news?.forEach(item => {
      const pubDate = new Date(item.date);
      items.push({
        date: pubDate,
        xml: `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link_url)}</link>
      <description>${escapeXml(item.subtitle || item.title)}</description>
      <guid isPermaLink="false">${item.id}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <category>Wiadomości</category>${item.image_url ? `
      <enclosure url="${escapeXml(item.image_url)}" type="image/jpeg"/>` : ''}
    </item>`
      });
    });

    // Sort all items by date (newest first) and limit to 50
    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    const limitedItems = items.slice(0, 50);

    // Generate RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Moja Serowarnia - Przepisy i Wiadomości</title>
    <link>${baseUrl}</link>
    <description>Portal dla serowarów - przepisy na domowe sery, baza kultur bakteryjnych, poradniki i aktualności ze świata serowarstwa</description>
    <language>pl-PL</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${rssUrl}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/og-image.png</url>
      <title>Moja Serowarnia</title>
      <link>${baseUrl}</link>
    </image>
${limitedItems.map(item => item.xml).join('\n')}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating RSS:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate RSS feed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
