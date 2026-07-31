import { AlertTriangle, Skull, HeartPulse } from "lucide-react";

/**
 * Ostrzeżenie o soli — sód jest dla drobiu NIEZBĘDNY, a jednocześnie
 * drób należy do najwrażliwszych na przesolenie zwierząt gospodarskich.
 * W gospodarstwie z serowarnią to ryzyko realne: solanka po soleniu sera
 * to najbardziej skoncentrowane źródło soli, jakie tam występuje.
 *
 * Komponent współdzielony przez /pasze, /serwatka-dla-zwierzat i /nieudany-ser,
 * żeby liczby były wszędzie identyczne.
 */
const OstrzezenieSol = ({ kontekst = "ogolny" }: { kontekst?: "ogolny" | "serwatka" | "ser" }) => {
  const kontekstowe = {
    ogolny:
      "W gospodarstwie z serowarnią sól jest wszędzie: w solance, w serwatce z serów solonych w masie, w obcinkach skórki i w samym serze.",
    serwatka:
      "Solanka po soleniu sera to najbardziej skoncentrowane źródło soli w całym gospodarstwie — groźniejsze niż cokolwiek innego, co masz pod ręką.",
    ser:
      "Ser zawiera zwykle 1,5–2% soli. Przy jednorazowym przysmaku to nic, ale przy regularnym dokarmianiu resztkami sól się sumuje.",
  }[kontekst];

  return (
    <div className="rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/30 overflow-hidden my-6">
      <div className="bg-red-600 text-white px-4 py-2.5 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <h3 className="font-bold text-base leading-tight">
          Sól — dla drobiu konieczna i zabójcza jednocześnie
        </h3>
      </div>

      <div className="p-4 space-y-4 text-sm">
        <p className="font-medium">{kontekstowe}</p>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-background/70 rounded-lg p-3 border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2 font-semibold mb-1 text-emerald-700 dark:text-emerald-400">
              <HeartPulse className="h-4 w-4" />
              Potrzebna
            </div>
            <p className="mb-1">
              Około <strong>0,3% NaCl</strong> w mieszance, czyli <strong>3 g na 1 kg paszy</strong>.
              Sód odpowiada za przewodnictwo nerwowe, gospodarkę wodną i apetyt.
            </p>
            <p className="text-muted-foreground">
              Niedobór: gorsze przyrosty, spadek nieśności oraz — podobnie jak przy braku
              metioniny — <strong>kanibalizm i wydziobywanie piór</strong>.
            </p>
          </div>

          <div className="bg-background/70 rounded-lg p-3 border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2 font-semibold mb-1 text-red-700 dark:text-red-400">
              <Skull className="h-4 w-4" />
              Zabójcza
            </div>
            <p className="mb-1">
              Drób należy do <strong>najwrażliwszych na sól</strong> zwierząt gospodarskich.
              Orientacyjnie już <strong>3–4 g NaCl na kilogram masy ciała</strong> może być dawką
              śmiertelną.
            </p>
            <p className="text-muted-foreground">
              <strong>Pisklęta są wielokrotnie wrażliwsze</strong> od ptaków dorosłych.
            </p>
          </div>
        </div>

        <div className="bg-red-600 text-white rounded-lg p-4">
          <p className="font-bold mb-2">Przeliczenie, które to unaocznia:</p>
          <ul className="space-y-1.5">
            <li>
              Solanka serowarska 20% zawiera <strong>200 g soli w 1 litrze</strong>.
            </li>
            <li>
              Prawidłowo zbilansowana pasza zawiera <strong>3 g soli w 1 kg</strong>.
            </li>
            <li className="pt-1.5 border-t border-white/30">
              → <strong>1 litr solanki niesie tyle soli, co około 66 kg paszy.</strong>
            </li>
            <li>
              → Dla kury o masie 2 kg dawka potencjalnie śmiertelna to ok. 6–8 g NaCl, czyli{" "}
              <strong>zaledwie 30–40 ml solanki</strong> — kilka łyżek.
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold mb-1">Objawy zatrucia solą:</p>
          <p className="text-muted-foreground">
            wzmożone pragnienie → wodniste odchody i mokra ściółka → niezborność ruchów,
            osłabienie nóg → drgawki → śmierć. Pierwszy sygnał bywa mylony ze zwykłą biegunką.
          </p>
        </div>

        <div className="bg-background/70 rounded-lg p-3 border border-red-200 dark:border-red-900">
          <p className="font-semibold mb-1">Co chroni, a co zabija:</p>
          <p className="mb-2">
            <strong>Stały dostęp do czystej wody drastycznie zmniejsza ryzyko</strong> — zatrucie
            solą jest najgroźniejsze przy ograniczonym pojeniu. Nigdy nie zestawiaj słonego
            dodatku z brakiem wody.
          </p>
          <p className="font-semibold text-red-700 dark:text-red-400">
            Zasada dla serowara: wszystko, co miało kontakt z soleniem — solanka, serwatka z serów
            solonych w masie, obcinki solonej skórki — idzie do utylizacji, nie do kurnika.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OstrzezenieSol;
