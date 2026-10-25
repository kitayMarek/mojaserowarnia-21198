/**
 * Testy bazy dodatków paszowych i logiki „czym uzupełnić” (od 24.10.2026).
 * Uruchomienie: node scripts/test-dodatki-paszowe.mts (Node z obsługą typów, jak w CLAUDE.md).
 * Bez frameworka: każdy błąd kończy skrypt kodem 1 z opisem.
 */

import assert from "node:assert/strict";
import { feedIngredients } from "../src/data/feedIngredients.ts";
import { NORMY_DROBIU } from "../src/data/normyDrobiu.ts";
import {
  DODATKI_PASZOWE, KATEGORIA_OSOBNE_KARMIDLO, SKLEPY_DODATKOW, WOJEWODZTWA, adresOferty, cenaZaKg, dawkaEtykiety, najtanszaOferta,
  przepisZeStosowania, wWojewodztwie,
} from "../src/data/dodatkiPaszowe.ts";
// Serwer MCP czyta tę samą migawkę; testujemy jego wyniki wprost, bez Workera.
import { kartaDodatku, szukajDodatkow, zamiennikiDodatku } from "../worker-magazyn/src/dodatki.js";
import { dobierzProporcjeMieszanki } from "../worker-magazyn/src/pasze.js";
import { ZNACZNIKI_SUROWCOW, znacznikiSurowca } from "../src/data/gmoEkoSurowcow.ts";
import { dawkaDomyslna, udzialSurowca } from "../src/data/udzialySurowcow.ts";
import {
  dobierzProporcje, generujSugestie, graniceUdzialu, jedenSkladnik, koncentratZeZbozem, kosztNaPtakaMiesiecznie, najtanszaMieszanka,
  opisJednegoSkladnika,
  uzupelnienia, zawartosc,
} from "../src/lib/bilansPaszy.ts";

let testow = 0;
const test = (opis: string, f: () => void) => {
  try { f(); testow++; } catch (e) { console.error(`✗ ${opis}\n`, e); process.exit(1); }
};

const baza = [...feedIngredients, ...DODATKI_PASZOWE];
const surowiec = (nazwa: string) => {
  const s = baza.find((b) => b.nazwa === nazwa);
  assert.ok(s, `brak w bazie: ${nazwa}`);
  return s;
};
const wiersz = (nazwa: string, procent: number) => ({ ...surowiec(nazwa), procent });
const bazaUzupelnien = baza.map((s) => ({ ...s, procent: 0 }));
const nioski = NORMY_DROBIU["kury-nioski-ciezkie"].find((n) => n.okres === "Niesienie (powyżej 45%)")!;
const ptakiNioski = { drob: "kury-nioski-ciezkie", okres: nioski.okres };

// ── Dane ──────────────────────────────────────────────────────────────────

test("124 surowce wzorcowe mają znaczniki GMO/eko i nic ponad nie", () => {
  const nazwy = new Set(feedIngredients.map((f) => f.nazwa));
  assert.equal(feedIngredients.length, 124);
  for (const n of nazwy) assert.ok(ZNACZNIKI_SUROWCOW[n], `bez znacznika: ${n}`);
  for (const n of Object.keys(ZNACZNIKI_SUROWCOW)) assert.ok(nazwy.has(n), `znacznik dla nieistniejącego: ${n}`);
  assert.equal(znacznikiSurowca("Śruta sojowa").gmo, "tak");
  assert.equal(znacznikiSurowca("Lizyna").dopuszczalneEko, false);
  assert.equal(znacznikiSurowca("Metionina").dopuszczalneEko, false);
  assert.equal(znacznikiSurowca("coś spoza bazy").gmo, "nieznane");
});

