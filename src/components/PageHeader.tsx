import { type LucideIcon } from "lucide-react";

// Czysty, kolorowy nagłówek strony w stylu lewego sidebara (kolorowy chip z ikoną + tytuł).
// Zastępuje amatorskie grafiki-clipart na stronach prawnych/informacyjnych.
const BANDS = {
  amber: { band: "from-amber-500/10 border-amber-500/20", chip: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" },
  emerald: { band: "from-emerald-500/10 border-emerald-500/20", chip: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" },
  sky: { band: "from-sky-500/10 border-sky-500/20", chip: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400" },
  violet: { band: "from-violet-500/10 border-violet-500/20", chip: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400" },
  rose: { band: "from-rose-500/10 border-rose-500/20", chip: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" },
  cyan: { band: "from-cyan-500/10 border-cyan-500/20", chip: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400" },
  teal: { band: "from-teal-500/10 border-teal-500/20", chip: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400" },
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
    <header className={`rounded-2xl border bg-gradient-to-br to-transparent p-6 md:p-8 ${c.band}`}>
      <div className="flex items-center gap-4">
        {Icon && (
          <span className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center ${c.chip}`}>
            <Icon className="h-7 w-7" />
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default PageHeader;
