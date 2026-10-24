import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HeroSearch from "@/components/HeroSearch";
import PopularnePrzepisy from "@/components/strona-glowna/PopularnePrzepisy";
import { NOWE_W_SERWISIE, dataPL } from "@/data/noweWSerwisie";
import { recipesData } from "@/data/recipesData";
import obrazDojrzewalnia from "@/assets/hero-dojrzewalnia.webp";
import obrazMozzarella from "@/assets/mozzarella.webp";
import obrazPrawo from "@/assets/prawo-header.webp";
import obrazKury from "@/assets/kury-wybieg.webp";

/**
 * Strona główna według makiety A „Co chcesz dziś zrobić?” (decyzja Marka 24.10.2026,
 * makiety na kanwie „Strona główna: makiety”).
 *
 * DLACZEGO TAK: stara strona była spisem treści. Liczby i hasło „największa baza”
 * nie mówiły, co tu zrobię, karuzela miała warsztaty z lutego 2025 i angielskie
 * newsy, liczniki „1 serowarnia” i „1 polubienie” wyglądały pusto, a pasz (15–21%
 * wejść z Google) nie było wcale. Teraz: pytanie, wyszukiwarka, trzy drzwi dla
 * trzech grup ludzi, czat, najczęściej czytane przepisy i świeże nowości.
 *
 * Boty i Google dostają mirror public/index-mirror.html, więc nagłówek H1 dla ludzi
 * mógł zmienić się na pytanie bez wpływu na wyniki wyszukiwania.
 */

const CZESTO_SZUKANE = [
  { etykieta: "mozzarella", href: "/przepisy/mozzarella" },
  { etykieta: "twaróg", href: "/przepisy/twarog" },
  { etykieta: "camembert", href: "/przepisy/camembert" },
  { etykieta: "kury nie niosą", href: "/pasze/kury-nie-niosa" },
  { etykieta: "etykieta RHD", href: "/etykieta-rhd" },
];

const DRZWI = [
  {
    tytul: "Zrób pierwszy ser",
    opis: "Mozzarella, twaróg, camembert: przepisy z temperaturami, czasami i kulturą, którą kupisz w polskim sklepie.",
    obraz: obrazMozzarella,
    alt: "Świeża mozzarella",
    pozycja: "object-center",
    linki: [
      { etykieta: "Mozzarella krok po kroku", href: "/przepisy/mozzarella" },
      { etykieta: "Jaka kultura do jakiego sera", href: "/baza-kultur" },
      { etykieta: `Wszystkie przepisy (${recipesData.length})`, href: "/przepisy" },
    ],
  },
  {
    tytul: "Sprzedawaj legalnie",
    opis: "RHD i MOL po ludzku: co zgłosić, jaką etykietę dać na ser i jak wystawić fakturę VAT RR.",
    obraz: obrazPrawo,
    alt: "Kostki sera, dokumenty i waga",
    pozycja: "object-[70%_center]",
    linki: [
      { etykieta: "RHD krok po kroku", href: "/prawo/rhd" },
      { etykieta: "Generator etykiety RHD", href: "/etykieta-rhd" },
      { etykieta: "Faktura VAT RR", href: "/faktura-vat-rr" },
    ],
  },
  {
    tytul: "Karm kury",
    opis: "Kalkulator pasz z normami dla niosek, brojlerów, kaczek, gęsi i indyków. Policzy też, ile paszy kupić na miesiąc.",
    obraz: obrazKury,
    alt: "Kury na wybiegu przy stodole",
    // Przycięty dół obrazka z kalkulatora: u góry ma wtopiony napis „Kalkulator Pasz dla Drobiu”.
    pozycja: "object-center",
    linki: [
      { etykieta: "Kalkulator pasz", href: "/kalkulator-pasz" },
      { etykieta: "Kury nie niosą? Dlaczego", href: "/pasze/kury-nie-niosa" },
      { etykieta: "Resztki z kuchni dla kur", href: "/pasze/resztki-z-kuchni" },
    ],
  },
];

