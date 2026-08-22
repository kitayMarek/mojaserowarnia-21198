/**
 * Cena kultury z kontekstem, bez którego sama kwota nic nie znaczy.
 *
 * DLACZEGO TO ISTNIEJE: baza podawała samą cenę. Przy opakowaniach od 5 do 5000
 * litrów mleka „15 zł" i „15 zł" to dwie zupełnie różne oferty — dopiero cena
 * za litr pozwala je porównać. Sprawdzone 2026-08-22 na wszystkich 188 pozycjach.
 *
 * TRZY RZECZY NARAZ:
 *   • cena brutto (ujednolicona — jeden sklep miał w bazie netto)
 *   • na ile litrów starcza opakowanie i ile to wychodzi za litr
 *   • poprzednia cena, jeśli się zmieniła
 *
 * BRAK DANYCH pokazujemy jako „?", nie „—". Myślnik czyta się jak „nie dotyczy",
 * a tu chodzi o „sklep tego nie podaje" i to jest istotna różnica dla kupującego.
 */

interface Props {
  cena?: string | null;
  cenaLiczbowo?: number | null;
  cenaPoprzednia?: number | null;
  litry?: number | null;
  /** Kompaktowo — do wąskich kolumn w tabeli. */
  waski?: boolean;
}

function zlotePerLitr(cena: number, litry: number): string {
  const v = cena / litry;
  // Przy dużych opakowaniach wychodzą grosze — pokazujemy tyle miejsc, ile ma sens.
  if (v < 0.1) return v.toFixed(3).replace(".", ",");
  return v.toFixed(2).replace(".", ",");
}

const CenaKultury = ({ cena, cenaLiczbowo, cenaPoprzednia, litry, waski }: Props) => {
  const maPrzelicznik = typeof cenaLiczbowo === "number" && typeof litry === "number" && litry > 0;
  const zmiana =
    typeof cenaPoprzednia === "number" && typeof cenaLiczbowo === "number"
      ? cenaLiczbowo - cenaPoprzednia
      : null;

  return (
    <span className="inline-flex flex-col gap-0.5 leading-tight">
      <span className="font-semibold whitespace-nowrap">{cena || "?"}</span>

      {maPrzelicznik ? (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {litry} L · {zlotePerLitr(cenaLiczbowo as number, litry as number)} zł/L
        </span>
      ) : (
        <span
          className="text-xs text-muted-foreground whitespace-nowrap"
          title="Sklep nie podaje, na ile litrów mleka starcza opakowanie"
        >
          ? L
        </span>
      )}

      {zmiana !== null && Math.abs(zmiana) > 0.005 && (
        <span
          className={
            "text-xs whitespace-nowrap " +
            (zmiana > 0 ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400")
          }
          title={`Poprzednia cena: ${cenaPoprzednia?.toFixed(2).replace(".", ",")} zł`}
        >
          {zmiana > 0 ? "↑" : "↓"} było {cenaPoprzednia?.toFixed(2).replace(".", ",")} zł
        </span>
      )}

      {!waski && !maPrzelicznik && null}
    </span>
  );
};

export default CenaKultury;
