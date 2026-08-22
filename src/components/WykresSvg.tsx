/**
 * Wykres SVG osadzony INLINE w dokumencie.
 *
 * DLACZEGO NIE <img src="...svg">: wtedy przeglądarka pokazałaby obrazek, ale
 * bot nie odczytałby z niego ani jednej liczby. Osadzony inline SVG jest
 * jednocześnie grafiką i tekstem — etykiety, wartości, <title> i <desc>
 * siedzą w DOM, więc Google i crawlery LLM czytają je jak zwykłą treść.
 *
 * To jedyna forma wizualna, która nie kosztuje nas cytowań. PNG zostaje do
 * udostępniania i Open Graph, gdzie tekstu i tak nikt nie czyta.
 *
 * Źródło: src/generated/wykresySvg.ts — generowane przez scripts/gen-svg.py
 * z danych bazy, więc wykresy przeliczają się przy każdej zmianie kultur.
 */

interface Props {
  /** Gotowy znacznik SVG z modułu wykresySvg. */
  svg: string;
  /** Podpis pod wykresem — widoczny, bo nie każdy czyta <desc>. */
  podpis?: string;
  className?: string;
}

const WykresSvg = ({ svg, podpis, className }: Props) => (
  <figure className={"not-prose my-6 " + (className ?? "")}>
    <div
      className="[&>svg]:w-full [&>svg]:h-auto"
      // Treść pochodzi z naszego generatora, nie z danych użytkownika.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
    {podpis && (
      <figcaption className="mt-2 text-sm text-muted-foreground">{podpis}</figcaption>
    )}
  </figure>
);

export default WykresSvg;