const CZATY = [
  { nazwa: "ChatGPT", href: "/asystenci-ai#chatgpt" },
  { nazwa: "Claude", href: "/asystenci-ai" },
  { nazwa: "Perplexity", href: "/asystenci-ai#perplexity" },
];

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <main data-hero className="pt-16 lg:pt-0" role="main">
      <div className="container mx-auto flex max-w-6xl flex-col gap-14 px-4 pb-16 pt-8 sm:px-6 md:gap-16 md:pt-12">
        {/* ── Pytanie i wyszukiwarka ─────────────────────────────────── */}
        <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10" aria-labelledby="pytanie">
          <div className="flex min-w-0 flex-col gap-4 md:gap-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Moja Serowarnia</p>
            <h1 id="pytanie" className="font-display text-[clamp(2.4rem,6vw,3.7rem)] leading-[1.06] text-foreground">
              Co chcesz dziś zrobić?
            </h1>
            <p className="text-lg leading-relaxed text-foreground/80">
              Przepisy na sery krok po kroku, kultury z polskich sklepów, kalkulator pasz dla kur i prawo dla małego
              gospodarstwa. Za darmo i bez zakładania konta.
            </p>
            <HeroSearch className="max-w-none" poleClassName="h-[52px] rounded-lg border border-border bg-card shadow-none" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Często szukane:</span>
              {CZESTO_SZUKANE.map((c) => (
                <Link
                  key={c.href}
                  to={c.href}
                  className="inline-flex min-h-[40px] items-center rounded-full border border-border bg-card px-4 text-sm text-foreground no-underline transition-colors hover:border-primary hover:text-primary"
                >
                  {c.etykieta}
                </Link>
              ))}
            </div>
          </div>
          <img
            src={obrazDojrzewalnia}
            alt="Dojrzewalnia z kręgami sera na drewnianych półkach"
            width={1200}
            height={675}
            // Na telefonie bez zdjęcia: spychało trzy karty (z własnymi zdjęciami) o cały ekran w dół.
            className="hidden h-72 w-full rounded-2xl object-cover sm:block lg:h-[400px]"
          />
        </section>

        {/* ── Trzy drzwi ──────────────────────────────────────────────── */}
        <section className="flex flex-col gap-5" aria-labelledby="drzwi">
          <h2 id="drzwi" className="font-display text-3xl text-foreground md:text-[2.1rem]">Wybierz, od czego zaczynasz</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {DRZWI.map((d) => (
              <article key={d.tytul} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <img src={d.obraz} alt={d.alt} loading="lazy" className={`h-48 w-full object-cover md:h-52 ${d.pozycja}`} />
                <div className="flex flex-grow flex-col gap-3 p-6">
                  <h3 className="font-display text-[1.7rem] leading-tight text-foreground">{d.tytul}</h3>
                  <p className="leading-relaxed text-foreground/80">{d.opis}</p>
                  <ul className="mt-1 flex flex-col gap-2.5">
                    {d.linki.map((l) => (
                      <li key={l.href}>
                        <Link to={l.href} className="font-bold text-primary no-underline hover:underline">
                          {l.etykieta} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Czat ─────────────────────────────────────────────────────── */}
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-accent p-7 text-accent-foreground md:p-8" aria-labelledby="czat">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-1.5">
            <h2 id="czat" className="font-display text-[1.75rem]">Wolisz zapytać czat?</h2>
            <p className="leading-relaxed opacity-90">
              Podłącz serwis do swojego ChatGPT, Claude albo Perplexity. Czat policzy paszę i znajdzie kulturę na
              naszych danych.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {CZATY.map((c) => (
              <Link
                key={c.nazwa}
                to={c.href}
                state={{ z: "/" }}
                className="inline-flex min-h-[46px] items-center rounded-lg bg-background px-5 font-bold text-foreground no-underline transition-opacity hover:opacity-90"
              >
                {c.nazwa}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Najczęściej czytane przepisy ───────────────────────────── */}
        <section className="flex flex-col gap-5" aria-labelledby="przepisy">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="przepisy" className="font-display text-3xl text-foreground md:text-[2.1rem]">Najczęściej czytane przepisy</h2>
            <Link to="/przepisy" className="font-bold text-primary no-underline hover:underline">Wszystkie przepisy →</Link>
          </div>
          <PopularnePrzepisy />
        </section>

        {/* ── Nowe w serwisie ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-3 border-t border-border pt-7" aria-labelledby="nowe">
          <h2 id="nowe" className="font-display text-[1.75rem] text-foreground">Nowe w serwisie</h2>
          <ul className="flex flex-col">
            {NOWE_W_SERWISIE.slice(0, 4).map((n) => (
              <li key={n.href} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border/60 py-3.5">
                <span className="min-w-[96px] text-sm text-muted-foreground">{dataPL(n.data)}</span>
                <Link to={n.href} className="text-[1.05rem] font-bold text-primary no-underline hover:underline">
                  {n.tytul}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/wiadomosci" className="mt-1 text-sm text-muted-foreground underline underline-offset-2 hover:text-primary">
            Wiadomości ze świata serowarstwa
          </Link>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Index;
