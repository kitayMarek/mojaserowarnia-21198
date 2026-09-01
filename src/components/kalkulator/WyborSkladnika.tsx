import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface PozycjaDoWyboru {
  nazwa: string;
  kategoria: string;
}

/**
 * Wybór składnika paszy z wyszukiwaniem.
 *
 * DLACZEGO NIE `<select>`: przy 129 pozycjach natywna lista pozwala tylko skakać
 * po pierwszej literze — wpisanie „psz" nie zawęża do pszenicy, bo przeglądarka
 * traktuje każdą literę jako nowy skok. Przy „Śruta sojowa" i „Śruta rzepakowa"
 * trzeba było przewijać. Tutaj wpisuje się dowolny fragment nazwy.
 *
 * Dopasowanie jest ODPORNE NA OGONKI w obie strony: „sruta" znajduje „Śruta",
 * a „śr" znajduje też pozycje zapisane bez ogonków. Użytkownik przy klawiaturze
 * w oborze nie ma ochoty walczyć z polskimi znakami.
 */

const OGONKI: Record<string, string> = {
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
};

const uprosc = (t: string) =>
  t.toLowerCase().replace(/[ąćęłńóśźż]/g, (z) => OGONKI[z] ?? z);

/**
 * Synonimy — nazwa w bazie bywa inna niż słowo, którym myśli użytkownik.
 *
 * Powód konkretny: w bazie są CZTERY czyste tłuszcze, każdy 100% tłuszczu —
 * Olej rzepakowy, Tłuszcz drobiowy, Smalec i Łój. Tylko pierwszy ma w nazwie
 * „olej", a pozostałe trzy leżą w innej kategorii (pasze pochodzenia
 * zwierzęcego). Kto szukał tłuszczu energetycznego, widział jedną z czterech
 * możliwości i nie wiedział o reszcie.
 *
 * Klucze są bez ogonków, bo porównujemy uproszczone napisy. Dopisywanie
 * kolejnych par jest tanie — to zwykła tablica.
 */
const GRUPY_SYNONIMOW: Array<{ hasla: string[]; nazwy: string[] }> = [
  {
    hasla: ["olej", "oleje", "tluszcz", "smalec", "loj"],
    nazwy: ["Olej rzepakowy", "Tłuszcz drobiowy", "Smalec", "Łój"],
  },
  {
    // „soja" nie zawiera się w „sojowa", więc bez tego wpisu nazwa rośliny
    // nie pokazywała śruty z niej zrobionej.
    hasla: ["soja", "sojowa"],
    nazwy: ["Soja", "Śruta sojowa"],
  },
];

/**
 * Nazwy dorzucane do wyniku na podstawie synonimu.
 *
 * Świadomie WYMIENIAMY SKŁADNIKI PO NAZWIE, a nie dopasowujemy fragmentu:
 * dopasowanie „tluszcz" po nazwie wciągało „Mączkę rybną do 10% tłuszczu"
 * i „Mleko odtłuszczone", które tłuszczami nie są. To dokładnie ten sam błąd,
 * przez który wyszukiwanie „olej" pokazywało wcześniej dwadzieścia drożdży.
 *
 * Rozszerzamy dopiero od trzech znaków, żeby pojedyncza litera nie wciągała
 * pół bazy.
 */
function nazwyZSynonimow(szukane: string): Set<string> {
  if (szukane.length < 3) return new Set();
  const trafione = GRUPY_SYNONIMOW.filter((g) =>
    g.hasla.some((h) => h.startsWith(szukane) || szukane.startsWith(h)),
  );
  return new Set(trafione.flatMap((g) => g.nazwy.map(uprosc)));
}

export default function WyborSkladnika({
  wartosc,
  pozycje,
  onZmiana,
}: {
  wartosc: string;
  pozycje: PozycjaDoWyboru[];
  onZmiana: (nazwa: string) => void;
}) {
  const [otwarty, setOtwarty] = useState(false);
  const [fraza, setFraza] = useState("");

  const { pogrupowane, tylkoKategoria } = useMemo(() => {
    const szukane = uprosc(fraza.trim());

    // Szukamy po NAZWACH składników. Dopasowanie po nazwie kategorii było tu
    // wcześniej i psuło wyszukiwanie: kategoria „Produkty uboczne, śruty i oleje"
    // ma 20 pozycji, więc wpisanie „olej" wyrzucało wszystkie drożdże i kiełki,
    // spychając jedyny prawdziwy wynik („Olej rzepakowy") pod widoczny obszar.
    const zSynonimow = szukane ? nazwyZSynonimow(szukane) : new Set<string>();
    const poNazwie = szukane
      ? pozycje.filter((p) => {
          const plaska = uprosc(p.nazwa);
          return plaska.includes(szukane) || zSynonimow.has(plaska);
        })
      : pozycje;

    // Kategoria wraca do gry TYLKO wtedy, gdy nazwy nic nie dały — wtedy lepiej
    // pokazać całą grupę niż „nic nie pasuje" (np. na frazę „mineralne”).
    const zapasowe = szukane && poNazwie.length === 0
      ? pozycje.filter((p) => uprosc(p.kategoria).includes(szukane))
      : [];

    const pasujace = poNazwie.length ? poNazwie : zapasowe;
    const grupy = new Map<string, PozycjaDoWyboru[]>();
    for (const p of pasujace) {
      const lista = grupy.get(p.kategoria);
      if (lista) lista.push(p);
      else grupy.set(p.kategoria, [p]);
    }
    return { pogrupowane: [...grupy.entries()], tylkoKategoria: zapasowe.length > 0 };
  }, [pozycje, fraza]);

  return (
    <Popover open={otwarty} onOpenChange={setOtwarty}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={otwarty}
          className="w-full min-w-[190px] justify-between bg-background font-normal"
        >
          <span className={cn("truncate", !wartosc && "text-muted-foreground")}>
            {wartosc || "— wybierz składnik —"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        {/* shouldFilter={false} — filtrujemy sami, żeby ogonki działały w obie
            strony; wbudowane filtrowanie cmdk porównuje znaki dosłownie. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Wpisz nazwę, np. psz…"
            value={fraza}
            onValueChange={setFraza}
          />
          <CommandList className="max-h-[260px]">
            <CommandEmpty>
              <span className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                Nic nie pasuje do „{fraza}"
              </span>
            </CommandEmpty>
            {tylkoKategoria && (
              <p className="px-3 pb-1 pt-2 text-xs text-muted-foreground">
                Żaden składnik nie nazywa się „{fraza}" — pokazuję pasującą kategorię.
              </p>
            )}
            {pogrupowane.map(([kategoria, lista]) => (
              <CommandGroup key={kategoria} heading={kategoria}>
                {lista.map((p) => (
                  <CommandItem
                    key={p.nazwa}
                    value={p.nazwa}
                    onSelect={() => {
                      onZmiana(p.nazwa);
                      setFraza("");
                      setOtwarty(false);
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4",
                        wartosc === p.nazwa ? "opacity-100" : "opacity-0")}
                    />
                    {p.nazwa}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
