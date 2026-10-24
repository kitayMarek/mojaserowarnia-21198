import { Link } from "react-router-dom";
import { Egg } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import ReactionButton from "@/components/ReactionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PSZENICA_WOBEC_NORMY, PYTANIA_PORAD, SEKCJE_PORAD, ZRODLA_PORAD } from "@/data/kuryNieNiosa";

/**
 * Porady dla przydomowych hodowców: dlaczego kury nie niosą (od 24.10.2026).
 * Treść z src/data/kuryNieNiosa.ts, z której powstaje też mirror
 * public/pasze/kury-nie-niosa.html (scripts/mirror-kury-nie-niosa.mts).
 */

const URL_STRONY = "https://mojaserowarnia.pl/pasze/kury-nie-niosa";

const KuryNieNiosa = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Daję kurom dobre jedzenie, a one nie niosą. Dlaczego?",
        description:
          "Najczęstsze przyczyny w przydomowym kurniku: krótki dzień i pierzenie, za mało białka i wapnia, sama pszenica, resztki z kuchni. Prosto, z liczbami i źródłami.",
        inLanguage: "pl",
        url: URL_STRONY,
        dateModified: "2026-10-24",
        image: "https://mojaserowarnia.pl/og-image.jpg",
        publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
      },
      {
        "@type": "FAQPage",
        mainEntity: PYTANIA_PORAD.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  const seeAlsoLinks = [
    { title: "Kalkulator pasz dla drobiu", href: "/kalkulator-pasz", description: "Ułóż mieszankę dla niosek i policz, ile paszy kupić dla stada." },
    { title: "Ile jakiego surowca w paszy", href: "/pasze/udzial-surowcow", description: "Górne granice zbóż, grochu, bobiku i rzepaku dla każdej grupy ptaków." },
    { title: "Pasze i zwierzęta", href: "/pasze", description: "Normy drobiu, olej, muszle, metionina, grit i sól." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Pasze i zwierzęta", href: "/pasze" }, { label: "Kury nie niosą" }]} />
      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-3xl mx-auto">
            <PageHeader
              icon={Egg}
              color="amber"
              title="Daję kurom dobre jedzenie, a one nie niosą. Dlaczego?"
              subtitle="Najczęstsze pytanie w grupach o kurach. Krótko: kura nie potrzebuje dobrego jedzenia, tylko paszy z białkiem i wapniem, a jesienią i tak robi przerwę."
            />
            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="kury-nie-niosa" variant="default" />
            </div>

            <TLDRSection>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Jesienią</strong> dzień jest za krótki: kury robią przerwę i się pierzą. To normalne.</li>
                <li><strong>Jajko to białko i wapń.</strong> Resztki, chleb, makaron i warzywa ich prawie nie mają.</li>
                <li>
                  <strong>Sama pszenica</strong> daje około {PSZENICA_WOBEC_NORMY.procentWapnia}% wapnia, którego nioska
                  potrzebuje. Kury babci resztę wygrzebywały przy oborze i w oborniku.
                </li>
                <li>Podstawą ma być <strong>pasza dla niosek</strong>, a dodatki tylko tyle, ile kury zjedzą w kwadrans.</li>
              </ul>
            </TLDRSection>

            {SEKCJE_PORAD.map((s) => (
              <section key={s.id} id={s.id} className="mt-10">
                <h2 className="text-2xl font-bold mb-3">{s.tytul}</h2>
                {s.akapity.map((a) => (
                  <p key={a} className="leading-relaxed mb-3">{a}</p>
                ))}
                {s.punkty && (
                  <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                    {s.punkty.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                )}
                {s.id === "pszenica" && (
                  <p className="text-sm mt-2">
                    Sprawdź własną mieszankę w{" "}
                    <Link to="/kalkulator-pasz" className="text-primary underline">kalkulatorze pasz</Link>: pokaże,
                    czego brakuje, i policzy, ile paszy kupić dla Twojego stada na miesiąc.
                  </p>
                )}
                {s.id === "resztki" && (
                  <p className="text-sm mt-2">
                    Co z kuchni kurom szkodzi i co mówią przepisy:{" "}
                    <Link to="/pasze/resztki-z-kuchni" className="text-primary underline">Resztki z kuchni dla kur</Link>.
                  </p>
                )}
                {s.id === "co-robic" && (
                  <p className="text-sm mt-3">
                    Ile grochu, bobiku, jęczmienia czy rzepaku można dać w paszy, opisujemy na stronie{" "}
                    <Link to="/pasze/udzial-surowcow" className="text-primary underline">Ile jakiego surowca w paszy dla drobiu</Link>.
                  </p>
                )}
                {s.zrodla.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Źródło:{" "}
                    {s.zrodla.map((k, i) => (
                      <span key={k}>
                        {i > 0 && "; "}
                        <a href={ZRODLA_PORAD[k].url} target="_blank" rel="noopener noreferrer" className="underline">
                          {ZRODLA_PORAD[k].opis}
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </section>
            ))}

            <h2 className="text-2xl font-bold mt-12 mb-4">Najczęstsze pytania</h2>
            <div className="space-y-4">
              {PYTANIA_PORAD.map((f) => (
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

export default KuryNieNiosa;
