/**
 * Serowarnie — publiczny katalog producentów (/serowarnie)
 * Widoczne wyłącznie wpisy status='opublikowany' AND zgoda_publikacja=true
 * (pilnuje tego RLS, nie front).
 */

import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Store, MapPin, Loader2 } from "lucide-react";

interface Wpis {
  slug: string;
  nazwa: string;
  opis: string | null;
  wojewodztwo: string | null;
  miejscowosc: string | null;
  produkty: string[];
  rodzaj_mleka: string[];
  typ_dzialalnosci: string | null;
  zdjecie_glowne: string | null;
}

/** Inicjały jako placeholder — brak zdjęcia ma wyglądać na wybór, nie na usterkę. */
const inicjaly = (nazwa: string) =>
  nazwa.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");

const TYP_ETYKIETY: Record<string, string> = {
  serowarnia: "sprzedaje ser",
  agroturystyka: "ser dla gości",
  sezonowa: "produkcja sezonowa",
  "w-organizacji": "w organizacji",
};

export default function Serowarnie() {
  const [wpisy, setWpisy] = useState<Wpis[]>([]);
  const [loading, setLoading] = useState(true);
  const [szukaj, setSzukaj] = useState("");
  const [woj, setWoj] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("serowarnie")
        .select("slug, nazwa, opis, wojewodztwo, miejscowosc, produkty, rodzaj_mleka, typ_dzialalnosci, zdjecie_glowne")
        .eq("status", "opublikowany")
        .order("nazwa");
      setWpisy(data ?? []);
      setLoading(false);
    })();
  }, []);

  const wojewodztwa = useMemo(
    () => [...new Set(wpisy.map((w) => w.wojewodztwo).filter(Boolean))].sort() as string[],
    [wpisy]
  );

  const widoczne = useMemo(() => {
    const q = szukaj.toLowerCase().trim();
    return wpisy.filter((w) => {
      if (woj && w.wojewodztwo !== woj) return false;
      if (!q) return true;
      return (
        w.nazwa.toLowerCase().includes(q) ||
        (w.miejscowosc ?? "").toLowerCase().includes(q) ||
        w.produkty.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [wpisy, szukaj, woj]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Katalog polskich serowarni zagrodowych",
    description:
      "Lista małych, rzemieślniczych serowarni w Polsce — gdzie kupić ser prosto od producenta, jakie sery robią i z jakiego mleka.",
    inLanguage: "pl",
    url: "https://mojaserowarnia.pl/serowarnie",
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Serowarnie zagrodowe w Polsce — katalog producentów | Moja Serowarnia</title>
        <meta
          name="description"
          content="Katalog małych serowarni zagrodowych w Polsce. Znajdź producenta w swoim województwie, zobacz jakie sery robi i jak kupić prosto od niego."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/serowarnie" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Serowarnie" }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Store}
              color="emerald"
              title="Serowarnie zagrodowe w Polsce"
              subtitle="Mali, rzemieślniczy producenci sera — prosto od gospodarza. Katalog tworzą sami serowarzy."
            />

            <div className="grid sm:grid-cols-2 gap-3 mt-6 mb-8">
              <Input
                placeholder="Szukaj po nazwie, miejscowości lub serze…"
                value={szukaj}
                onChange={(e) => setSzukaj(e.target.value)}
              />
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={woj}
                onChange={(e) => setWoj(e.target.value)}
              >
                <option value="">Wszystkie województwa</option>
                {wojewodztwa.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {loading && (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
            )}

            {!loading && wpisy.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center space-y-3">
                  <p className="text-muted-foreground">
                    Katalog dopiero się zapełnia — pierwsze wizytówki są w przygotowaniu.
                  </p>
                  <p className="text-sm">
                    Prowadzisz serowarnię?{" "}
                    <Link to="/dashboard/moja-serowarnia" className="text-primary hover:underline font-medium">
                      Dodaj się za darmo
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && wpisy.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {widoczne.length} {widoczne.length === 1 ? "serowarnia" : "serowarni"}
                  {woj && ` w województwie ${woj}`}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {widoczne.map((w) => (
                    <Link key={w.slug} to={`/serowarnie/${w.slug}`} className="group block h-full">
                      <Card className="h-full transition-all hover:-translate-y-0.5 border-2 hover:border-primary overflow-hidden">
                        {w.zdjecie_glowne ? (
                          <img
                            src={w.zdjecie_glowne}
                            alt={`${w.nazwa}${w.miejscowosc ? ` — ${w.miejscowosc}` : ""}`}
                            width={600} height={400} loading="lazy" decoding="async"
                            className="w-full object-cover"
                            style={{ aspectRatio: "3 / 2" }}
                          />
                        ) : (
                          <div
                            className="w-full bg-primary/10 flex items-center justify-center"
                            style={{ aspectRatio: "3 / 2" }}
                          >
                            <span className="text-3xl font-bold text-primary/50">{inicjaly(w.nazwa)}</span>
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {w.nazwa}
                          </CardTitle>
                          {(w.miejscowosc || w.wojewodztwo) && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {[w.miejscowosc, w.wojewodztwo].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {w.opis && (
                            <p className="text-sm text-muted-foreground line-clamp-3">{w.opis}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {w.typ_dzialalnosci && TYP_ETYKIETY[w.typ_dzialalnosci] && (
                              <Badge className="text-xs">{TYP_ETYKIETY[w.typ_dzialalnosci]}</Badge>
                            )}
                            {w.rodzaj_mleka.map((m) => (
                              <Badge key={m} variant="secondary" className="text-xs">mleko {m}</Badge>
                            ))}
                            {w.produkty.slice(0, 4).map((p) => (
                              <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <Card className="mt-8 bg-primary/5 border-primary/20">
                  <CardContent className="py-6 text-center space-y-2">
                    <p className="font-medium">Prowadzisz serowarnię i chcesz tu być?</p>
                    <p className="text-sm text-muted-foreground">
                      Wizytówka jest darmowa. Zakładasz konto, wypełniasz opis i zgłaszasz do publikacji.
                    </p>
                    <Link to="/dashboard/moja-serowarnia" className="text-primary hover:underline font-medium text-sm">
                      Dodaj swoją serowarnię →
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
