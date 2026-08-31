import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get('authorization') || '';
    const providedToken = authHeader.replace(/^Bearer\s+/i, '').trim();

    // Allow either EXPORT_SECRET or an admin JWT
    let isAdmin = false;
    if (providedToken === exportSecret) {
      isAdmin = true;
    } else if (providedToken) {
      const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: userData, error: userError } = await anonClient.auth.getUser(providedToken);
      if (!userError && userData.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userData.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        if (roleData) isAdmin = true;
      }
    }

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return new Response(
        JSON.stringify({ error: `Failed to list buckets: ${bucketsError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: Record<string, any[]> = {};

    for (const bucket of buckets || []) {
      const bucketName = bucket.name;
      console.log(`Exporting bucket: ${bucketName}`);

      const files: any[] = [];

      // List all objects recursively (handles nested folders)
      const { data: objects, error: listError } = await supabase.storage.from(bucketName).list('', {
        limit: 1000,
        offset: 0,
        recursive: true,
      });

      if (listError) {
        console.error(`Error listing objects in ${bucketName}:`, listError);
        return new Response(
          JSON.stringify({ error: `Failed to list objects in ${bucketName}: ${listError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      for (const obj of objects || []) {
        if (!obj.id) continue; // skip folder placeholders

        const { data: fileData, error: downloadError } = await supabase.storage
          .from(bucketName)
          .download(obj.name);

        if (downloadError) {
          console.error(`Error downloading ${bucketName}/${obj.name}:`, downloadError);
          return new Response(
            JSON.stringify({ error: `Failed to download ${bucketName}/${obj.name}: ${downloadError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const bytes = await fileData.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));

        files.push({
          name: obj.name,
          content_type: fileData.type || obj.metadata?.mimetype || 'application/octet-stream',
          size: obj.metadata?.size || bytes.byteLength,
          base64,
        });
      }

      result[bucketName] = files;
      console.log(`Exported ${files.length} files from ${bucketName}`);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        exported_at: new Date().toISOString(),
        counts: Object.fromEntries(Object.entries(result).map(([k, v]) => [k, v.length])),
        data: result,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in export-storage function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
