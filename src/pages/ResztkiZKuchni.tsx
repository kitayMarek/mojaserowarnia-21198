import { Link } from "react-router-dom";
import { Soup } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import TLDRSection from "@/components/TLDRSection";
import PodlaczWSwoimCzacie from "@/components/PodlaczWSwoimCzacie";
import SeeAlso from "@/components/SeeAlso";
import ReactionButton from "@/components/ReactionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CZY_MOZNA, PYTANIA_RESZTEK, RESZTKI_WOBEC_NORMY, SEKCJE_RESZTEK, ZRODLA_RESZTEK, type Werdykt,
} from "@/data/resztkiZKuchni";

/**
 * Resztki z kuchni dla kur: co, ile i czego unikać (od 24.10.2026). Treść
 * z src/data/resztkiZKuchni.ts, z której powstaje też mirror
 * public/pasze/resztki-z-kuchni.html (scripts/gen-mirror-porady-pasz.mts).
 */

const URL_STRONY = "https://mojaserowarnia.pl/pasze/resztki-z-kuchni";
const liczba = (n: number, miejsc = 2) => n.toLocaleString("pl-PL", { maximumFractionDigits: miejsc });

const KLASY_WERDYKTU: Record<Werdykt, string> = {
  tak: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  "z umiarem": "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  nie: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const ResztkiZKuchni = () => {
  const n = RESZTKI_WOBEC_NORMY;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Resztki z obiadu, chleb i makaron dla kur: co, ile i czego unikać",
        description:
          "Ile resztek z kuchni mogą dostać kury, co im szkodzi (sól, pleśń, zielone obierki, surowa fasola, awokado) i co mówią przepisy.",
        inLanguage: "pl",
        url: URL_STRONY,
        dateModified: "2026-10-24",
        image: "https://mojaserowarnia.pl/og-image.jpg",
        publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
      },
      {
        "@type": "FAQPage",
        mainEntity: PYTANIA_RESZTEK.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  const seeAlsoLinks = [
    { title: "Kury nie niosą jajek?", href: "/pasze/kury-nie-niosa", description: "Krótki dzień, pierzenie, za mało białka i wapnia, sama pszenica." },
    { title: "Kalkulator pasz dla drobiu", href: "/kalkulator-pasz", description: "Wpisz, ile resztek dajesz, i zobacz, jak zmienia się białko, wapń i sól." },
    { title: "Ile jakiego surowca w paszy", href: "/pasze/udzial-surowcow", description: "Górne granice zbóż, grochu, bobiku i rzepaku dla każdej grupy ptaków." },
  ];

  const zrodla = (klucze: string[]) => (
    <p className="text-xs text-muted-foreground mt-3">
      Źródło:{" "}
      {klucze.map((k, i) => (
        <span key={k}>
          {i > 0 && "; "}
          <a href={ZRODLA_RESZTEK[k].url} target="_blank" rel="noopener noreferrer" className="underline">{ZRODLA_RESZTEK[k].opis}</a>
        </span>
      ))}
    </p>
  );

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Pasze i zwierzęta", href: "/pasze" }, { label: "Resztki z kuchni" }]} />
      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-3xl mx-auto">
            <PageHeader
              icon={Soup}
              color="amber"
              title="Resztki z obiadu, chleb i makaron dla kur"
              subtitle="Mało kto ma kury, które nigdy nie dostały resztek. Ta strona nie zakazuje, tylko mówi uczciwie: co z kuchni kurom szkodzi, ile można dać i dlaczego przepisy w ogóle o tym mówią."
            />
            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="resztki-z-kuchni" variant="default" />
            </div>

            <TLDRSection>
              <ul className="list-disc pl-5 space-y-1">
                <li>Resztki to dodatek: <strong>tyle, ile kury zjedzą w 15–20 minut</strong>, a podstawą jest pasza dla niosek.</li>
                <li><strong>Chleb jest słony</strong>: ma około {liczba(n.produkty[2].na)}–{liczba(n.produkty[3].na)}% sodu, mniej więcej trzy razy więcej, niż powinno być w paszy.</li>
                <li><strong>Nie dawaj</strong> spleśniałego, zielonych obierek ziemniaków, surowej fasoli, awokado, czekolady, kawy, alkoholu ani resztek mięsa.</li>
                <li>Przepisy UE traktują kury od jajek jak zwierzęta gospodarskie i <strong>zakazują karmienia ich odpadami z kuchni</strong>.</li>
              </ul>
            </TLDRSection>

            <PodlaczWSwoimCzacie sciezka="/pasze/resztki-z-kuchni" className="mb-2" />

            {SEKCJE_RESZTEK.map((s) => (
              <section key={s.id} id={s.id} className="mt-10">
                <h2 className="text-2xl font-bold mb-3">{s.tytul}</h2>
                {s.akapity.map((a) => <p key={a} className="leading-relaxed mb-3">{a}</p>)}
                {s.id === "darmowe" && (
                  <div className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Co</th>
                          <th className="text-right p-2 font-semibold">Białko</th>
                          <th className="text-right p-2 font-semibold">Wapń</th>
                          <th className="text-right p-2 font-semibold">Sód</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b font-semibold">
                          <td className="p-2">Potrzeba nioski (norma paszy)</td>
                          <td className="p-2 text-right tabular-nums">{liczba(n.normaBialko, 1)}%</td>
                          <td className="p-2 text-right tabular-nums">{liczba(n.normaCa, 1)}%</td>
                          <td className="p-2 text-right tabular-nums">{liczba(n.normaNa)}%</td>
                        </tr>
                        {n.produkty.map((p) => (
                          <tr key={p.nazwa} className="border-b">
                            <td className="p-2">{p.nazwa}</td>
                            <td className="p-2 text-right tabular-nums">{liczba(p.bialko, 1)}%</td>
                            <td className="p-2 text-right tabular-nums">{liczba(p.ca, 3)}%</td>
                            <td className={cn("p-2 text-right tabular-nums", p.na > n.normaNa && "font-semibold text-red-700 dark:text-red-400")}>{liczba(p.na, 3)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-muted-foreground mt-1">Produkty w takiej postaci, w jakiej trafiają do kur (z wodą). Skład przybliżony z tabel żywności dla ludzi.</p>
                  </div>
                )}
                {s.zrodla.length > 0 && zrodla(s.zrodla)}
              </section>
            ))}

            <h2 className="text-2xl font-bold mt-12 mb-4">Czy kury mogą jeść…?</h2>
            <div className="space-y-2">
              {CZY_MOZNA.map((c) => (
                <div key={c.co} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold">{c.co}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", KLASY_WERDYKTU[c.werdykt])}>{c.werdykt}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{c.dlaczego}</p>
                </div>
              ))}
            </div>
            {zrodla(["uf2026", "merck", "ue1069"])}

            <p className="text-sm mt-8">
              W <Link to="/kalkulator-pasz" className="text-primary underline">kalkulatorze pasz</Link> są produkty z kuchni
              (makaron, chleb, ryż, ziemniaki, kapusta, jabłka). Wpisz, ile ich dajesz, a zobaczysz, jak spada białko i wapń
              i ile soli dochodzi.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">Najczęstsze pytania</h2>
            <div className="space-y-4">
              {PYTANIA_RESZTEK.map((f) => (
                <Card key={f.question}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{f.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-10">
              Porady są ogólne. Gdy kura jest osowiała, chudnie albo ma biegunkę, skonsultuj się z lekarzem weterynarii.
            </p>
          </div>
        </div>
      </main>

      <SeeAlso links={seeAlsoLinks} />
      <Footer />
    </div>
  );
};

export default ResztkiZKuchni;
