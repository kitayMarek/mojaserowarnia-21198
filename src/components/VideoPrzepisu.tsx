import { useState } from "react";
import { Play } from "lucide-react";

interface VideoPrzepisuProps {
  youtubeId: string;
  title: string;
  channel: string;
  /** Zdjęcie sera — służy za tło przed kliknięciem, więc nie pobieramy miniatury z Google. */
  poster: string;
}

/**
 * Osadzenie filmu z YouTube metodą fasady: dopóki użytkownik nie kliknie,
 * strona NIE wysyła żadnego żądania do Google — ani po skrypt odtwarzacza,
 * ani po miniaturę. Ma to dwa skutki:
 *  - wydajność: surowy iframe to ~1,5 MB pobierane przy każdym wejściu na przepis,
 *    tutaj 0 B, dopóki ktoś faktycznie nie chce obejrzeć,
 *  - prywatność: YouTube nie widzi IP odwiedzającego bez jego decyzji (RODO).
 * Po kliknięciu ładujemy youtube-nocookie.com, który nie zakłada ciasteczek
 * śledzących do momentu odtworzenia.
 */
const VideoPrzepisu = ({ youtubeId, title, channel, poster }: VideoPrzepisuProps) => {
  const [wlaczony, setWlaczony] = useState(false);

  if (wlaczony) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg bg-black aspect-video">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setWlaczony(true)}
        aria-label={`Odtwórz film: ${title}`}
        className="group relative block w-full overflow-hidden rounded-lg aspect-video focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-black/50 transition-colors group-hover:bg-black/40" />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="h-7 w-7 translate-x-0.5 fill-primary text-primary" />
          </span>
          <span className="text-base font-semibold text-white drop-shadow-md sm:text-lg">
            {title}
          </span>
        </span>
      </button>
      <p className="mt-3 text-sm text-muted-foreground">
        Film zewnętrzny, kanał <strong className="font-medium text-foreground">{channel}</strong>.
        Wczytuje się z YouTube dopiero po kliknięciu — do tego momentu strona nie łączy się z Google.
      </p>
    </div>
  );
};

export default VideoPrzepisu;
