import { useNews } from "@/hooks/useNews";
import { Newspaper, ExternalLink } from "lucide-react";

/**
 * Pełna lista wiadomości — dział, a nie rotator.
 *
 * Rotator przeniósł się na stronę główną, gdzie trafia do wszystkich
 * odwiedzających. Tutaj potrzebna była lista: da się ją przejrzeć wzrokiem,
 * porównać daty i wrócić do czegoś sprzed tygodnia — czego karuzela pokazująca
 * sześć pozycji po kolei nie umożliwia.
 *
 * Pozycje pochodzą z tego samego źródła co baner: banery redakcyjne z Supabase
 * plus kanały RSS zebrane lokalnie do /wiadomosci.json.
 */

const formatujDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const jestZewnetrzny = (url: string) => /^https?:\/\//.test(url) && !url.includes("mojaserowarnia.pl");

const ListaWiadomosci = () => {
  const { banners, loading, error } = useNews();

  if (loading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-label="Wczytywanie wiadomości">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (error || banners.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Brak wiadomości do wyświetlenia. Zajrzyj za kilka dni.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {banners.map((w) => {
        const zewnetrzny = jestZewnetrzny(w.linkUrl);
        return (
          <li key={w.id} className="py-5 first:pt-0">
            <a
              href={w.linkUrl}
              target={zewnetrzny ? "_blank" : undefined}
              rel={zewnetrzny ? "noopener noreferrer" : undefined}
              className="group flex gap-4"
            >
              {w.imageUrl ? (
                <img
                  src={w.imageUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="hidden h-24 w-32 shrink-0 rounded-lg object-cover sm:block"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="hidden h-24 w-32 shrink-0 items-center justify-center rounded-lg bg-primary/5 sm:flex"
                >
                  <Newspaper className="h-7 w-7 text-primary/40" />
                </span>
              )}

              <span className="min-w-0 flex-1">
                <time
                  dateTime={w.date}
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {formatujDate(w.date)}
                </time>
                <span className="block font-semibold leading-snug text-foreground group-hover:text-accent group-hover:underline">
                  {w.title}
                  {zewnetrzny && (
                    <ExternalLink className="ml-1 inline h-3.5 w-3.5 align-baseline text-muted-foreground" aria-hidden="true" />
                  )}
                </span>
                {w.subtitle && (
                  <span className="mt-1 block max-w-[75ch] text-sm leading-relaxed text-muted-foreground">
                    {w.subtitle}
                  </span>
                )}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default ListaWiadomosci;
