/**
 * Mirrory dla botów dwóch podstron pasz (od 24.10.2026), składane z tych samych
 * danych co strony React, żeby treść nie rozjechała się między wersjami:
 *
 *   public/pasze/udzial-surowcow.html  <-  src/data/udzialySurowcow.ts
 *   public/pasze/kury-nie-niosa.html   <-  src/data/kuryNieNiosa.ts
 *
 * Tytuł i opis z src/data/metaStron.ts. Uruchomić po każdej zmianie danych:
 *
 *   node scripts/gen-mirror-porady-pasz.mts
 *
 * Akapity wstępne i ramki są tu przepisane z komponentów stron
 * (src/pages/UdzialSurowcow.tsx, src/pages/KuryNieNiosa.tsx): przy ich zmianie
 * poprawić oba miejsca.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { metaStron } from "../src/data/metaStron.ts";
import {
  GRUPY_PTAKOW, STAN_UDZIALOW, UDZIALY_SUROWCOW, ZRODLA_UDZIALOW,
  opisZalecenia, pytaniaUdzialow, zalecenieGrupy, type GrupaPtakow,
} from "../src/data/udzialySurowcow.ts";
import { PSZENICA_WOBEC_NORMY, PYTANIA_PORAD, SEKCJE_PORAD, ZRODLA_PORAD } from "../src/data/kuryNieNiosa.ts";

const BAZA = "https://mojaserowarnia.pl";
const DATA_PORAD = "2026-10-24";

const h = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const dataSlownie = (iso: string) => new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
const link = (z: { opis: string; url?: string }) => (z.url ? `<a href="${h(z.url)}" target="_blank" rel="noopener noreferrer">${h(z.opis)}</a>` : h(z.opis));

const STYL = `
    :root { --brand: #8a5a16; --brand-dark: #5f3d0f; --ink: #241a12; --muted: #5c4a34; --line: #c9b893; --bg-soft: #ece2cc; }
    * { box-sizing: border-box; }
    body { background: #f4eee0; max-width: 860px; margin: 0 auto; padding: 2rem 1.25rem 4rem; font: 16px/1.7 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: var(--ink); }
    h1, h2, h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 600; color: var(--brand-dark); }
    h1 { font-size: 1.95rem; line-height: 1.25; margin: 0 0 .5rem; }
    h2 { font-size: 1.3rem; margin-top: 2.4rem; border-bottom: 2px solid var(--line); padding-bottom: .3rem; }
    h3 { font-size: 1.05rem; margin: 1.4rem 0 .2rem; }
    a { color: var(--brand); }
    .lead { font-size: 1.08rem; color: var(--muted); }
    .key { background: var(--bg-soft); border-left: 4px solid var(--brand); border-radius: .4rem; padding: .8rem 1rem; margin: 1rem 0; }
    .note { background: var(--bg-soft); border-radius: .6rem; padding: .8rem 1rem; font-size: .9rem; color: var(--muted); margin: 1rem 0; }
    .maks { font-weight: 700; color: var(--brand-dark); }
    .male { font-size: .85rem; color: var(--muted); }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: .92rem; }
    th, td { border: 1px solid var(--line); padding: .5rem .6rem; text-align: left; vertical-align: top; }
    th { background: var(--bg-soft); }
    ul li { margin-bottom: .35rem; }
    nav.crumbs { font-size: .85rem; color: var(--muted); margin-bottom: 1.2rem; }
    nav.crumbs a { color: var(--muted); }
    .cta { display: inline-block; margin-top: 1rem; padding: .7rem 1.2rem; background: var(--brand); color: #fff; border-radius: .6rem; text-decoration: none; font-weight: 600; }
    footer { margin-top: 3rem; padding-top: 1.2rem; border-top: 1px solid var(--line); font-size: .85rem; color: var(--muted); }`;

function strona(sciezka: string, okruszek: string, tytulH1: string, dataZmiany: string, faq: { question: string; answer: string }[], tresc: string): string {
  const meta = metaStron[sciezka];
  const url = `${BAZA}${sciezka}`;
  const artykul = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: tytulH1,
    description: meta.description,
    inLanguage: "pl",
    url,
    dateModified: dataZmiany,
    image: `${BAZA}/og-image.jpg`,
    publisher: { "@type": "Organization", name: "Moja Serowarnia", url: `${BAZA}/` },
  };
  const pytania = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "pl",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${h(meta.title)}</title>
  <meta name="description" content="${h(meta.description ?? "")}" />
  <link rel="canonical" href="${url}" />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="${h(meta.title)}" />
  <meta property="og:description" content="${h(meta.description ?? "")}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="Moja Serowarnia" />
  <meta property="og:locale" content="pl_PL" />
  <meta property="og:image" content="${BAZA}/og-image.jpg" />
  <script type="application/ld+json">
${JSON.stringify(artykul, null, 2)}
  </script>
  <script type="application/ld+json">
${JSON.stringify(pytania, null, 2)}
  </script>
  <style>${STYL}
  </style>
</head>
<body>
  <nav class="crumbs">
    <a href="${BAZA}/">Moja Serowarnia</a> →
    <a href="${BAZA}/pasze">Pasze i zwierzęta</a> →
    ${h(okruszek)}
  </nav>

  <h1>${h(tytulH1)}</h1>
${tresc}
  <h2>Najczęstsze pytania</h2>
${faq.map((f) => `  <h3>${h(f.question)}</h3>\n  <p>${h(f.answer)}</p>`).join("\n")}

  <a class="cta" href="${BAZA}/kalkulator-pasz">Otwórz kalkulator pasz dla drobiu →</a>
  <p class="male">Ostatnia zmiana treści: <time datetime="${dataZmiany}">${dataSlownie(dataZmiany)}</time>. Pełna, interaktywna wersja: <a href="${url}">${h(meta.title)}</a>.</p>

  <footer>
    Dział o żywieniu zwierząt gospodarskich. Obliczenia i zalecenia na danych wzorcowych, nie porada lekarza weterynarii.
  </footer>
</body>
</html>
`;
}

// ── /pasze/udzial-surowcow ───────────────────────────────────────────────────
const KOLEJNOSC: GrupaPtakow[] = ["mlode", "rosnace", "nioski", "wodne"];

const udzialy = `  <p class="lead">Nie każde zboże i nie każde białko można dać w dowolnej ilości. Tu są górne granice dla piskląt, ptaków rosnących, niosek oraz kaczek i gęsi, z powodem i źródłem.</p>

  <div class="key">
    Najbardziej wrażliwe są <strong>młode ptaki</strong>: grochu, bobiku i łubinu najwyżej 5%, żyta wcale.
    Kury znoszące <strong>brązowe jaja</strong> dostają najwyżej 3–5% pasz rzepakowych, bo inaczej jaja pachną rybą.
    <strong>Kurczętom i młodym kurkom nie dawaj paszy dla niosek</strong>: nadmiar wapnia niszczy nerki.
    Kalkulator pasz sam trzyma się tych granic, a gdy ustawisz więcej, pokaże ostrzeżenie.
  </div>

  <h2>Najwyższy zalecany udział w mieszance</h2>
  <table>
    <thead><tr><th>Surowiec</th>${KOLEJNOSC.map((g) => `<th>${h(GRUPY_PTAKOW[g])}</th>`).join("")}</tr></thead>
    <tbody>
${UDZIALY_SUROWCOW.map((u) => `      <tr><td><strong>${h(u.surowiec)}</strong></td>${KOLEJNOSC.map((g) => {
  const w = zalecenieGrupy(u, g);
  return `<td>${h(opisZalecenia(w?.z))}${w?.zastepcze ? " *" : ""}</td>`;
}).join("")}</tr>`).join("\n")}
    </tbody>
  </table>
  <p class="male">* Kaczki i gęsi: źródła nie podają osobnej liczby, przyjęto wartość dla ptaków rosnących. „Brak limitu w źródłach” nie znaczy „dowolnie dużo”: o ilości decyduje wtedy bilans białka, energii i włókna.</p>

  <h2>Dlaczego te granice</h2>
${UDZIALY_SUROWCOW.map((u) => `  <h3>${h(u.surowiec)}</h3>
  <p>${h(u.powod)}</p>
  <p class="male">Po przekroczeniu: ${h(u.ostrzezenie)}${u.doPotwierdzenia ? `<br />Do potwierdzenia: ${h(u.doPotwierdzenia)}` : ""}<br />Źródło: ${u.zrodla.map((k) => link(ZRODLA_UDZIALOW[k])).join("; ")}</p>`).join("\n")}

  <h2>Wapń i sól: tu granicę wyznacza norma</h2>
  <p><strong>Wapń (kreda, muszle).</strong> Nioska potrzebuje 3,5–4% wapnia w paszy, bo z niego robi skorupki. Rosnącym kurkom wystarcza najwyżej około 1%, przed nieśnością 2,5–2,75%. Długo podawany nadmiar niszczy nerki (dna moczanowa), a ptaki długo wyglądają zdrowo. Dlatego kurczęta i młode kurki nie powinny jeść paszy dla niosek. Źródło: ${link(ZRODLA_UDZIALOW["hyline-dna"])}.</p>
  <p><strong>Sól.</strong> Drób potrzebuje około 0,3% soli w mieszance, a jednocześnie należy do zwierząt najbardziej wrażliwych na przesolenie. Nadmiar to dużo picia i mokre odchody, a bez stałego dostępu do wody zatrucie. Kalkulator ostrzega, gdy sodu jest wyraźnie więcej niż w normie. Więcej o soli i solance: <a href="${BAZA}/pasze">dział Pasze i zwierzęta</a>.</p>

  <h2>Skąd te liczby</h2>
  <p>Z otwartych źródeł: polskich norm żywienia drobiu przytoczonych przez doradztwo rolnicze i czasopisma branżowe, badań Instytutu Zootechniki PIB, bazy Feedipedia (INRAE, CIRAD, AFZ, FAO) i poradników hodowców. Liczby oznaczone „do potwierdzenia” sprawdzimy w najnowszych normach IFiŻZ PAN „Zalecenia żywieniowe i wartość pokarmowa pasz dla drobiu” (wyd. 6, 2025). Stan na ${dataSlownie(STAN_UDZIALOW)}.</p>
  <ul>
${Object.values(ZRODLA_UDZIALOW).map((z) => `    <li>${link(z)}</li>`).join("\n")}
  </ul>
  <p>Mieszankę w tych granicach ułożysz w <a href="${BAZA}/kalkulator-pasz">kalkulatorze pasz dla drobiu</a>. Dlaczego kury nie niosą mimo „dobrego jedzenia”: <a href="${BAZA}/pasze/kury-nie-niosa">Kury nie niosą jajek?</a></p>
`;

// ── /pasze/kury-nie-niosa ────────────────────────────────────────────────────
const porady = `  <p class="lead">Najczęstsze pytanie w grupach o kurach. Krótko: kura nie potrzebuje dobrego jedzenia, tylko paszy z białkiem i wapniem, a jesienią i tak robi przerwę.</p>

  <div class="key">
    <ul>
      <li><strong>Jesienią</strong> dzień jest za krótki: kury robią przerwę i się pierzą. To normalne.</li>
      <li><strong>Jajko to białko i wapń.</strong> Resztki, chleb, makaron i warzywa ich prawie nie mają.</li>
      <li><strong>Sama pszenica</strong> daje około ${PSZENICA_WOBEC_NORMY.procentWapnia}% wapnia, którego nioska potrzebuje. Kury babci resztę wygrzebywały przy oborze i w oborniku.</li>
      <li>Podstawą ma być <strong>pasza dla niosek</strong>, a dodatki tylko tyle, ile kury zjedzą w kwadrans.</li>
    </ul>
  </div>
${SEKCJE_PORAD.map((s) => `
  <h2 id="${s.id}">${h(s.tytul)}</h2>
${s.akapity.map((a) => `  <p>${h(a)}</p>`).join("\n")}${s.punkty ? `\n  <ul>\n${s.punkty.map((p) => `    <li>${h(p)}</li>`).join("\n")}\n  </ul>` : ""}${s.id === "pszenica" ? `\n  <p>Sprawdź własną mieszankę w <a href="${BAZA}/kalkulator-pasz">kalkulatorze pasz</a>: pokaże, czego brakuje, i policzy, ile paszy kupić dla Twojego stada na miesiąc.</p>` : ""}${s.id === "co-robic" ? `\n  <p>Ile grochu, bobiku, jęczmienia czy rzepaku można dać w paszy, opisujemy na stronie <a href="${BAZA}/pasze/udzial-surowcow">Ile jakiego surowca w paszy dla drobiu</a>.</p>` : ""}${s.zrodla.length ? `\n  <p class="male">Źródło: ${s.zrodla.map((k) => link(ZRODLA_PORAD[k])).join("; ")}</p>` : ""}`).join("\n")}

  <p class="note">Porady są ogólne. Gdy kura jest osowiała, chudnie albo ma biegunkę, skonsultuj się z lekarzem weterynarii.</p>
`;

mkdirSync("public/pasze", { recursive: true });
writeFileSync("public/pasze/udzial-surowcow.html",
  strona("/pasze/udzial-surowcow", "Udział surowców", "Ile jakiego surowca w paszy dla drobiu", STAN_UDZIALOW, pytaniaUdzialow(), udzialy));
writeFileSync("public/pasze/kury-nie-niosa.html",
  strona("/pasze/kury-nie-niosa", "Kury nie niosą", "Daję kurom dobre jedzenie, a one nie niosą. Dlaczego?", DATA_PORAD, PYTANIA_PORAD, porady));
console.log("Zapisane: public/pasze/udzial-surowcow.html, public/pasze/kury-nie-niosa.html");
