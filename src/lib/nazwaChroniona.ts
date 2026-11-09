// Ramka „Nazwa chroniona w UE” przy przepisie (pole nazwaChroniona w recipesData).
// Ten sam tekst idzie do mirrora przepisu i do magazynu MCP (scripts/eksport-przepisow-magazyn.mjs),
// więc zmiana tutaj musi trafić też tam. Zasady: /prawo/nazwy-chronione.

export const WYKAZ_PRODUCENTOW_IJHARS = "https://www.gov.pl/web/ijhars/wykaz-producentow-chnp-chog-gts";

// Dopełniacz: „ma status chronionego oznaczenia geograficznego”.
const PELNA_NAZWA = {
  ChNP: "chronionej nazwy pochodzenia",
  ChOG: "chronionego oznaczenia geograficznego",
  GTS: "gwarantowanej tradycyjnej specjalności",
} as const;

export function ramkaNazwyChronionej(n: { rodzaj: keyof typeof PELNA_NAZWA; nazwa: string; zarejestrowana: string }): string {
  return (
    `Nazwa „${n.nazwa}” ma w UE status ${PELNA_NAZWA[n.rodzaj]} (${n.rodzaj}) od ${n.zarejestrowana} ` +
    `Pod tą nazwą sprzedaje tylko producent z ważnym certyfikatem zgodności. Ser zrobiony w domu według ` +
    `tego przepisu możesz jeść i częstować nim, ale nie sprzedawaj go pod tą nazwą ani z dopiskiem „typu” czy „w stylu”.`
  );
}
