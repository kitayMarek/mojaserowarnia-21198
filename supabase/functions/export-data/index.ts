import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tables to export from public schema, in a safe order respecting FK dependencies
const TABLES_TO_EXPORT = [
  'contact_attempts',
  'cultures',
  'price_history',
  'culture_audit_log',
  'culture_clicks',
  'feed_ingredients',
  'feed_recipes',
  'invoices',
  'llm_queries',
  'news_banners',
  'products',
  'profiles',
  'reactions',
  'sales_records',
  'serowarnie',
  'serowarnia_wpisy',
  'user_culture_lists',
  'user_culture_list_items',
  'user_roles',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const exportSecret = Deno.env.get('EXPORT_SECRET');
    if (!exportSecret) {
      return new Response(
        JSON.stringify({ error: 'EXPORT_SECRET not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const providedSecret = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (providedSecret !== exportSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const result: Record<string, unknown[]> = {};
    const counts: Record<string, number> = {};

    for (const table of TABLES_TO_EXPORT) {
      console.log(`Exporting table: ${table}`);
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.error(`Error exporting ${table}:`, error);
        return new Response(
          JSON.stringify({ error: `Failed to export ${table}: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result[table] = data || [];
      counts[table] = (data || []).length;
      console.log(`Exported ${counts[table]} rows from ${table}`);
    }

    return new Response(
      JSON.stringify({ ok: true, exported_at: new Date().toISOString(), counts, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in export-data function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
