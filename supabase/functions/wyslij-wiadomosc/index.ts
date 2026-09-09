// Wysylka wiadomosci do osob, ktore wyrazily zgode.
//
// ─────────────────────────────────────────────────────────────────────────────
// TRZY ZABEZPIECZENIA, KAZDE PRZED INNYM BLEDEM
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. KLUCZ. Funkcja odpowiada tylko na zadanie z naglowkiem x-klucz-wysylki
//    zgodnym z sekretem KLUCZ_WYSYLKI. Bez tego kazdy, kto zna adres funkcji,
//    moglby uruchomic wysylke do wszystkich.
//
// 2. DOMYSLNIE PODGLAD. Zadanie bez akcji "wyslij" NICZEGO nie wysyla — oddaje
//    liczbe adresow i gotowa tresc jednego egzemplarza. Zeby wyslac, trzeba
//    poprosic o to wprost.
//
// 3. PRZEPISANIE TYTULU. Wysylka wymaga pola "potwierdzenie" rownego tytulowi
//    wiadomosci, co do znaku. Nie da sie tego zrobic przez pomylke ani przez
//    powtorzenie polecenia z historii powloki.
//
// ─────────────────────────────────────────────────────────────────────────────
// ZASADY, KTORE MUSZA ZOSTAC
// ─────────────────────────────────────────────────────────────────────────────
//  • JEDNA WIADOMOSC = JEDEN ODBIORCA. Nigdy wspolne "do" ani kopia: to jest
//    najczestszy sposob, w jaki wycieka cala lista adresow.
//  • KAZDY EGZEMPLARZ MA WLASNY ODNOSNIK DO WYPISANIA, zbudowany z tokenu tej
//    osoby. Bez niego nie wolno wyslac ani jednej wiadomosci — obiecalismy
//    w tresci zgody, ze mozna ja wycofac w kazdej chwili.
//  • TRESC BIERZEMY Z news_banners. Ten sam tekst stoi na stronie glownej
//    i w kanale RSS. Trzy kanaly, jedno zrodlo — inaczej rozjada sie po
//    pierwszej poprawce.
//  • KAZDA WYSYLKA ZAPISANA. Przerwana wysylka daje sie wznowic, bo dziennik
//    odsiewa tych, ktorzy juz dostali.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const FROM = Deno.env.get("RESEND_FROM") || "noreply@mojaserowarnia.pl";
const KLUCZ = Deno.env.get("KLUCZ_WYSYLKI");
const BAZA = "https://mojaserowarnia.pl";

const naglowki = { "Content-Type": "application/json; charset=utf-8" };
const odpowiedz = (dane: unknown, kod = 200) =>
  new Response(JSON.stringify(dane, null, 2), { status: kod, headers: naglowki });

