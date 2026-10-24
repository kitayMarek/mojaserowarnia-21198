/**
 * Seed bazy dodatków paszowych do Supabase z migawki src/data/dodatkiPaszowe.ts
 * i znaczniki GMO/eko dla 124 surowców wzorcowych z src/data/gmoEkoSurowcow.ts.
 *
 * UŻYCIE: node scripts/gen-dodatki-seed-sql.mts  ->  scripts/sql/dodatki-seed.sql
 * Uruchamia się PO migracji 20261024150000_baza_dodatkow_paszowych.sql (SQL Editor
 * w panelu Supabase albo psql). Idempotentne: czyści poprzedni seed source='dodatek'
 * (oferty idą razem z nim przez ON DELETE CASCADE) i wstawia od nowa. Oferty
 * dopisane ręcznie w panelu do tych produktów też zniknie, więc po takich zmianach
 * najpierw przenieś je do migawki.
 *
 * Wzór: scripts/gen-feed-seed-sql.py (seed 124 surowców). Tu Node, bo czyta TS wprost
 * i nie musi parsować pliku wyrażeniami regularnymi.
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { feedIngredients, type FeedIngredient } from "../src/data/feedIngredients.ts";
import { DODATKI_PASZOWE, STAN_DODATKOW, adresOferty } from "../src/data/dodatkiPaszowe.ts";
import { znacznikiSurowca } from "../src/data/gmoEkoSurowcow.ts";

const KATALOG = dirname(dirname(fileURLToPath(import.meta.url)));
const WYJSCIE = join(KATALOG, "scripts", "sql", "dodatki-seed.sql");

// Pola składu w kolejności kolumn feed_ingredients (migracje 20260831120000 i 20260901180000).
const POLA: Array<[keyof FeedIngredient, string]> = [
  ["em", "em"], ["bialko", "bialko"], ["ca", "ca"], ["p", "p"], ["wlokno", "wlokno"], ["na", "na"], ["k", "k"],
  ["mg", "mg"], ["mn", "mn"], ["zn", "zn"], ["se", "se"], ["fe", "fe"], ["i", "i"],
  ["suchaMasa", "sucha_masa"], ["tluszcz", "tluszcz"], ["popiol", "popiol"], ["skrobia", "skrobia"], ["cukier", "cukier"],
  ["pPrzyswajalny", "p_przyswajalny"], ["cl", "cl"], ["s", "s"], ["cu", "cu"], ["co", "co"],
  ["lys", "lys"], ["met", "met"], ["metCys", "met_cys"], ["trp", "trp"], ["thr", "thr"], ["ile", "ile"], ["leu", "leu"],
  ["val", "val"], ["his", "his"], ["arg", "arg"], ["phe", "phe"], ["tyr", "tyr"],
  ["witA", "wit_a"], ["witD3", "wit_d3"], ["witE", "wit_e"], ["witB1", "wit_b1"], ["witB2", "wit_b2"], ["witB6", "wit_b6"],
  ["kwasPantotenowy", "kwas_pantotenowy"], ["kwasFoliowy", "kwas_foliowy"], ["biotyna", "biotyna"], ["niacyna", "niacyna"],
  ["witB12", "wit_b12"], ["cholina", "cholina"], ["kwasLinolowy", "kwas_linolowy"],
];

const tekst = (s: string | null | undefined) => (s == null ? "NULL" : `'${s.replace(/'/g, "''")}'`);
const liczba = (x: number | null | undefined) => (x == null ? "NULL" : String(x));
const bool = (b: boolean | null) => (b == null ? "NULL" : b ? "true" : "false");
const data = (d: string | null | undefined) => (d ? `'${d}'::date` : "NULL");
const tablica = (t: string[]) => (t.length ? `ARRAY[${t.map(tekst).join(", ")}]::text[]` : "'{}'::text[]");

const KOLUMNY = [
  "nazwa", "kategoria", ...POLA.map(([, k]) => k),
  "producent", "gatunki", "dawka_proc_od", "dawka_proc_do", "dawka_g_dziennie", "dawkowanie", "stosowanie",
  "sklad_surowcowy", "gmo", "dopuszczalne_eko", "zrodlo_skladu", "zrodlo", "zweryfikowano", "partner",
  "url_producenta", "odpowiednik", "status", "source",
];

const wiersze = DODATKI_PASZOWE.map((d) => `  (${[
  tekst(d.nazwa), tekst(d.kategoria), ...POLA.map(([p]) => liczba(d[p] as number)),
  tekst(d.producent), tablica(d.gatunki), liczba(d.dawkaProcOd), liczba(d.dawkaProcDo), liczba(d.dawkaGDziennie),
  tekst(d.dawkowanie), tekst(d.stosowanie), tekst(d.skladSurowcowy), tekst(d.gmo), bool(d.dopuszczalneEko),
  tekst(d.zrodloSkladu), tekst(d.zrodlo), data(d.zweryfikowano), bool(d.partner), tekst(d.urlProducenta),
  tekst(d.odpowiednik ?? null), "'approved'", "'dodatek'",
].join(", ")})`);

const oferty = DODATKI_PASZOWE.flatMap((d) => d.oferty.map((o) =>
  `  (${[tekst(d.nazwa), tekst(o.sklep), tekst(adresOferty(o.url)), liczba(o.cenaZl), liczba(o.opakowanieKg), data(o.sprawdzono)].join(", ")})`));

const znaczniki = feedIngredients.map((f) => {
  const z = znacznikiSurowca(f.nazwa);
  return `  (${tekst(f.nazwa)}, ${tekst(z.gmo)}, ${bool(z.dopuszczalneEko)})`;
});

const sql = `-- ==========================================================================
-- Seed bazy dodatkow paszowych (stan migawki: ${STAN_DODATKOW})
--
-- PLIK GENEROWANY przez scripts/gen-dodatki-seed-sql.mts z src/data/dodatkiPaszowe.ts
-- i src/data/gmoEkoSurowcow.ts. Nie edytuj recznie: popraw migawke i przegeneruj.
--
-- Uruchamiac PO migracji 20261024150000_baza_dodatkow_paszowych.sql.
-- Idempotentne: czysci poprzedni seed source='dodatek' razem z jego ofertami.
-- Produkty: ${DODATKI_PASZOWE.length}, oferty: ${oferty.length}.
-- ==========================================================================

BEGIN;

-- 1. Znaczniki GMO i eko dla ${feedIngredients.length} surowcow wzorcowych. Sklad z tabel
--    wartosci pokarmowej, wiec zrodlo_skladu = 'norma'. Zgloszen (source='user') nie ruszamy.
UPDATE public.feed_ingredients AS f SET
  gmo = v.gmo,
  dopuszczalne_eko = v.dopuszczalne_eko,
  zrodlo_skladu = COALESCE(f.zrodlo_skladu, 'norma')
FROM (VALUES
${znaczniki.join(",\n")}
) AS v(nazwa, gmo, dopuszczalne_eko)
WHERE f.nazwa = v.nazwa AND f.source = 'baza';

-- 2. Produkty (oferty znikaja razem z nimi: ON DELETE CASCADE).
DELETE FROM public.feed_ingredients WHERE source = 'dodatek';

INSERT INTO public.feed_ingredients
  (${KOLUMNY.join(", ")})
VALUES
${wiersze.join(",\n")};

-- 3. Oferty sklepow, przypiete do produktow po nazwie.
INSERT INTO public.feed_offers (feed_ingredient_id, sklep, url, cena_zl, opakowanie_kg, sprawdzono)
SELECT f.id, v.sklep, v.url, v.cena_zl, v.opakowanie_kg, v.sprawdzono
FROM (VALUES
${oferty.join(",\n")}
) AS v(nazwa, sklep, url, cena_zl, opakowanie_kg, sprawdzono)
JOIN public.feed_ingredients f ON f.nazwa = v.nazwa AND f.source = 'dodatek';

COMMIT;
`;

writeFileSync(WYJSCIE, sql, "utf-8");
console.log(`OK: ${DODATKI_PASZOWE.length} produktów, ${oferty.length} ofert, ${feedIngredients.length} znaczników -> scripts/sql/dodatki-seed.sql`);
