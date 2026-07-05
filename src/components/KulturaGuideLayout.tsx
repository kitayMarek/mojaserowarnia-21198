import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { FlaskConical, ArrowRight, Database, type LucideIcon } from "lucide-react";

interface RelatedLink {
  label: string;
  href: string;
  external?: boolean;
}

interface KulturaGuideLayoutProps {
  title: string;
  subtitle: string;
  breadcrumb: { label: string; href?: string }[];
  metaTitle: string;
  metaDescription: string;
  icon?: LucideIcon;
  /** Typ kultury w bazie (culture.type) — jeśli podany, pokazuje przycisk do przefiltrowanej Bazy kultur (React). */
  bazaType?: string;
  bazaCtaLabel?: string;
  children: ReactNode;
  related?: RelatedLink[];
}

// Wspólny layout dla React-owych stron sekcji "Kultury" (człowiek dostaje pełny artykuł
// w stylu serwisu + lewy sidebar; statyczne mirrory public/kultury/*.html zostają dla botów).
const KulturaGuideLayout = ({
  title,
  subtitle,
  breadcrumb,
  metaTitle,
  metaDescription,
  icon = FlaskConical,
  bazaType,
  bazaCtaLabel,
  children,
  related,
}: KulturaGuideLayoutProps) => {
  useEffect(() => {
    document.title = metaTitle;
    const m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute("content", metaDescription);
  }, [metaTitle, metaDescription]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageBreadcrumbs items={breadcrumb} />
      <main className="pt-20">
        <article className="container mx-auto px-4 py-8 max-w-3xl">
          <PageHeader icon={icon} color="amber" title={title} subtitle={subtitle} />

          {bazaType && (
            <div className="mt-6">
              <Button
                asChild
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-warm"
              >
                <Link to={`/baza-kultur?type=${bazaType}`}>
                  <Database className="h-4 w-4 mr-2" />
                  {bazaCtaLabel || "Przeglądaj te kultury w bazie"}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none mt-8 prose-headings:font-display prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground">
            {children}
          </div>

          {related && related.length > 0 && (
            <div className="mt-10 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-6">
              <h2 className="text-lg font-display font-bold mb-3 text-foreground">Powiązane strony</h2>
              <ul className="space-y-2 text-sm">
                {related.map((r) =>
                  r.external ? (
                    <li key={r.href}>
                      <a href={r.href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        {r.label}
                      </a>
                    </li>
                  ) : (
                    <li key={r.href}>
                      <Link to={r.href} className="text-primary hover:underline">
                        {r.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default KulturaGuideLayout;