test("produkty: unikalne nazwy, odpowiedniki z bazy, oferty z datą i https", () => {
  assert.ok(DODATKI_PASZOWE.length >= 14, `za mało produktów: ${DODATKI_PASZOWE.length}`);
  const nazwy = new Set<string>();
  for (const d of DODATKI_PASZOWE) {
    assert.ok(!nazwy.has(d.nazwa), `dwa razy: ${d.nazwa}`);
    nazwy.add(d.nazwa);
    assert.ok(!feedIngredients.some((f) => f.nazwa === d.nazwa), `koliduje z surowcem: ${d.nazwa}`);
    if (d.odpowiednik) assert.ok(feedIngredients.some((f) => f.nazwa === d.odpowiednik), `zły odpowiednik: ${d.odpowiednik}`);
    assert.match(d.zweryfikowano, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(d.zrodlo, /^https:\/\//, `źródło bez adresu: ${d.nazwa}`);
    assert.ok(d.producent, `bez producenta: ${d.nazwa}`);
    for (const o of d.oferty) {
      assert.match(o.url, /^https:\/\//);
      assert.ok(o.cenaZl > 0 && o.opakowanieKg > 0);
      assert.match(o.sprawdzono, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(adresOferty(o.url), /[?&]utm_source=mojaserowarnia$/);
    }
    // Teksty dla ludzi bez długich myślników (zasada serwisu).
    for (const t of [d.nazwa, d.dawkowanie, d.stosowanie, d.skladSurowcowy, d.uwagi, d.producent]) {
      assert.ok(!String(t ?? "").includes("—"), `długi myślnik w: ${d.nazwa}`);
    }
  }
});

test("adresOferty dokleja znacznik raz, także przy parametrach i kotwicy", () => {
  assert.equal(adresOferty("https://a.pl/p"), "https://a.pl/p?utm_source=mojaserowarnia");
  assert.equal(adresOferty("https://a.pl/p?x=1"), "https://a.pl/p?x=1&utm_source=mojaserowarnia");
  assert.equal(adresOferty("https://a.pl/p#opis"), "https://a.pl/p?utm_source=mojaserowarnia#opis");
  assert.equal(adresOferty("https://a.pl/p?utm_source=mojaserowarnia"), "https://a.pl/p?utm_source=mojaserowarnia");
});

test("najtańsza oferta liczona za kg, nie za opakowanie", () => {
  const o = najtanszaOferta([
    { sklep: "A", url: "https://a", cenaZl: 20, opakowanieKg: 1, sprawdzono: "2026-10-24" },
    { sklep: "B", url: "https://b", cenaZl: 67, opakowanieKg: 10, sprawdzono: "2026-10-24" },
  ]);
  assert.equal(o?.sklep, "B");
  assert.equal(najtanszaOferta([]), null);
});

test("przepis z pola stosowanie (Rolpol 15% i 30%)", () => {
  const p30 = przepisZeStosowania(surowiec("Koncentrat 30% Nioska (Rolpol)").stosowanie as string);
  assert.deepEqual(p30, { koncentrat: 30, zboza: [70, 70], inne: [] });
  const p15 = przepisZeStosowania(surowiec("Koncentrat 15% Nioska (Rolpol)").stosowanie as string)!;
  assert.equal(p15.koncentrat, 15);
  assert.deepEqual(p15.zboza, [71, 73]);
  assert.deepEqual(p15.inne.map((d) => [d.nazwa, d.od, d.do]), [["Śruta sojowa", 6, 8], ["Kreda pastewna", 8, 8]]);
  assert.equal(przepisZeStosowania("2,5 kg na 100 kg paszy"), null);
});

// ── Limity i dawki ────────────────────────────────────────────────────────

test("premiks z etykiety: stała dawka 4% i limit równy dawce, bez ostrzeżenia", () => {
  const nazwa = "Polfamix Nioska Extra (Trouw Nutrition)";
  assert.equal(dawkaDomyslna(nazwa), 4);
  assert.equal(udzialSurowca(nazwa)?.stalaDawka, true);
  assert.deepEqual(graniceUdzialu({ nazwa, procent: "" }, ptakiNioski), [4, 4]);
  const m = [wiersz("Pszenica", 60), wiersz("Śruta sojowa", 25), wiersz("Kreda pastewna", 11), wiersz(nazwa, 4)];
  assert.ok(!generujSugestie(m, nioski, ptakiNioski).some((s) => s.includes("POWYŻEJ ZALECANEGO")));
});

test("kreda z worka ma limit „Kreda pastewna”, DL-metionina wymaga dawki", () => {
  assert.equal(udzialSurowca("Kreda pastewna Viva Max (Polcalc)"), udzialSurowca("Kreda pastewna"));
  assert.equal(dawkaDomyslna("DL-metionina 99% paszowa (bez marki)"), 0);
  assert.equal(dawkaEtykiety(surowiec("Muszle ostryg OYTA 2 (Algavita)") as never), 3.5);
});

// Recenzja Codex do PR #1 (24.10.2026): dobór dawał 29% drożdży Leiber przy etykiecie 3–5%.
test("dobór i najtańsza mieszanka trzymają górną dawkę z etykiety każdego produktu", () => {
  const brojlery = { drob: "brojlery", okres: NORMY_DROBIU["brojlery"][0].okres };
  for (const d of DODATKI_PASZOWE) {
    const etykieta = d.dawkaProcDo ?? d.dawkaProcOd;
    if (etykieta == null) continue;
    for (const ptaki of [ptakiNioski, brojlery]) {
      const [, maks] = graniceUdzialu({ nazwa: d.nazwa, procent: "" }, ptaki);
      assert.ok(maks <= etykieta, `${d.nazwa}: granica ${maks}% ponad etykietę ${etykieta}% (${ptaki.drob})`);
    }
  }
  const leiber = "Drożdże piwne Brewers Yeast S (Leiber)";
  const m = [wiersz("Pszenica", 0), wiersz(leiber, 0), wiersz("Kreda pastewna", 0), wiersz("Fosforan dwuwapniowy", 0)];
  let r = 7;
  const losuj = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  for (const wynik of [dobierzProporcje(m, nioski, ptakiNioski, losuj), najtanszaMieszanka(m.map((s) => ({ ...s, cena: 1 })), nioski, ptakiNioski, losuj)]) {
    const udzial = Number(wynik.find((s) => s.nazwa === leiber)!.procent);
    assert.ok(udzial <= 5.0001, `drożdże Leiber ${udzial}% przy etykiecie do 5%`);
  }
  // Muszle OYTA: granica muszli (12%) obcięta do etykiety, ostrzeżenie zostaje z wpisu muszli.
  assert.equal(graniceUdzialu({ nazwa: "Muszle ostryg OYTA 2 (Algavita)", procent: "" }, ptakiNioski)[1], 4);
  assert.equal(udzialSurowca("Muszle ostryg OYTA 2 (Algavita)")?.ostrzezenie, udzialSurowca("Muszle mielone")?.ostrzezenie);
});

test("soja bez GMO: zalecenie sprzedawcy 10–20% nie jest granicą (brojlery potrzebują więcej)", () => {
  assert.equal(graniceUdzialu({ nazwa: "Śruta sojowa bez GMO (Market-Rolniczy)", procent: "" }, { drob: "brojlery", okres: NORMY_DROBIU["brojlery"][0].okres })[1], 100);
});

test("sugestie widzą kredę z worka i koncentrat jako źródło białka", () => {
  const m = [wiersz("Pszenica", 62), wiersz("Koncentrat 30% Nioska (Rolpol)", 30), wiersz("Kreda pastewna Viva Max (Polcalc)", 8)];
  const s = generujSugestie(m, nioski, ptakiNioski).join("\n");
  assert.ok(!s.includes("KONIECZNIE dodaj kredę"), s);
  assert.ok(!s.includes("KONIECZNIE dodaj źródło białka"), s);
});

// ── Czym uzupełnić ────────────────────────────────────────────────────────

const bezWapnia = [wiersz("Pszenica", 70), wiersz("Śruta sojowa", 25), wiersz("Fosforan dwuwapniowy", 1.5), wiersz("Sól kuchenna", 0.3)];

test("brak wapnia u niosek: najwyżej 2 propozycje, dwa różne rodzaje, kreda z ceną", () => {
  const u = uzupelnienia(bezWapnia, nioski, ptakiNioski, bazaUzupelnien, "ca", 2, 118);
  assert.equal(u.length, 2);
  const [pierwsza, druga] = u;
  assert.equal(pierwsza.nazwa, "Kreda pastewna Viva Max (Polcalc)", JSON.stringify(u.map((x) => x.nazwa)));
  assert.ok(pierwsza.oferta && pierwsza.kosztNaPtakaMiesiecznieZl! > 0);
  // Najtańsza oferta: 15 zł za 25 kg.
  assert.equal(pierwsza.oferta!.sklep, "AgroRatajczak");
  assert.ok(Math.abs(pierwsza.kosztNaPtakaMiesiecznieZl! - kosztNaPtakaMiesiecznie(pierwsza.dodajProc, 118, 0.6)) < 1e-9);
  // Drugie miejsce nie jest drugą kredą (grys też jest „Kreda pastewna”).
  assert.notEqual(druga.nazwa, "Grys wapienny Mikros (Mikrop)");
  assert.notEqual(druga.nazwa, "Kreda pastewna");
  console.log("  wapń:", u.map((x) => `${x.nazwa} ${x.dodajProc.toFixed(1)}%${x.kosztNaPtakaMiesiecznieZl != null ? `, ${x.kosztNaPtakaMiesiecznieZl.toFixed(2)} zł/ptaka/30 dni` : ""}`).join(" | "));
});

test("prawie równa ilość: wygrywa produkt z ceną (mieszanka ze strony, 8,5% i 8,6%)", () => {
  const m = [wiersz("Pszenica", 50), wiersz("Kukurydza", 22.7), wiersz("Śruta sojowa", 25), wiersz("Fosforan dwuwapniowy", 2), wiersz("Sól kuchenna", 0.3)];
  const u = uzupelnienia(m, nioski, ptakiNioski, bazaUzupelnien, "ca", 2, 118);
  assert.equal(u[0].nazwa, "Kreda pastewna Viva Max (Polcalc)", JSON.stringify(u.map((x) => [x.nazwa, x.dodajProc])));
});

test("neutralność: oznaczenie partnera nie zmienia kolejności", () => {
  const zwykle = uzupelnienia(bezWapnia, nioski, ptakiNioski, bazaUzupelnien, "ca", 2, 118).map((u) => u.nazwa);
  for (const n of DODATKI_PASZOWE.map((d) => d.nazwa)) {
    const zPartnerem = bazaUzupelnien.map((s) => (s.nazwa === n ? { ...s, partner: true } : s));
    const wynik = uzupelnienia(bezWapnia, nioski, ptakiNioski, zPartnerem, "ca", 2, 118);
    assert.deepEqual(wynik.map((u) => u.nazwa), zwykle, `partner ${n} przestawił propozycje`);
  }
});

test("brak sodu: sól z worka zamiast soli z tabel, z kosztem", () => {
  const m = [wiersz("Pszenica", 62), wiersz("Śruta sojowa", 26), wiersz("Kreda pastewna", 10), wiersz("Fosforan dwuwapniowy", 2)];
  const u = uzupelnienia(m, nioski, ptakiNioski, bazaUzupelnien, "na", 2, 118);
  assert.ok(u.some((x) => x.nazwa === "Sól paszowa kłodawska (KS Kłodawa)"), JSON.stringify(u.map((x) => x.nazwa)));
  assert.ok(!u.some((x) => x.nazwa === "Sól kuchenna"));
});

test("bez dawki paszy: koszt na kg paszy jest, na ptaka nie", () => {
  const u = uzupelnienia(bezWapnia, nioski, ptakiNioski, bazaUzupelnien, "ca", 2, 0);
  assert.ok(u[0].kosztNaKgPaszyZl! > 0);
  assert.equal(u[0].kosztNaPtakaMiesiecznieZl, null);
});

test("dawka w g na sztukę: bez dawki paszy produktu nie proponujemy, z nią najwyżej jego etykieta", () => {
  const drozdze = bazaUzupelnien.filter((s) => s.nazwa === "Drożdże piwne sypkie (Mikrop)");
  const m = [wiersz("Pszenica", 85), wiersz("Kreda pastewna", 10), wiersz("Fosforan dwuwapniowy", 5)];
  assert.equal(uzupelnienia(m, nioski, ptakiNioski, drozdze, "bialko", 2, 0).length, 0);
  const [u] = uzupelnienia(m, nioski, ptakiNioski, drozdze, "bialko", 2, 118);
  assert.ok(u && Math.abs(u.dodajProc - (100 * 0.6) / 118) < 1e-9 && !u.domyka);
});

// Recenzja Codex do PR #1: dawka z etykiety dotyczy sumy, nie samej dokładki.
test("produkt już w mieszance: propozycja razem z tym, co jest, nie przekracza etykiety", () => {
  const oyta = "Muszle ostryg OYTA 2 (Algavita)";
  const tylkoOyta = bazaUzupelnien.filter((s) => s.nazwa === oyta);
  const m = (udzial: number) => [wiersz("Pszenica", 60), wiersz("Kukurydza", 25 - udzial), wiersz("Śruta sojowa", 15), wiersz(oyta, udzial)];
  const [u] = uzupelnienia(m(3.5), nioski, ptakiNioski, tylkoOyta, "ca", 2, 118);
  assert.ok(u && u.juzJest && 3.5 + u.dodajProc <= 4.0001, JSON.stringify(u));
  assert.equal(uzupelnienia(m(4), nioski, ptakiNioski, tylkoOyta, "ca", 2, 118).length, 0);
});

test("premiks już w swojej dawce nie dostaje propozycji „więcej o dawkę”", () => {
  const premiks = "Polfamix Nioska Extra (Trouw Nutrition)";
  const m = [wiersz("Pszenica", 70), wiersz("Śruta sojowa", 22), wiersz("Kreda pastewna", 4), wiersz(premiks, 4)];
  for (const pole of ["ca", "p", "na"] as const) {
    assert.ok(!uzupelnienia(m, nioski, ptakiNioski, bazaUzupelnien, pole, 40, 118).some((x) => x.nazwa === premiks), pole);
  }
});

// Audyt przed zgłoszeniem do OpenAI i prośba Marka (24.10.2026).
test("pasza z jednego składnika: braki, zachęta, osobne karmidło; bez sztywnych ilości kredy", () => {
  const sama = [wiersz("Pszenica", 100)];
  const j = jedenSkladnik(sama, nioski, ptakiNioski)!;
  assert.equal(j.nazwa, "Pszenica");
  assert.ok(j.nioski && j.braki.some((b) => b.pole === "bialko") && j.braki.some((b) => b.pole === "ca"), JSON.stringify(j));
  const s = generujSugestie(sama, nioski, ptakiNioski);
  assert.ok(s[0].startsWith("🌾 PASZA Z JEDNEGO SKŁADNIKA"), s[0]);
  assert.ok(s[0].includes("osobnym karmidle") && s[0].includes("żwirek") && s[0].includes("nie uzupełni białka"), s[0]);
  assert.ok(!s.join("\n").includes("2-4%") && !s.join("\n").includes("(1-2%)"), "sztywne ilości wróciły");
  // Brojler: mniej kredy w karmidle.
  const odchow = NORMY_DROBIU["brojlery"].find((n) => n.okres !== "Zarodowe")!;
  const b = jedenSkladnik(sama, odchow, { drob: "brojlery", okres: odchow.okres })!;
  assert.ok(!b.nioski && opisJednegoSkladnika(b).sposob.includes("mniej kredy"));
  // Dwa składniki: zwykłe sugestie, bez ramki.
  assert.equal(jedenSkladnik([wiersz("Pszenica", 80), wiersz("Śruta sojowa", 20)], nioski, ptakiNioski), null);
  console.log("  jeden składnik:", opisJednegoSkladnika(j).sklad);
});

test("wiaderko mineralne dodane do bazy: ramka jednego składnika je proponuje, „czym uzupełnić” nie", () => {
  const oferta = (cenaZl: number) => [{ sklep: "Sklep testowy", url: "https://example.com/w", cenaZl, opakowanieKg: 10, sprawdzono: "2026-10-24" }];
  const wiaderko = (nazwa: string, cenaZl: number, gatunki: string[], partner = false) => ({
    ...surowiec("Kreda pastewna"), nazwa, kategoria: KATEGORIA_OSOBNE_KARMIDLO, procent: 0, gatunki, oferty: oferta(cenaZl), producent: "Test", partner,
  });
  const baza = [...bazaUzupelnien, wiaderko("Wiaderko A", 90, []), wiaderko("Wiaderko B", 50, ["nioski"], true), wiaderko("Wiaderko C", 30, ["brojlery"]), wiaderko("Wiaderko D", 70, [])];
  const j = jedenSkladnik([wiersz("Pszenica", 100)], nioski, ptakiNioski, baza)!;
  // Najwyżej 2, od najtańszej za kg, tylko dla niosek albo dla drobiu ogólnie; partner nie przestawia.
  assert.deepEqual(j.gotowe.map((g) => g.nazwa), ["Wiaderko B", "Wiaderko D"]);
  assert.ok(generujSugestie([wiersz("Pszenica", 100)], nioski, ptakiNioski, baza)[0].includes("Gotowe z naszej bazy: Wiaderko B"));
  assert.ok(!uzupelnienia([wiersz("Pszenica", 100)], nioski, ptakiNioski, baza, "ca", 40, 118).some((u) => u.nazwa.startsWith("Wiaderko")));
});

// ── Koncentrat + Twoje zboże ──────────────────────────────────────────────

test("koncentrat 30% z pszenicą i kukurydzą użytkownika", () => {
  const k = surowiec("Koncentrat 30% Nioska (Rolpol)");
  const mieszanka = [wiersz("Pszenica", 40), wiersz("Kukurydza", 20), wiersz("Śruta sojowa", 20)];
  const w = koncentratZeZbozem({ ...k, procent: 0 }, mieszanka, baza, nioski)!;
  assert.ok(w);
  assert.equal(w.zEtykiety.koncentrat, 30);
  const zboza = w.zEtykiety.zboza;
  assert.deepEqual(zboza.map((z) => z.nazwa), ["Pszenica", "Kukurydza"]);
  assert.ok(Math.abs(zboza[0].procent - 70 * (2 / 3)) < 1e-9 && Math.abs(zboza[1].procent - 70 / 3) < 1e-9);
  assert.ok(Math.abs(w.zEtykiety.mieszanka.reduce((a, s) => a + s.procent, 0) - 100) < 1e-9);
  // Do normy białka: białko mieszanki równe normie.
  assert.ok(w.doNormyBialka);
  assert.ok(Math.abs(zawartosc(w.doNormyBialka!.mieszanka, "bialko") - nioski.bialko) < 1e-9);
  console.log(`  30% + pszenica/kukurydza: z etykiety białko ${w.bialkoZEtykiety.toFixed(2)}%, Ca ${zawartosc(w.zEtykiety.mieszanka, "ca").toFixed(2)}%; do normy białka ${w.doNormyBialka!.koncentrat.toFixed(1)}% koncentratu`);
});

test("koncentrat 15%: śruta sojowa i kreda z przepisu, zboże do 100%", () => {
  const k = surowiec("Koncentrat 15% Nioska (Rolpol)");
  const w = koncentratZeZbozem({ ...k, procent: 0 }, [wiersz("Pszenica", 0)], baza, nioski)!;
  assert.deepEqual(w.zEtykiety.inne.map((d) => [d.nazwa, d.procent]), [["Śruta sojowa", 6], ["Kreda pastewna", 8]]);
  assert.equal(w.zEtykiety.zboza[0].procent, 71);
  assert.equal(w.nierozpoznane.length, 0);
  console.log(`  15% + pszenica: białko ${w.bialkoZEtykiety.toFixed(2)}%, Ca ${zawartosc(w.zEtykiety.mieszanka, "ca").toFixed(2)}%, P ${zawartosc(w.zEtykiety.mieszanka, "p").toFixed(2)}%`);
});

test("bez zbóż w mieszance i dla produktu bez przepisu: null", () => {
  const k = surowiec("Koncentrat 30% Nioska (Rolpol)");
  assert.equal(koncentratZeZbozem({ ...k, procent: 0 }, [wiersz("Śruta sojowa", 30)], baza, nioski), null);
  assert.equal(koncentratZeZbozem({ ...surowiec("Dolmix DN (Dolfos)"), procent: 0 }, [wiersz("Pszenica", 50)], baza, nioski), null);
});

test("cena za kg z opakowania", () => {
  assert.equal(cenaZaKg({ cenaZl: 15, opakowanieKg: 25 }), 0.6);
});

// ── Lokalizacja sklepów (od 25.10.2026) ───────────────────────────────────

test("każdy sklep z ofert ma lokalizację, a mapa nie ma sklepów bez ofert", () => {
  const zOfert = new Set(DODATKI_PASZOWE.flatMap((d) => d.oferty.map((o) => o.sklep)));
  for (const s of zOfert) assert.ok(SKLEPY_DODATKOW[s], `sklep bez lokalizacji: ${s}`);
  for (const s of Object.keys(SKLEPY_DODATKOW)) assert.ok(zOfert.has(s), `lokalizacja sklepu bez ofert: ${s}`);
  for (const d of DODATKI_PASZOWE) for (const o of d.oferty) assert.equal(o.lokalizacja, SKLEPY_DODATKOW[o.sklep]);
});

test("lokalizacja: poprawne województwa i odbiór, adresy tylko tam, gdzie można przyjechać", () => {
  for (const [sklep, l] of Object.entries(SKLEPY_DODATKOW)) {
    if (l.wojewodztwo) assert.ok(l.wojewodztwo in WOJEWODZTWA, `${sklep}: województwo ${l.wojewodztwo}`);
    assert.ok(l.odbior == null || ["sklep", "odbior", "wysylka"].includes(l.odbior), `${sklep}: odbiór ${l.odbior}`);
    assert.match(l.sprawdzono, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(l.zrodlo, /^https:\/\//, `${sklep}: źródło bez adresu`);
    // Adres z ulicą tylko dla miejsc, do których klient może przyjechać.
    if (l.odbior === "sklep" || l.odbior === "odbior") assert.ok(l.punkty.length > 0, `${sklep}: odbiór bez adresu`);
    else assert.equal(l.punkty.length, 0, `${sklep}: adres przy sklepie bez odbioru`);
    for (const p of l.punkty) {
      assert.ok(p.wojewodztwo in WOJEWODZTWA, `${sklep}: punkt w ${p.wojewodztwo}`);
      assert.match(p.adres, /\d{2}-\d{3}/, `${sklep}: adres bez kodu pocztowego`);
    }
    for (const t of [l.miejscowosc, l.uwagi, ...l.punkty.flatMap((p) => [p.adres, p.godziny])]) {
      assert.ok(!String(t ?? "").includes("—"), `długi myślnik przy sklepie: ${sklep}`);
    }
  }
  assert.equal(SKLEPY_DODATKOW["Spec-Drob"].odbior, "sklep");
  assert.equal(SKLEPY_DODATKOW["Spec-Drob"].wojewodztwo, "warminsko-mazurskie");
  // Lagrico ma siedzibę na Mazowszu i drugi punkt odbioru w Busku-Zdroju.
  assert.ok(wWojewodztwie(SKLEPY_DODATKOW.Lagrico, "swietokrzyskie"));
  assert.ok(!wWojewodztwie(SKLEPY_DODATKOW.Lagrico, "lubelskie"));
});

// Kolejność jako lista nazw produktów i sklepów najtańszych ofert.
const kolejnosc = (wynik: { wyniki: Array<{ nazwa: string; najtansza_oferta: { sklep: string } | null }> }) =>
  wynik.wyniki.map((w) => `${w.nazwa} @ ${w.najtansza_oferta?.sklep ?? "-"}`);

test("MCP: województwo dopisuje oznaczenie, ale nie zmienia kolejności ani najtańszej oferty", () => {
  const pytania = [
    { brakuje: "wapn", gatunek: "nioski" },
    { brakuje: "fosfor" },
    { brakuje: "bialko", sortuj: "cena_za_kg" },
    { zapytanie: "kreda" },
    { sortuj: "koszt_na_kure" },
    {},
  ];
  for (const p of pytania) {
    const bez = szukajDodatkow({ ...p, limit: 20 });
    for (const woj of Object.keys(WOJEWODZTWA)) {
      const z = szukajDodatkow({ ...p, wojewodztwo: woj, limit: 20 });
      assert.deepEqual(kolejnosc(z), kolejnosc(bez), `${JSON.stringify(p)} w ${woj}: inna kolejność`);
      assert.equal(z.twoje_wojewodztwo.podane, WOJEWODZTWA[woj as keyof typeof WOJEWODZTWA]);
    }
    assert.equal(bez.twoje_wojewodztwo, undefined);
  }
  // Karta produktu i zamienniki: ta sama kolejność ofert i produktów.
  const kreda = "Kreda pastewna Viva Max (Polcalc)";
  const sklepy = (k: { oferty: Array<{ sklep: string }> }) => k.oferty.map((o) => o.sklep);
  assert.deepEqual(sklepy(kartaDodatku({ nazwa: kreda, wojewodztwo: "warminsko-mazurskie" })), sklepy(kartaDodatku({ nazwa: kreda })));
  const nazwy = (z: { zamienniki: Array<{ nazwa: string }> }) => z.zamienniki.map((x) => x.nazwa);
  assert.deepEqual(nazwy(zamiennikiDodatku({ nazwa: kreda, wojewodztwo: "warminsko-mazurskie" })), nazwy(zamiennikiDodatku({ nazwa: kreda })));
});

test("MCP: Spec-Drob w warmińsko-mazurskim oznaczony, droższa kreda z Olsztyna osobno obok najtańszej", () => {
  const w = szukajDodatkow({ zapytanie: "kreda viva max", wojewodztwo: "warminsko-mazurskie" }).wyniki[0];
  assert.equal(w.najtansza_oferta.sklep, "AgroRatajczak");
  assert.equal(w.najtansza_oferta.w_twoim_wojewodztwie, false);
  assert.deepEqual(w.inne_oferty_w_twoim_wojewodztwie.map((o: { sklep: string }) => o.sklep), ["Spec-Drob"]);
  assert.deepEqual(w.inne_oferty_w_twoim_wojewodztwie[0].odbior_osobisty_w_twoim_wojewodztwie, ["ul. Lubelska 32B, 10-409 Olsztyn"]);
  // Bez województwa lokalizacja jest, oznaczenia i dodatkowej listy nie ma.
  const bez = szukajDodatkow({ zapytanie: "kreda viva max" }).wyniki[0];
  assert.equal(bez.najtansza_oferta.sklep_wojewodztwo, "wielkopolskie");
  assert.equal(bez.najtansza_oferta.w_twoim_wojewodztwie, undefined);
  assert.equal(bez.inne_oferty_w_twoim_wojewodztwie, undefined);
});

test("MCP: dobór z województwem daje te same proporcje i tę samą kolejność w gdzie_kupic", () => {
  const pytanie = {
    drob: "kury-nioski-ciezkie", okres: "powyżej 45", stado: { sztuk: 20 },
    skladniki: [{ nazwa: "Pszenica" }, { nazwa: "Owies" }, { nazwa: "Bobik" }, { nazwa: "Kreda pastewna" }, { nazwa: "Śruta sojowa" }],
  };
  const bez = dobierzProporcjeMieszanki(pytanie);
  const z = dobierzProporcjeMieszanki({ ...pytanie, wojewodztwo: "warminsko-mazurskie" });
  assert.deepEqual(z.mieszanka, bez.mieszanka);
  const zakupy = (r: typeof bez) => r.gdzie_kupic.map((g: { skladnik: string; oferty: Array<{ produkt: string; sklep: string }> }) =>
    [g.skladnik, g.oferty.map((o) => `${o.produkt} @ ${o.sklep}`)]);
  assert.deepEqual(zakupy(z), zakupy(bez));
  const kreda = z.gdzie_kupic.find((g: { skladnik: string }) => g.skladnik === "Kreda pastewna");
  assert.ok(kreda.oferty.some((o: { sklep: string; w_twoim_wojewodztwie: boolean }) => o.sklep === "Spec-Drob" && o.w_twoim_wojewodztwie));
  assert.ok(kreda.inne_oferty_w_twoim_wojewodztwie.every((o: { w_twoim_wojewodztwie: boolean }) => o.w_twoim_wojewodztwie));
});

console.log(`OK: ${testow} testów`);