/** Zamiana znakow, ktore w HTML znacza co innego, niz wygladaja. */
const bezpieczny = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function zloz(tytul: string, tresc: string, token: string) {
  const wypis = BAZA + "/wypisz?t=" + token;

  const tekst =
    tytul + "\n\n" + tresc + "\n\n" +
    "—\nMoja Serowarnia — mojaserowarnia.pl\n" +
    "Dostajesz tę wiadomość, bo przy zakładaniu konta wyraziłeś/aś zgodę.\n" +
    "Nie chcesz więcej? Wypisz się jednym kliknięciem: " + wypis + "\n";

  const html =
    '<div style="max-width:38em;margin:0 auto;font:16px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#1c1917">' +
    '<h1 style="font-size:1.3em;line-height:1.35;margin:0 0 .8em">' + bezpieczny(tytul) + "</h1>" +
    '<p style="margin:0 0 1.2em">' + bezpieczny(tresc) + "</p>" +
    '<hr style="border:0;border-top:1px solid #e7e5e4;margin:2em 0 1em">' +
    '<p style="font-size:.85em;color:#78716c;margin:0">' +
    'Moja Serowarnia — <a href="' + BAZA + '" style="color:#78716c">mojaserowarnia.pl</a><br>' +
    "Dostajesz tę wiadomość, bo przy zakładaniu konta wyraziłeś/aś zgodę.<br>" +
    '<a href="' + wypis + '" style="color:#78716c">Wypisz się jednym kliknięciem</a>' +
    "</p></div>";

  return { tekst, html };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: naglowki });

  try {
    if (!KLUCZ || request.headers.get("x-klucz-wysylki") !== KLUCZ) {
      return odpowiedz({ blad: "brak uprawnien" }, 401);
    }

    const { wiadomosc_id, akcja = "podglad", potwierdzenie, tylko_email } =
      await request.json();
    if (!wiadomosc_id) return odpowiedz({ blad: "brakuje wiadomosc_id" }, 400);

    const baza = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: wiadomosc, error: bladW } = await baza
      .from("news_banners")
      .select("id, title, subtitle, is_published")
      .eq("id", wiadomosc_id)
      .single();
    if (bladW || !wiadomosc) return odpowiedz({ blad: "nie ma takiej wiadomosci" }, 404);
    if (!wiadomosc.is_published) return odpowiedz({ blad: "wiadomosc nieopublikowana" }, 400);
    if (!wiadomosc.subtitle) return odpowiedz({ blad: "wiadomosc nie ma tresci" }, 400);

    const { data: odbiorcy, error: bladL } = await baza.rpc("lista_do_wysylki_dla", {
      _wiadomosc: wiadomosc_id,
    });
    if (bladL) return odpowiedz({ blad: bladL.message }, 500);

    const wszyscy = (odbiorcy ?? []) as Array<
      { profil_id: string; email: string; wypis_token: string }
    >;

    // PRÓBA NA JEDNYM ADRESIE. Pierwszy list zawsze warto zobaczyc we wlasnej
    // skrzynce, zanim zobaczy go dwadziescia osob: dopiero tam widac, jak
    // klient poczty polamal uklad i czy odnosnik do wypisania dziala.
    //
    // ⚠ Zawezenie, nie obejscie: adres MUSI juz byc na liscie uprawnionych.
    // Tego pola nie da sie uzyc do wyslania czegokolwiek komus, kto nie wyrazil
    // zgody — i tak ma zostac.
    const lista = tylko_email
      ? wszyscy.filter((o) => o.email.toLowerCase() === String(tylko_email).toLowerCase())
      : wszyscy;

    // ─── PODGLAD ────────────────────────────────────────────────────────────
    if (akcja !== "wyslij") {
      const przyklad = zloz(wiadomosc.title, wiadomosc.subtitle, "PRZYKLADOWY-TOKEN");
      return odpowiedz({
        tryb: "podglad — NIC NIE WYSLANO",
        tytul: wiadomosc.title,
        adresow_do_wyslania: lista.length,
        adresow_uprawnionych_lacznie: wszyscy.length,
        // Adresow nie zwracamy. Do decyzji wystarczy ich liczba, a wypisanie
        // ich tutaj przenosiloby cala liste do logow.
        tresc_tekstowa: przyklad.tekst,
        zeby_wyslac: { akcja: "wyslij", potwierdzenie: wiadomosc.title },
      });
    }

    if (potwierdzenie !== wiadomosc.title) {
      return odpowiedz({
        blad: "potwierdzenie musi byc dokladnym tytulem wiadomosci",
        oczekiwano: wiadomosc.title,
      }, 400);
    }

    // Pusta lista SPRAWDZANA PO POTWIERDZENIU, nie przed.
    //
    // Dwa powody. Po pierwsze kolejnosc jest sensowniejsza: najpierw upewniamy
    // sie, ze czlowiek naprawde chce wyslac TE wiadomosc, a dopiero potem
    // marudzimy o odbiorcach.
    //
    // Po drugie — i to jest wazniejsze — dzieki temu da sie sprawdzic samo
    // potwierdzenie BEZ WYSYLANIA CZEGOKOLWIEK: wystarczy podac tylko_email
    // z adresem, ktorego na liscie nie ma. Jesli w odpowiedzi jest "ten adres
    // nie jest na liscie", to znaczy, ze potwierdzenie przeszlo. Wczesniej ten
    // warunek stal wyzej i zaslanial wynik, wiec jedynym sposobem sprawdzenia
    // potwierdzenia bylo wyslanie prawdziwego listu.
    if (lista.length === 0) {
      return odpowiedz({
        blad: tylko_email
          ? "ten adres nie jest na liscie uprawnionych albo juz dostal te wiadomosc"
          : "nikomu nie trzeba juz wysylac tej wiadomosci",
        adres: tylko_email ? String(tylko_email) : undefined,
      }, 400);
    }

    // ─── WYSYLKA ────────────────────────────────────────────────────────────
    // Po kolei, nie rownolegle: kilkadziesiat adresow nie potrzebuje pospiechu,
    // a dostawca poczty latwiej znosi rowny strumien niz zryw.
    let wyslane = 0;
    const bledy: Array<{ email: string; powod: string }> = [];

    for (const osoba of lista) {
      const { tekst, html } = zloz(wiadomosc.title, wiadomosc.subtitle, osoba.wypis_token);
      try {
        const { error } = await resend.emails.send({
          from: "Moja Serowarnia <" + FROM + ">",
          to: [osoba.email], // jeden odbiorca na wiadomosc, zawsze
          subject: wiadomosc.title,
          text: tekst,
          html,
          headers: {
            // Wypisanie sie prosto z klienta poczty, bez wchodzenia na strone.
            "List-Unsubscribe": "<" + BAZA + "/wypisz?t=" + osoba.wypis_token + ">",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
        if (error) throw new Error(error.message);

        await baza.from("wysylki").insert({
          wiadomosc_id, profil_id: osoba.profil_id, status: "wyslane",
        });
        wyslane++;
      } catch (e) {
        const powod = e instanceof Error ? e.message : String(e);
        // Adres skrocony: dosc, zeby rozpoznac, za malo, zeby byla to lista.
        bledy.push({ email: osoba.email.replace(/(.).*(@.*)/, "$1***$2"), powod });
        await baza.from("wysylki").insert({
          wiadomosc_id, profil_id: osoba.profil_id, status: "blad",
          szczegoly: powod.slice(0, 500),
        });
      }
      await new Promise((r) => setTimeout(r, 250));
    }

    return odpowiedz({
      tryb: "wyslano",
      tytul: wiadomosc.title,
      wyslane,
      bledow: bledy.length,
      bledy,
    });
  } catch (e) {
    return odpowiedz({ blad: e instanceof Error ? e.message : String(e) }, 500);
  }
});
