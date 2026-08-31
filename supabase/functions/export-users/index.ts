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

    // Export auth.users with pagination
    const users: any[] = [];
    let page = 1;
    const perPage = 1000;
    let fetched = 0;

    do {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error('Error listing users:', error);
        return new Response(
          JSON.stringify({ error: `Failed to list users: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      fetched = data.users.length;
      users.push(...data.users);
      page++;
    } while (fetched === perPage);

    // Export profiles and roles from public schema
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error exporting profiles:', profilesError);
      return new Response(
        JSON.stringify({ error: `Failed to export profiles: ${profilesError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) {
      console.error('Error exporting roles:', rolesError);
      return new Response(
        JSON.stringify({ error: `Failed to export roles: ${rolesError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize user objects to remove sensitive/internal fields we cannot import anyway
    const sanitizedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      email_confirmed_at: u.email_confirmed_at,
      phone_confirmed_at: u.phone_confirmed_at,
      created_at: u.created_at,
      updated_at: u.updated_at,
      last_sign_in_at: u.last_sign_in_at,
      app_metadata: u.app_metadata,
      user_metadata: u.user_metadata,
      identities: u.identities,
      confirmation_sent_at: u.confirmation_sent_at,
      recovery_sent_at: u.recovery_sent_at,
      email_change_sent_at: u.email_change_sent_at,
      new_email: u.new_email,
      invited_at: u.invited_at,
      action_link: u.action_link,
    }));

    return new Response(
      JSON.stringify({
        ok: true,
        exported_at: new Date().toISOString(),
        counts: {
          users: sanitizedUsers.length,
          profiles: (profiles || []).length,
          roles: (roles || []).length,
        },
        data: {
          users: sanitizedUsers,
          profiles: profiles || [],
          user_roles: roles || [],
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in export-users function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
