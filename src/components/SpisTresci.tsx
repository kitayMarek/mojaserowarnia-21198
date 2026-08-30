import { useEffect, useState } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navItems } from "@/components/navItems";

/**
 * Pełnoekranowy SPIS TREŚCI — odpowiedź na rozmiar menu.
 *
 * Serwis ma 50 pozycji w siedmiu działach. W rozwijanym menu to męczarnia:
 * trzeba wiedzieć, pod którym działem coś leży, i trafiać kursorem. W formie
 * spisu treści — czyli tak, jak robi to almanach — te same 50 pozycji widać
 * naraz i czyta się je wzrokiem, a nie klikaniem.
 *
 * Lista pochodzi z navItems, więc nowa strona pojawia się tu automatycznie.
 * Na wąskim ekranie działy są zwinięte (z licznikiem), bo 50 pozycji pod rząd
 * to za długa rolka; na szerokim wszystko stoi w kolumnach.
 */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Otwiera wyszukiwarkę — spis zamyka się sam, żeby nie zostały dwie warstwy. */
  onSearch: () => void;
}

const NAJCZESCIEJ = [
  { label: "Kalkulator solanki", href: "/kalkulator-solanki" },
  { label: "Baza kultur", href: "/baza-kultur" },
  { label: "Kalkulator pasz (drób)", href: "/kalkulator-pasz" },
];

const SpisTresci = ({ open, onOpenChange, onSearch }: Props) => {
  const [rozwiniete, setRozwiniete] = useState<string[]>([]);

  const grupy = navItems.filter((i) => i.children);
  const pojedyncze = navItems.filter((i) => !i.children);
  const liczbaStron = grupy.reduce((n, g) => n + (g.children?.length ?? 0), 0) + pojedyncze.length;

  // Escape zamyka, a tło nie przewija się pod spodem.
  useEffect(() => {
    if (!open) return;
    const naKlawisz = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", naKlawisz);
    const poprzedni = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", naKlawisz);
      document.body.style.overflow = poprzedni;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const przelacz = (label: string) =>
    setRozwiniete((p) => (p.includes(label) ? p.filter((l) => l !== label) : [...p, label]));

  return (
    <div
      className="fixed inset-0 z-[60] bg-background overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Spis treści serwisu"
    >
      <div className="container mx-auto px-4 sm:px-6 py-5 max-w-7xl">
        {/* Nagłówek */}
        <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-double border-[hsl(var(--rule-strong))] pb-3">
          <h2 className="font-display text-2xl md:text-3xl text-foreground">Spis treści</h2>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--kicker))]">
              {liczbaStron} stron w {grupy.length} działach
            </span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Zamknij spis treści">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Szukajka — zawsze na wierzchu, bo bywa szybsza niż spis */}
        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
            onSearch();
          }}
          className="mt-5 w-full flex items-center gap-3 border border-[hsl(var(--rule-strong))] bg-card px-4 h-12 text-left text-muted-foreground hover:bg-secondary/60 transition-colors"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="text-sm">Szukaj wśród {liczbaStron} stron…</span>
        </button>

        {/* Działy: kolumny na szerokim ekranie, zwijane na wąskim */}
        <div className="mt-7 lg:columns-3 xl:columns-4 lg:gap-9">
          {grupy.map((grupa) => {
            const otwarty = rozwiniete.includes(grupa.label);
            return (
              <div key={grupa.label} className="mb-7 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => przelacz(grupa.label)}
                  aria-expanded={otwarty}
                  className="w-full flex items-center justify-between gap-3 border-b-[1.5px] border-foreground pb-1.5 mb-2 text-left lg:cursor-default min-h-[44px] lg:min-h-0"
                >
                  <span className="font-display text-lg text-foreground">{grupa.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--kicker))]">
                      {grupa.children?.length}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 opacity-60 transition-transform lg:hidden ${otwarty ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>

                <div className={`${otwarty ? "block" : "hidden"} lg:block`}>
                  {grupa.children?.map((poz) => (
                    <a
                      key={poz.href}
                      href={poz.href}
                      onClick={() => onOpenChange(false)}
                      className="block border-b border-[hsl(var(--rule))]/60 py-2.5 lg:py-1.5 pl-3 lg:pl-0 text-sm leading-snug text-foreground/80 hover:text-primary transition-colors min-h-[44px] lg:min-h-0 flex items-center"
                    >
                      {poz.label}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Strony bez działu */}
          <div className="mb-7 break-inside-avoid">
            <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-foreground pb-1.5 mb-2">
              <span className="font-display text-lg text-foreground">Pozostałe</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--kicker))]">
                {pojedyncze.length}
              </span>
            </div>
            {pojedyncze.map((poz) => (
              <a
                key={poz.href}
                href={poz.href}
                onClick={() => onOpenChange(false)}
                className="block border-b border-[hsl(var(--rule))]/60 py-2.5 lg:py-1.5 pl-3 lg:pl-0 text-sm leading-snug text-foreground/80 hover:text-primary transition-colors min-h-[44px] lg:min-h-0 flex items-center"
              >
                {poz.label}
              </a>
            ))}

            {/* Skrót utylitarny — to są realne szczyty ruchu serwisu */}
            <div className="mt-6 border border-[hsl(var(--rule))] bg-card p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--kicker))] mb-3">
                Najczęściej otwierane
              </div>
              <div className="flex flex-col">
                {NAJCZESCIEJ.map((poz) => (
                  <a
                    key={poz.href}
                    href={poz.href}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center justify-between py-2 text-sm text-foreground hover:text-primary transition-colors min-h-[44px] lg:min-h-0"
                  >
                    {poz.label}
                    <span aria-hidden="true">›</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpisTresci;
