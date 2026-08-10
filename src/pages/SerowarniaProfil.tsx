/**
 * SerowarniaProfil — publiczna wizytówka producenta (/serowarnie/:slug)
 * RLS wpuszcza tu wyłącznie wpisy opublikowane i za zgodą właściciela.
 */

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Phone, Mail, Globe, Loader2, ShoppingBasket } from "lucide-react";

interface Wpis {
  slug: string; nazwa: string; opis: string | null;
  wojewodztwo: string | null; miejscowosc: string | null;
  telefon: string | null; email_kontakt: string | null;
  www: string | null; facebook: string | null;
  produkty: string[]; rodzaj_mleka: string[]; forma_sprzedazy: string[];
  typ_dzialalnosci: string | null;
}

const TYP_PODTYTUL: Record<string, string> = {
  serowarnia: "Serowarnia zagrodowa",
  agroturystyka: "Gospodarstwo agroturystyczne z własnym serem",
  sezonowa: "Serowarnia — produkcja sezonowa",
  "w-organizacji": "Serowarnia w organizacji",
};

export default function SerowarniaProfil() {
  const { slug } = useParams<{ slug: string }>();
  const [wpis, setWpis] = useState<Wpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("serowarnie").select("*").eq("slug", slug).eq("status", "opublikowany").maybeSingle();
      setWpis(data ?? null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex justify-center pt-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </div>
    );
  }

  if (!wpis) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Nie znaleziono serowarni | Moja Serowarnia</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Navigation />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-20 text-center space-y-3">
            <h1 className="text-2xl font-bold">Nie znaleziono takiej serowarni</h1>
            <p className="text-muted-foreground">
              Wizytówka mogła zostać usunięta albo jeszcze nie została opublikowana.
            </p>
            <Link to="/serowarnie" className="text-primary hover:underline">← Wróć do katalogu</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const lokalizacja = [wpis.miejscowosc, wpis.wojewodztwo].filter(Boolean).join(", ");
  const opisMeta =
    (wpis.opis?.slice(0, 150) ??
      `${wpis.nazwa} — serowarnia zagrodowa${lokalizacja ? ` (${lokalizacja})` : ""}. ${wpis.produkty.slice(0, 4).join(", ")}.`);

  // LocalBusiness — realny, lokalny producent żywności
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: wpis.nazwa,
    description: wpis.opis ?? undefined,
    url: `https://mojaserowarnia.pl/serowarnie/${wpis.slug}`,
    inLanguage: "pl",
    ...(wpis.telefon ? { telephone: wpis.telefon } : {}),
    ...(wpis.email_kontakt ? { email: wpis.email_kontakt } : {}),
    ...(wpis.miejscowosc || wpis.wojewodztwo
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: wpis.miejscowosc ?? undefined,
            addressRegion: wpis.wojewodztwo ?? undefined,
            addressCountry: "PL",
          },
        }
      : {}),
    ...(wpis.www || wpis.facebook
      ? { sameAs: [wpis.www, wpis.facebook].filter(Boolean) }
      : {}),
    ...(wpis.produkty.length
      ? {
          makesOffer: wpis.produkty.map((p) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Product", name: p, category: "Ser" },
          })),
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{wpis.nazwa}{lokalizacja ? ` — ${lokalizacja}` : ""} | Serowarnie</title>
        <meta name="description" content={opisMeta} />
        <link rel="canonical" href={`https://mojaserowarnia.pl/serowarnie/${wpis.slug}`} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Serowarnie", href: "/serowarnie" }, { label: wpis.nazwa }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-4xl mx-auto">
            <PageHeader
              icon={Store}
              color="emerald"
              title={wpis.nazwa}
              subtitle={(() => {
                const typ = TYP_PODTYTUL[wpis.typ_dzialalnosci ?? ""] ?? "Serowarnia zagrodowa";
                return lokalizacja ? `${typ} — ${lokalizacja}` : typ;
              })()}
            />

            <div className="space-y-6 mt-6">
              {wpis.opis && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">O nas</CardTitle></CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line leading-relaxed">{wpis.opis}</p>
                  </CardContent>
                </Card>
              )}

              {(wpis.produkty.length > 0 || wpis.rodzaj_mleka.length > 0) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShoppingBasket className="h-4 w-4" /> Co produkujemy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {wpis.produkty.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {wpis.produkty.map((p) => <Badge key={p} variant="outline">{p}</Badge>)}
                      </div>
                    )}
                    {wpis.rodzaj_mleka.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Mleko: {wpis.rodzaj_mleka.join(", ")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {wpis.forma_sprzedazy.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {wpis.typ_dzialalnosci === "agroturystyka" ? "Jak spróbować" : "Jak kupić lub spróbować"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {wpis.forma_sprzedazy.map((f) => <li key={f}>{f}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {(wpis.telefon || wpis.email_kontakt || wpis.www || wpis.facebook || lokalizacja) && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Kontakt</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {lokalizacja && (
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{lokalizacja}</p>
                    )}
                    {wpis.telefon && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${wpis.telefon.replace(/\s/g, "")}`} className="text-primary hover:underline">{wpis.telefon}</a>
                      </p>
                    )}
                    {wpis.email_kontakt && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${wpis.email_kontakt}`} className="text-primary hover:underline">{wpis.email_kontakt}</a>
                      </p>
                    )}
                    {wpis.www && (
                      <p className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={wpis.www} target="_blank" rel="noopener noreferrer nofollow" className="text-primary hover:underline break-all">{wpis.www}</a>
                      </p>
                    )}
                    {wpis.facebook && (
                      <p className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={wpis.facebook} target="_blank" rel="noopener noreferrer nofollow" className="text-primary hover:underline break-all">Facebook</a>
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <p className="text-xs text-muted-foreground">
                Dane pochodzą od producenta i są publikowane za jego zgodą. Moja Serowarnia nie
                pośredniczy w sprzedaży ani nie weryfikuje oferty — kontakt i ustalenia leżą po
                stronie kupującego i producenta.
              </p>

              <div className="pt-2">
                <Link to="/serowarnie" className="text-primary hover:underline text-sm">← Wszystkie serowarnie</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
