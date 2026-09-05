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
 * Kto ma prawo wyslac powiadomienie.
 *
 * DLACZEGO TO ISTNIEJE: do 5 wrzesnia 2026 funkcja nie sprawdzala NICZEGO,
 * a `recipients` przychodzilo od wywolujacego. Kazdy w internecie mogl wyslac
 * list z adresu noreply@mojaserowarnia.pl do dowolnego adresata i z dowolna
 * trescia HTML. Domena jest w Resend zweryfikowana, wiec taki list wygladalby
 * calkowicie wiarygodnie, a odbudowa reputacji nadawcy trwa miesiacami.
 *
 * TRZY DROGI, bo jedna nie wystarczyla. Pierwsza wersja porownywala token
 * wylacznie ze zmienna SUPABASE_SERVICE_ROLE_KEY i alert dostal 403 mimo
 * poprawnego klucza w Vault (odkodowany token mial "role":"service_role").
 * Projekt ma wlaczony nowy system kluczy Supabase obok starego, wiec ciag
 * widziany przez funkcje nie musi byc tym samym ciagiem, ktory siedzi w Vault.
 * Dlatego doszlo sprawdzenie CZYNNOSCIOWE: token, ktory potrafi wywolac
 * auth.admin, jest kluczem serwisowym — niezaleznie od formatu i nazwy zmiennej.
 */
type Droga = "sekret_alertu" | "klucz_serwisowy" | "administrator" | null;

/** Odczytuje pole `role` z ladunku JWT bez weryfikacji podpisu. */
function rolaZTokenu(token: string): string | null {
  const czesci = token.split(".");
  if (czesci.length !== 3) return null;
  try {
    const pad = "=".repeat((4 - (czesci[1].length % 4)) % 4);
    const json = atob(czesci[1].replace(/-/g, "+").replace(/_/g, "/") + pad);
    return JSON.parse(json)?.role ?? null;
  } catch {
    return null;
  }
}

async function ktoWysyla(req: Request): Promise<Droga> {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  // 1) DEDYKOWANY SEKRET — wzorzec 1:1 z export-data (EXPORT_SECRET). Nie zalezy
  //    od zadnego systemu kluczy Supabase, wiec jest droga awaryjna, gdy dwie
  //    ponizsze zawioda po kolejnej zmianie po stronie platformy.
  const sekret = Deno.env.get("NOTIFY_SECRET");
  if (sekret && token === sekret) return "sekret_alertu";

  const url = Deno.env.get("SUPABASE_URL");
  if (!url) return null;
  const zeZmiennej = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // 2) KLUCZ SERWISOWY. Najpierw tanie porownanie ze zmienna, potem — gdy token
  //    tylko DEKLARUJE role serwisowa — jeden strzal do auth.admin, ktory jest
  //    dostepny wylacznie dla klucza serwisowego. Deklaracja z niepodpisanego
  //    ladunku niczego nie dowodzi, ale wystarcza, zeby nie wysylac tego
  //    zapytania przy kazdym smieciowym tokenie z internetu.
  if (zeZmiennej && token === zeZmiennej) return "klucz_serwisowy";

  if (rolaZTokenu(token) === "service_role" || token.startsWith("sb_secret_")) {
    try {
      const { error } = await createClient(url, token, {
        auth: { autoRefreshToken: false, persistSession: false },
      }).auth.admin.listUsers({ page: 1, perPage: 1 });
      if (!error) return "klucz_serwisowy";
      console.warn("send-notification: token deklaruje service_role, ale auth.admin odmawia:", error.message);
    } catch (e) {
      console.warn("send-notification: sprawdzenie czynnosciowe klucza nie powiodlo sie:", e);
    }
  }

  // 3) ZALOGOWANY ADMINISTRATOR — tak wola nas panel przez functions.invoke,
  //    ktore dolacza JWT sesji.
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!anon || !zeZmiennej) return null;

  const { data, error } = await createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).auth.getUser(token);
  if (error || !data.user) return null;

  const { data: rola } = await createClient(url, zeZmiennej, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  return rola ? "administrator" : null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const droga = await ktoWysyla(req);
    if (!droga) {
      // Log nazywa powod, zeby kolejne 403 nie wymagalo zgadywania — poprzednie
      // kosztowalo pol dnia, bo odpowiedz nie mowila, ktore sprawdzenie odpadlo.
      console.warn("send-notification: odmowa 403, zaden sposob uwierzytelnienia nie przeszedl");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }
    console.log(`send-notification: wpuszczono przez ${droga}`);

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
