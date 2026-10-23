/**
 * mojapasza.com: Worker przed plikami aplikacji z pasze/dist.
 *
 * Na etapie budowy (do przełączenia 1-5.12.2026) robi dwie rzeczy:
 *  1. www.mojapasza.com -> mojapasza.com (301), jeden adres serwisu,
 *  2. nagłówek X-Robots-Tag: noindex na każdej odpowiedzi, także na plikach
 *     JS i obrazkach, których meta robots w index.html nie obejmuje.
 * Resztę (adresy aplikacji, powrót do index.html) robi warstwa plików
 * (not_found_handling w pasze/wrangler.jsonc).
 *
 * Przy przełączeniu dojdą tu: zdjęcie noindex, mirrory dla botów, pomiar
 * wejść (kolumna serwis) i serwer /mcp. Plan: dokument „Pasze: wydzielenie
 * na osobną domenę” w Claude Docs.
 */
const DOMENA = 'mojapasza.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === `www.${DOMENA}`) {
      url.hostname = DOMENA;
      return Response.redirect(url.toString(), 301);
    }

    const odpowiedz = await env.ASSETS.fetch(request);
    const naglowki = new Headers(odpowiedz.headers);
    naglowki.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(odpowiedz.body, {
      status: odpowiedz.status,
      statusText: odpowiedz.statusText,
      headers: naglowki,
    });
  },
};
