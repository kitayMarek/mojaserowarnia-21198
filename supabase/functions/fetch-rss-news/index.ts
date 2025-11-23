import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  imageUrl?: string;
}

interface RSSSource {
  url: string;
  name: string;
  source: string;
}

const RSS_SOURCES: RSSSource[] = [
  { url: 'https://www.farmer.pl/rss/', name: 'Farmer.pl', source: 'rss_farmer' },
  { url: 'https://www.agropolska.pl/rss/', name: 'Agropolska.pl', source: 'rss_agropolska' },
  { url: 'https://www.portalspozywczy.pl/rss/', name: 'Portal Spożywczy', source: 'rss_portalspozywczy' },
];

const KEYWORDS = ['ser', 'sery', 'serownia', 'mleko', 'przetwórstwo mleka', 'twaróg', 'produkcja serów', 'mleczarstwo'];

function containsKeyword(text: string): boolean {
  const lowerText = text.toLowerCase();
  return KEYWORDS.some(keyword => lowerText.includes(keyword));
}

function extractImageUrl(description: string): string | null {
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = description.match(imgRegex);
  return match ? match[1] : null;
}

async function fetchRSSFeed(rssSource: RSSSource): Promise<RSSItem[]> {
  try {
    console.log(`Fetching RSS from ${rssSource.name}...`);
    const response = await fetch(rssSource.url);
    
    if (!response.ok) {
      console.error(`Failed to fetch ${rssSource.name}: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    const feed = await parseFeed(xmlText);

    if (!feed || !feed.entries) {
      console.error(`Failed to parse feed from ${rssSource.name}`);
      return [];
    }

    const items: RSSItem[] = [];

    for (const entry of feed.entries) {
      const title = entry.title?.value || '';
      const description = entry.description?.value || '';
      const link = entry.links?.[0]?.href || '';
      
      if (!title || !link) continue;

      // Check if title or description contains keywords
      if (!containsKeyword(title) && !containsKeyword(description)) {
        continue;
      }

      const pubDate = entry.published?.toString() || new Date().toISOString();
      const imageUrl = extractImageUrl(description) || 
                      entry.attachments?.[0]?.url ||
                      undefined;

      items.push({
        title: title.trim(),
        description: description.replace(/<[^>]*>/g, '').trim().substring(0, 200),
        link: link.trim(),
        pubDate,
        imageUrl,
      });
    }

    console.log(`Found ${items.length} relevant items from ${rssSource.name}`);
    return items;
  } catch (error) {
    console.error(`Error fetching RSS from ${rssSource.name}:`, error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let allItems: (RSSItem & { source: string })[] = [];

    // Fetch from all RSS sources
    for (const rssSource of RSS_SOURCES) {
      const items = await fetchRSSFeed(rssSource);
      allItems = allItems.concat(
        items.map(item => ({ ...item, source: rssSource.source }))
      );
    }

    console.log(`Total items found: ${allItems.length}`);

    let addedCount = 0;
    let duplicateCount = 0;

    // Process each item
    for (const item of allItems) {
      // Check if news already exists
      const { data: existing } = await supabase
        .from('news_banners')
        .select('id')
        .eq('link_url', item.link)
        .maybeSingle();

      if (existing) {
        duplicateCount++;
        continue;
      }

      // Parse date
      let newsDate = new Date().toISOString().split('T')[0];
      try {
        const parsedDate = new Date(item.pubDate);
        if (!isNaN(parsedDate.getTime())) {
          newsDate = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }

      // Insert new news item
      const { error } = await supabase
        .from('news_banners')
        .insert({
          title: item.title,
          subtitle: item.description || null,
          link_url: item.link,
          image_url: item.imageUrl || null,
          date: newsDate,
          type: 'archive',
          is_published: true,
          source: item.source,
        });

      if (error) {
        console.error('Error inserting news:', error);
      } else {
        addedCount++;
      }
    }

    const result = {
      success: true,
      total_found: allItems.length,
      added: addedCount,
      duplicates: duplicateCount,
      sources: RSS_SOURCES.map(s => s.name),
    };

    console.log('RSS fetch completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-rss-news function:', error);
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
