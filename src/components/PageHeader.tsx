import { type LucideIcon } from "lucide-react";

/**
 * Nagłówek podstrony w kierunku „almanach".
 *
 * Zamiast kolorowego kafla z gradientem: podwójna linijka u góry, kreska w
 * kolorze działu, tytuł szeryfowy i cienka linijka domykająca. Kolor działu
 * ZOSTAJE — to realna pomoc w orientacji (te same barwy ma sidebar) — ale
 * schodzi do roli akcentu zamiast tła.
 *
 * API bez zmian, więc żadna podstrona nie wymaga edycji.
 */
const BANDS = {
  amber: { kreska: "bg-amber-500/80", ikona: "text-amber-600 dark:text-amber-400" },
  emerald: { kreska: "bg-emerald-500/80", ikona: "text-emerald-600 dark:text-emerald-400" },
  sky: { kreska: "bg-sky-500/80", ikona: "text-sky-600 dark:text-sky-400" },
  violet: { kreska: "bg-violet-500/80", ikona: "text-violet-600 dark:text-violet-400" },
  rose: { kreska: "bg-rose-500/80", ikona: "text-rose-600 dark:text-rose-400" },
  cyan: { kreska: "bg-cyan-500/80", ikona: "text-cyan-600 dark:text-cyan-400" },
  teal: { kreska: "bg-teal-500/80", ikona: "text-teal-600 dark:text-teal-400" },
} as const;

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  color?: keyof typeof BANDS;
}

const PageHeader = ({ icon: Icon, title, subtitle, color = "amber" }: PageHeaderProps) => {
  const c = BANDS[color];
  return (
    <header className="pt-1 pb-5 border-b border-[hsl(var(--rule))]">
      <hr className="border-0 border-t-[3px] border-double border-[hsl(var(--rule-strong))] mb-5" />

      <div className="flex items-center gap-3 mb-3">
        <span className={`h-[3px] w-10 shrink-0 ${c.kreska}`} aria-hidden="true" />
        {Icon && <Icon className={`h-[18px] w-[18px] shrink-0 ${c.ikona}`} aria-hidden="true" />}
      </div>

      <h1 className="font-display text-3xl md:text-[2.6rem] leading-[1.15] text-foreground">
        {title}
      </h1>

      {subtitle && (
        <p className="text-base md:text-lg text-muted-foreground mt-3 leading-relaxed max-w-3xl">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default PageHeader;
