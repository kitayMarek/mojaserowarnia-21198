import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SERWIS } from "./serwis";

/**
 * Tytuły kart i opisy stron mojapasza.com.
 *
 * Strony pasz pochodzą z Serowarni i same ustawiają document.title z dopiskiem
 * „| Moja Serowarnia” (KalkulatorPasz, KalkulatorPaszBydlo, Auth), a PaszeHub
 * bierze tytuł z metaStron.ts Serowarni, którego tu nie ma. Żeby nie ruszać
 * tych stron, ten komponent pilnuje <head>: gdy strona wpisze swój tytuł albo
 * opis, od razu przywraca wersję mojapasza. Strona ustawia go w useEffect,
 * czyli po nas, dlatego obserwator, a nie jednorazowe ustawienie.
 *
 * Ten sam komponent ustawia adres kanoniczny i podgląd linku (og:*, twitter:*)
 * z adresem mojapasza.com: strony z Serowarni wpisują tam mojaserowarnia.pl
 * i zdjęcie sera, a podgląd z serem w ChatGPT był powodem przenosin.
 * Boty i tak dostają mirror (pasze/public), to jest wersja dla ludzi i dla
 * wyszukiwarki, która wyrenderuje stronę.
 *
 * Tytuł strony głównej trzyma frazę z Google („kalkulator paszy”, 23.10.2026
 * pozycja 1,7 dla „kalkulator paszy dla kur”), bo przy przełączeniu przejmie
 * ruch z /kalkulator-pasz. Limity jak w metaStron.ts: tytuł do ~60 znaków.
 */
const TYTULY: Record<string, { tytul: string; opis: string }> = {
  "/": {
    tytul: "Kalkulator paszy dla drobiu: normy i mieszanki | Moja Pasza",
    opis: "Ułóż paszę dla kur niosek, brojlerów, kaczek, gęsi i indyków z własnych surowców. Kalkulator sprawdza normy białka, energii, wapnia i fosforu.",
  },
  "/bydlo": {
    tytul: "Kalkulator paszy dla bydła: dawki pokarmowe | Moja Pasza",
    opis: "Dawka pokarmowa dla krów mlecznych i opasów: bilans energii i białka z paszami objętościowymi i treściwymi.",
  },
  "/poradnik": {
    tytul: "Pasze i żywienie zwierząt w gospodarstwie | Moja Pasza",
    opis: "Normy żywieniowe drobiu, dodatki do paszy (olej, muszle, grit, metionina) i bezpieczne wykorzystanie serwatki w żywieniu zwierząt.",
  },
  "/poradnik/udzial-surowcow": {
    tytul: "Ile jakiego surowca w paszy dla drobiu | Moja Pasza",
    opis: "Najwyższe zalecane udziały zbóż, grochu, bobiku, łubinu i rzepaku dla piskląt, brojlerów, niosek, kaczek i gęsi, z powodem i źródłem.",
  },
  "/poradnik/kury-nie-niosa": {
    tytul: "Kury nie niosą jajek? Najczęstsze przyczyny | Moja Pasza",
    opis: "Dajesz kurom dobre jedzenie, a nie niosą? Krótki dzień i pierzenie, za mało białka i wapnia, sama pszenica i resztki z kuchni. Co zrobić.",
  },
  "/poradnik/resztki-z-kuchni": {
    tytul: "Resztki z kuchni dla kur: co wolno i ile | Moja Pasza",
    opis: "Chleb, makaron, obierki, talerz po obiedzie. Ile resztek mogą dostać kury, co im szkodzi (sól, pleśń, awokado, surowa fasola) i co mówią przepisy.",
  },
  "/asystenci-ai": {
    tytul: "Kalkulator paszy w ChatGPT, Claude i Perplexity | Moja Pasza",
    opis: "Podłącz kalkulator paszy do swojego czatu: ChatGPT, Claude albo Perplexity ułożą mieszankę z Twoich surowców według norm. Bez konta i klucza.",
  },
  "/auth": {
    tytul: "Logowanie | Moja Pasza",
    opis: "Zaloguj się, żeby zapisywać mieszanki z kalkulatora paszy.",
  },
};

/** Ustawia atrybut elementu w <head>, tworząc go, gdy go nie ma. Bez zmiany, gdy wartość już jest. */
function ustawWGlowie(tag: "meta" | "link", klucz: string, nazwa: string, atrybut: string, wartosc: string) {
  let el = document.head.querySelector(`${tag}[${klucz}="${nazwa}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(klucz, nazwa);
    document.head.appendChild(el);
  }
  if (el.getAttribute(atrybut) !== wartosc) el.setAttribute(atrybut, wartosc);
}

const Tytuly = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const sciezka = pathname.replace(/\/+$/, "") || "/";
    const wpis = TYTULY[sciezka];
    if (!wpis) return;
    const adres = `${SERWIS.adres}${sciezka === "/" ? "/" : sciezka}`;

    const ustaw = () => {
      if (document.title !== wpis.tytul) document.title = wpis.tytul;
      ustawWGlowie("meta", "name", "description", "content", wpis.opis);
      ustawWGlowie("link", "rel", "canonical", "href", adres);
      ustawWGlowie("meta", "property", "og:url", "content", adres);
      ustawWGlowie("meta", "property", "og:title", "content", wpis.tytul);
      ustawWGlowie("meta", "property", "og:description", "content", wpis.opis);
      ustawWGlowie("meta", "property", "og:image", "content", SERWIS.obrazek);
      ustawWGlowie("meta", "property", "og:site_name", "content", SERWIS.nazwa);
      ustawWGlowie("meta", "name", "twitter:title", "content", wpis.tytul);
      ustawWGlowie("meta", "name", "twitter:description", "content", wpis.opis);
      ustawWGlowie("meta", "name", "twitter:image", "content", SERWIS.obrazek);
    };
    ustaw();

    const obserwator = new MutationObserver(ustaw);
    obserwator.observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["content", "href"],
    });
    return () => obserwator.disconnect();
  }, [pathname]);

  return null;
};

export default Tytuly;
