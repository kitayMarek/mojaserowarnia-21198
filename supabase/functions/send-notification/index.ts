import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
// Wysyłka do wielu odbiorców wymaga zweryfikowanej domeny w Resend
// (mojaserowarnia.pl ma status Verified). RESEND_FROM pozwala nadpisać adres.
const FROM_ADDRESS = Deno.env.get("RESEND_FROM") || "noreply@mojaserowarnia.pl";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  recipients: string[];
  subject: string;
  message: string;
}

/**
 * Ucieczka znaków HTML. Treść wiadomości trafia do szablonu przez interpolację,
 * więc bez tego nadawca mógłby wstrzyknąć dowolny HTML — łącznie z linkami —
 * w list wychodzący z zweryfikowanej domeny mojaserowarnia.pl. To jest różnica
 * między otwartym przekaźnikiem a gotowym narzędziem do phishingu.
 * Szablon ma `white-space: pre-wrap`, więc formatowanie tekstu nie ucierpi.
 */
function bezHtml(tekst: string): string {
  return String(tekst)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Kto ma prawo wysłać powiadomienie. Wzorzec 1:1 z export-data: albo wywołanie
 * serwer-serwer kluczem service_role, albo zalogowany administrator.
 *
 * DLACZEGO TO ISTNIEJE: do 5 września 2026 funkcja nie sprawdzała NICZEGO,
 * a `recipients` przychodziło od wywołującego. Każdy w internecie mógł wysłać
 * list z adresu noreply@mojaserowarnia.pl do dowolnego adresata i z dowolną
 * treścią HTML. Domena jest w Resend zweryfikowana, więc taki list wyglądałby
 * całkowicie wiarygodnie, a odbudowa reputacji nadawcy trwa miesiącami.
 */
async function wolnoWysylac(req: Request): Promise<boolean> {
  const naglowek = req.headers.get("authorization") ?? "";
  const token = naglowek.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  const kluczSerwisowy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (kluczSerwisowy && token === kluczSerwisowy) return true;   // cron, zadania w tle

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon || !kluczSerwisowy) return false;

  const { data, error } = await createClient(url, anon).auth.getUser(token);
  if (error || !data.user) return false;

  const { data: rola } = await createClient(url, kluczSerwisowy)
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  return Boolean(rola);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!(await wolnoWysylac(req))) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const { recipients, subject, message }: NotificationRequest = await req.json();

    if (!recipients || recipients.length === 0) {
      throw new Error("No recipients provided");
    }

    if (!subject || !message) {
      throw new Error("Subject and message are required");
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    const results = [];
    for (const batch of batches) {
      const promises = batch.map((email) =>
        resend.emails.send({
          from: `Moja Serowarnia <${FROM_ADDRESS}>`,
          to: [email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">${bezHtml(subject)}</h2>
              <div style="white-space: pre-wrap; color: #555; line-height: 1.6;">
                ${bezHtml(message)}
              </div>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #888;">
                Otrzymujesz tę wiadomość, ponieważ wyraziłeś zgodę na otrzymywanie powiadomień.
                Jeśli chcesz zrezygnować z powiadomień, możesz zaktualizować swoje ustawienia w panelu użytkownika.
              </p>
            </div>
          `,
        })
      );

      const batchResults = await Promise.allSettled(promises);
      results.push(...batchResults);
    }

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`Notification sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
