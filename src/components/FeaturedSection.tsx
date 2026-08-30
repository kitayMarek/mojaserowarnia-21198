import { TrendingUp, Award, ChevronRight } from "lucide-react";

/**
 * Sekcja „Aktualności / Wyróżnione" w kierunku „almanach".
 *
 * Zmiana wobec poprzedniej wersji: zamiast kafli z cieniem — szpalty
 * rozdzielone linijkami, nagłówki pod grubą kreską i kapitaliki zamiast
 * kolorowych plakietek. Kolejność i treść bez zmian; to jest przebudowa
 * układu, nie redakcja.
 */
const FeaturedSection = () => {
  const news = [
    {
      date: "Lip 2026",
      title: "Generator etykiet RHD",
      description: "Twórz poprawne etykiety dla produktów RHD — wszystkie wymagane pola, gotowy wydruk",
      badge: "Narzędzie",
      href: "/etykieta-rhd",
    },
    {
      date: "Lip 2026",
      title: "Wędzenie sera — kompletny przewodnik",
      description: "Dobór drewna, temperatura, czas, najczęstsze błędy. Wszystko o wędzeniu na zimno",
      badge: "Poradnik",
      href: "/wedzenie-sera",
    },
    {
      date: "Lip 2026",
      title: "Faktura VAT RR — poradnik dla rolnika",
      description: "Kto wystawia, co musi zawierać, termin płatności i zmiany KSeF 2026",
      badge: "Prawo",
      href: "/prawo/rhd",
    },
  ];

  const highlights = [
    {
      icon: TrendingUp,
      label: "Najpopularniejsze",
      title: "Caciotta",
      subtitle: "Przepis krok po kroku",
      href: "/przepisy/caciotta",
    },
    {
      icon: Award,
      label: "Polecane",
      title: "Startery mezofilne",
      subtitle: "Kompletny przewodnik",
      href: "/baza-kultur?type=mezofilne",
    },
  ];

  return (
    <section className="py-12 md:py-16" aria-labelledby="featured-heading">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <hr className="border-0 border-t-[3px] border-double border-[hsl(var(--rule-strong))] mb-10" />

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Aktualności — szpalta główna */}
          <article className="lg:col-span-2">
            <div className="flex items-baseline justify-between gap-4 border-b-2 border-foreground pb-2 mb-1">
              <h2 id="featured-heading" className="font-display text-2xl md:text-[1.7rem] text-foreground">
                Aktualności
              </h2>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--kicker))]">
                ostatnio dodane
              </span>
            </div>

            <div>
              {news.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group block border-b border-[hsl(var(--rule))] py-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-primary">{item.badge}</span>
                    <span className="h-px flex-grow bg-[hsl(var(--rule))]" aria-hidden="true" />
                    <span className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--kicker))]">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-display text-xl md:text-[1.4rem] leading-snug text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mt-1.5">{item.description}</p>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary">
                    Otwórz
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              ))}
            </div>
          </article>

          {/* Wyróżnione — szpalta boczna */}
          <aside aria-labelledby="highlights-heading">
            <div className="border-b-2 border-foreground pb-2 mb-1">
              <h3 id="highlights-heading" className="font-display text-2xl text-foreground">
                Wyróżnione
              </h3>
            </div>

            <div>
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-3 border-b border-[hsl(var(--rule))] py-4"
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 mt-1 text-primary" aria-hidden="true" />
                    <span className="flex-grow">
                      <span className="block text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--kicker))] mb-1">
                        {item.label}
                      </span>
                      <span className="block font-display text-lg leading-snug text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </span>
                      <span className="block text-sm text-muted-foreground mt-0.5">{item.subtitle}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 mt-1 text-[hsl(var(--kicker))] transition-transform group-hover:translate-x-0.5" />
                  </a>
                );
              })}

              {/* Zaproszenie do konta — bez liczby, bo poprzednia („ponad 2000
                  serowarów") nie miała pokrycia w danych; licznik z bazy jest
                  w winiecie na górze strony. */}
              <div className="mt-6 border border-[hsl(var(--rule))] bg-card p-5">
                <h4 className="font-display text-lg text-foreground mb-1.5">Załóż konto</h4>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Własne listy kultur i ewidencja RHD zostają przypisane do konta — nie znikną przy zmianie
                  urządzenia.
                </p>
                <a
                  href="/auth"
                  className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground hover:bg-primary-hover transition-colors h-11 px-4 text-sm font-medium"
                >
                  Załóż konto
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
