// Jedna lista dla calej nawigacji: sidebar i pelnoekranowy "Spis tresci"
// czytaja ten sam obiekt, wiec nowa strona pojawia sie w obu miejscach naraz.
import {
  FlaskConical, ChefHat, GraduationCap, Calculator, Scale, Newspaper, ClipboardList, Mail, ScrollText, Wheat, Store, Milk,
  type LucideIcon,
} from "lucide-react";
import { mleczneProdukty, sciezkaMlecznegoProduktu } from "@/data/mleczneProdukty";

// Kolory pozycji — pełne klasy (Tailwind nie może budować ich dynamicznie).
export const COLORS = {
  amber: { sq: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400", hover: "hover:bg-amber-50 dark:hover:bg-amber-500/10" },
  rose: { sq: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400", hover: "hover:bg-rose-50 dark:hover:bg-rose-500/10" },
  sky: { sq: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400", hover: "hover:bg-sky-50 dark:hover:bg-sky-500/10" },
  violet: { sq: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400", hover: "hover:bg-violet-50 dark:hover:bg-violet-500/10" },
  emerald: { sq: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400", hover: "hover:bg-emerald-50 dark:hover:bg-emerald-500/10" },
  cyan: { sq: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400", hover: "hover:bg-cyan-50 dark:hover:bg-cyan-500/10" },
  teal: { sq: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400", hover: "hover:bg-teal-50 dark:hover:bg-teal-500/10" },
  slate: { sq: "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300", hover: "hover:bg-slate-100 dark:hover:bg-slate-500/10" },
  lime: { sq: "bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-400", hover: "hover:bg-lime-50 dark:hover:bg-lime-500/10" },
} as const;

export type NavLeaf = { label: string; href: string };
export type NavItem = { label: string; href?: string; icon: LucideIcon; color: keyof typeof COLORS; children?: NavLeaf[] };

export const navItems: NavItem[] = [
  {
    label: "Kultury serowarskie", icon: FlaskConical, color: "amber",
    children: [
      { label: "Baza kultur", href: "/baza-kultur" },
      { label: "Porównywarka kultur", href: "/porownywarka-kultur" },
      { label: "Zamienniki kultur", href: "/zamienniki-kultur" },
      { label: "Producenci kultur", href: "/kto-produkuje-kultury" },
      { label: "Bakterie i kultury", href: "/bakterie-kultury" },
      { label: "Kultury mezofilne", href: "/kultury/mezofilne" },
      { label: "Kultury termofilne", href: "/kultury/termofilne" },
      { label: "Kultury jogurtowe", href: "/kultury/jogurtowe" },
      { label: "Sery wege", href: "/sery-wege" },
      { label: "Moje listy", href: "/moje-listy" },
    ],
  },
  {
    label: "Serowarstwo Staropolskie", icon: ScrollText, color: "amber",
    children: [
      { label: "O dziale", href: "/serowarstwo-staropolskie" },
      { label: "Klasyka serowarstwa", href: "/klasyka-serowarstwa" },
      { label: "9 warunków Kleckiego", href: "/klecki-jakosc-mleka" },
      { label: "Encyklopedia rolnicza", href: "/encyklopedia-serowarstwo" },
      { label: "Jan Licznerski", href: "/licznerski" },
      { label: "Mleko wg Licznerskiego", href: "/licznerski-mleko" },
      { label: "Rodzaje serów wg Licznerskiego", href: "/licznerski-sery" },
    ],
  },
  {
    label: "Przepisy na sery", icon: ChefHat, color: "rose",
    children: [
      { label: "Przepisy na sery", href: "/przepisy" },
      { label: "Przepisy kulinarne", href: "/przepisy-kulinarne" },
      { label: "Słownik serowarski", href: "/slownik" },
    ],
  },
  {
    // Osobny dzial, bo to nie sery podpuszczkowe: bez podpuszczki i bez dojrzewalni.
    // Dotad te cztery przepisy istnialy tylko jako kafelki pod cala siatka na
    // /przepisy — serek homogenizowany mial JEDEN link w calej aplikacji.
    // Pozycje pochodza z data/mleczneProdukty.ts, zeby menu i kafelki nie rozjechaly
    // sie przy dodaniu wariantu.
    label: "Mleczne przetwory", icon: Milk, color: "cyan",
    children: mleczneProdukty.map((p) => ({
      label: p.label,
      href: sciezkaMlecznegoProduktu(p.slug),
    })),
  },
  {
    label: "Poradniki", icon: GraduationCap, color: "sky",
    children: [
      { label: "Poradnik główny", href: "/poradnik" },
      { label: "Organizacja serowarni", href: "/organizacja-serowarni" },
      { label: "Wędzenie sera", href: "/wedzenie-sera" },
      { label: "Woskowanie sera", href: "/woskowanie-sera" },
      { label: "Dojrzewalnia do sera", href: "/dojrzewalnia-z-lodowki" },
      { label: "Solenie sera", href: "/solenie-sera" },
      { label: "Siła podpuszczki", href: "/sila-podpuszczki" },
      { label: "Chlorek wapnia do mleka", href: "/chlorek-wapnia-do-mleka" },
      { label: "Gdzie kupić podpuszczkę", href: "/gdzie-kupic-podpuszczke" },
      { label: "Wszystkie poradniki", href: "/poradniki" },
    ],
  },
  {
    label: "Narzędzia", icon: Calculator, color: "violet",
    children: [
      { label: "Kalkulator Beaugel", href: "/kalkulator-beaugel" },
      { label: "Kalkulator kosztu sera", href: "/kalkulator-kosztu-sera" },
      { label: "Kalkulator miar", href: "/kalkulator-miar" },
      { label: "Kalkulator solanki", href: "/kalkulator-solanki" },
      { label: "Wartości odżywcze serów", href: "/porownanie-wartosci-odzywczych" },
      { label: "Etykieta RHD", href: "/etykieta-rhd" },
      { label: "Faktura VAT RR", href: "/faktura-vat-rr" },
      { label: "Wszystkie narzędzia", href: "/narzedzia" },
    ],
  },
  {
    label: "Pasze i zwierzęta", icon: Wheat, color: "lime",
    children: [
      { label: "Przegląd działu", href: "/pasze" },
      { label: "Mleko do sera", href: "/mleko-do-sera" },
      { label: "Wady mleka a wady sera", href: "/wady-mleka-a-wady-sera" },
      { label: "Kalkulator pasz (drób)", href: "/kalkulator-pasz" },
      { label: "Kalkulator pasz (bydło)", href: "/kalkulator-pasz-bydlo" },
      { label: "Serwatka dla zwierząt", href: "/serwatka-dla-zwierzat" },
      { label: "Nieudany ser — co z nim zrobić", href: "/nieudany-ser" },
    ],
  },
  {
    label: "Prawo i RHD", icon: Scale, color: "emerald",
    children: [
      { label: "RHD – Rolniczy Handel Detaliczny", href: "/prawo/rhd" },
      { label: "Dokumenty RHD", href: "/prawo/rhd/dokumenty" },
      { label: "MOL – działalność MOL", href: "/prawo/mol" },
      { label: "Dokumenty MOL", href: "/prawo/mol/dokumenty" },
      { label: "Akty prawne UE", href: "/prawo/akty-prawne-ue" },
      { label: "Rzeźnia rolnicza", href: "/prawo/rzeznia-rolnicza" },
      { label: "Wszystko o prawie", href: "/prawo" },
    ],
  },
  { label: "Serowarnie w Polsce", href: "/serowarnie", icon: Store, color: "emerald" },
  { label: "Wiadomości", href: "/wiadomosci", icon: Newspaper, color: "cyan" },
  { label: "Ewidencja RHD", href: "/system-ewidencji", icon: ClipboardList, color: "teal" },
  { label: "Kontakt", href: "/kontakt", icon: Mail, color: "slate" },
];

