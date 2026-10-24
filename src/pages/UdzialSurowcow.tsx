import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Wheat } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import ReactionButton from "@/components/ReactionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  GRUPY_PTAKOW, STAN_UDZIALOW, UDZIALY_SUROWCOW, ZRODLA_UDZIALOW,
  opisZalecenia, pytaniaUdzialow, zalecenieGrupy, type GrupaPtakow,
} from "@/data/udzialySurowcow";

/**
 * Ile najwyżej danego surowca w paszy dla drobiu i dlaczego (od 24.10.2026).
 * Cała treść tabeli i odpowiedzi idzie z src/data/udzialySurowcow.ts, z którego
 * liczą też kalkulator i serwer MCP. Mirror dla botów: public/pasze/udzial-surowcow.html,
 * generowany skryptem scripts/mirror-udzialy-surowcow.mts z tych samych danych.
 */

const KOLEJNOSC: GrupaPtakow[] = ["mlode", "rosnace", "nioski", "wodne"];
const URL_STRONY = "https://mojaserowarnia.pl/pasze/udzial-surowcow";

const UdzialSurowcow = () => {
  const [grupa, setGrupa] = useState<GrupaPtakow>("nioski");
  const faq = pytaniaUdzialow();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Ile jakiego surowca w paszy dla drobiu",
        description:
          "Najwyższe zalecane udziały zbóż, roślin strączkowych, rzepaku i dodatków w mieszance dla piskląt, brojlerów, niosek, kaczek i gęsi, z powodem ograniczenia i źródłem.",
        inLanguage: "pl",
        url: URL_STRONY,
        dateModified: STAN_UDZIALOW,
        image: "https://mojaserowarnia.pl/og-image.jpg",
        publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  const seeAlsoLinks = [
    { title: "Kalkulator pasz dla drobiu", href: "/kalkulator-pasz", description: "Dobiera proporcje w tych granicach i ostrzega, gdy je przekroczysz." },
    { title: "Kury nie niosą jajek?", href: "/pasze/kury-nie-niosa", description: "Najczęstsze przyczyny w przydomowym kurniku i co z nimi zrobić." },
    { title: "Pasze i zwierzęta", href: "/pasze", description: "Normy drobiu, olej, muszle, metionina, grit i sól." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Pasze i zwierzęta", href: "/pasze" }, { label: "Udział surowców" }]} />
      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Wheat}
              color="amber"
              title="Ile jakiego surowca w paszy dla drobiu"
              subtitle="Nie każde zboże i nie każde białko można dać w dowolnej ilości. Tu są górne granice dla piskląt, ptaków rosnących, niosek oraz kaczek i gęsi, z powodem i źródłem."
            />
            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="udzial-surowcow" variant="default" />
            </div>

            <TLDRSection>
              <p>
                Najbardziej wrażliwe są <strong>młode ptaki</strong>: grochu, bobiku i łubinu najwyżej 5%, żyta wcale.
                Kury znoszące <strong>brązowe jaja</strong> dostają najwyżej 3–5% pasz rzepakowych, bo inaczej jaja pachną rybą.
                <strong> Kurczętom i młodym kurkom nie dawaj paszy dla niosek</strong>: nadmiar wapnia niszczy nerki.
                Kalkulator pasz sam trzyma się tych granic, a gdy ustawisz więcej, pokaże ostrzeżenie.
              </p>
            </TLDRSection>

            <h2 className="text-2xl font-bold mt-10 mb-3">Dla jakich ptaków?</h2>
            <div className="flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Grupa ptaków">
              {KOLEJNOSC.map((g) => (
                <button
                  key={g}
                  role="tab"
                  aria-selected={grupa === g}
                  onClick={() => setGrupa(g)}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm transition-colors",
                    grupa === g ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted",
                  )}
                >
                  {GRUPY_PTAKOW[g]}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {UDZIALY_SUROWCOW.map((u) => {
                const wynik = zalecenieGrupy(u, grupa);
                return (
                  <Card key={u.surowiec}>
                    <CardContent className="pt-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="font-semibold text-lg">{u.surowiec}</h3>
                        <p className={cn("font-bold tabular-nums", wynik?.z.maks === 0 ? "text-destructive" : "text-primary")}>
                          {opisZalecenia(wynik?.z)}
                          {wynik?.zastepcze && <span className="ml-1 text-xs font-normal text-muted-foreground">(jak rosnące)</span>}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{u.powod}</p>
                      {u.doPotwierdzenia && (
                        <p className="text-xs mt-2 text-amber-700 dark:text-amber-400">Do potwierdzenia: {u.doPotwierdzenia}</p>
                      )}
                      <p className="text-xs mt-2 text-muted-foreground">
                        Źródło:{" "}
                        {u.zrodla.map((k, i) => {
                          const z = ZRODLA_UDZIALOW[k];
                          return (
                            <span key={k}>
                              {i > 0 && "; "}
                              {z.url ? (
                                <a href={z.url} target="_blank" rel="noopener noreferrer" className="underline">{z.opis}</a>
                              ) : (
                                z.opis
                              )}
                            </span>
                          );
                        })}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-3">Wszystkie grupy w jednej tabeli</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-secondary/50">
                        <th className="text-left p-2 font-semibold">Surowiec</th>
                        {KOLEJNOSC.map((g) => (
                          <th key={g} className="text-left p-2 font-semibold">{GRUPY_PTAKOW[g]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {UDZIALY_SUROWCOW.map((u) => (
                        <tr key={u.surowiec} className="border-b">
                          <td className="p-2 font-medium">{u.surowiec}</td>
                          {KOLEJNOSC.map((g) => {
                            const wynik = zalecenieGrupy(u, g);
                            return (
                              <td key={g} className="p-2 tabular-nums">
                                {opisZalecenia(wynik?.z)}
                                {wynik?.zastepcze && " *"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * Kaczki i gęsi: źródła nie podają osobnej liczby, przyjęto wartość dla ptaków rosnących.
                  „Brak limitu w źródłach” nie znaczy „dowolnie dużo”: o ilości decyduje wtedy bilans białka, energii i włókna.
                </p>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mt-12 mb-3">Wapń i sól: tu granicę wyznacza norma</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-5 h-5 text-destructive" /> Wapń (kreda, muszle)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  Nioska potrzebuje 3,5–4% wapnia w paszy, bo z niego robi skorupki. Rosnącym kurkom wystarcza najwyżej
                  około 1%, przed nieśnością 2,5–2,75%. Długo podawany nadmiar niszczy nerki (dna moczanowa), a ptaki
                  długo wyglądają zdrowo. Dlatego kurczęta i młode kurki nie powinny jeść paszy dla niosek.{" "}
                  <a href={ZRODLA_UDZIALOW["hyline-dna"].url} target="_blank" rel="noopener noreferrer" className="underline">
                    Źródło: Hy-Line, „Gout”
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-5 h-5 text-destructive" /> Sól
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  Drób potrzebuje około 0,3% soli w mieszance, a jednocześnie należy do zwierząt najbardziej wrażliwych
                  na przesolenie. Nadmiar to dużo picia i mokre odchody, a bez stałego dostępu do wody zatrucie.
                  Kalkulator ostrzega, gdy sodu jest wyraźnie więcej niż w normie. Więcej o soli i solance:{" "}
                  <Link to="/pasze" className="underline">dział Pasze i zwierzęta</Link>.
                </CardContent>
              </Card>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-4">Najczęstsze pytania</h2>
            <div className="space-y-4">
              {faq.map((f) => (
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

            <h2 className="text-2xl font-bold mt-12 mb-3">Skąd te liczby</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Z otwartych źródeł: polskich norm żywienia drobiu przytoczonych przez doradztwo rolnicze i czasopisma
              branżowe, badań Instytutu Zootechniki PIB, bazy Feedipedia (INRAE, CIRAD, AFZ, FAO) i poradników
              hodowców. Liczby oznaczone „do potwierdzenia” sprawdzimy w najnowszych normach IFiŻZ PAN „Zalecenia
              żywieniowe i wartość pokarmowa pasz dla drobiu” (wyd. 6, 2025). Stan na{" "}
              {new Date(STAN_UDZIALOW).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}.
            </p>
            <ul className="text-sm space-y-1 list-disc pl-5">
              {Object.entries(ZRODLA_UDZIALOW).map(([k, z]) => (
                <li key={k}>
                  {z.url ? (
                    <a href={z.url} target="_blank" rel="noopener noreferrer" className="underline">{z.opis}</a>
                  ) : (
                    z.opis
                  )}
                </li>
              ))}
            </ul>

            <p className="text-sm mt-8">
              Mieszankę w tych granicach ułożysz w{" "}
              <Link to="/kalkulator-pasz" className="text-primary underline">kalkulatorze pasz dla drobiu</Link>.
              To obliczenie na danych wzorcowych, a nie porada lekarza weterynarii.
            </p>
          </div>
        </div>
      </main>

      <SeeAlso links={seeAlsoLinks} />
      <Footer />
    </div>
  );
};

export default UdzialSurowcow;
