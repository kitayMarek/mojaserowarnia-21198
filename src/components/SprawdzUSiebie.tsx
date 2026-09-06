import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";

/**
 * Generator polecenia do samodzielnego sprawdzenia własnego panelu.
 *
 * ⛔ TO JEST GENERATOR, NIE WYKONAWCA. Nic stąd nie wychodzi w sieć — składamy
 * tekst do skopiowania i tyle. Pole, w które każdy wpisuje dowolny adres,
 * a nasz serwer wysyła tam żądanie z podrobionym nagłówkiem, byłoby otwartym
 * przekaźnikiem: nie sposób sprawdzić, czy wpisujący jest właścicielem tej
 * domeny, więc pod cudzy serwer poleciałby fałszywy ruch z NASZEGO adresu.
 * Strona, która rozsyła podrobione podpisy botów, nie ma prawa mówić
 * o rzetelności pomiaru.
 *
 * Jest też powód praktyczny, niezależny od powyższego: całą demonstracją jest
 * to, że licznik W CUDZYM PANELU drgnie. Ten panel siedzi za cudzym logowaniem
 * i my go nie zobaczymy nigdy. Moglibyśmy pokazać najwyżej kod odpowiedzi, co
 * nie dowodzi niczego — pytanie nie brzmi „czy serwer odpowiedział", tylko
 * „czy jego panel policzył to jako Perplexity".
 *
 * Odmowa jest przy okazji treścią: narzędzie nie robi czegoś, bo nie potrafi
 * zweryfikować tożsamości — czyli demonstruje problem samym swoim istnieniem.
 */

const UA_PODROBIONY =
  "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)";

/** Adresy, których nie ma sensu (ani nie wypada) podpowiadać w poleceniu. */
const ZABRONIONE = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^0\./,
  /\.local$/i,
  /\.internal$/i,
  /^\[/, // IPv6 w nawiasach — w tym miejscu tylko myli
];

interface Wynik {
  domena: string | null;
  blad: string | null;
}

function oczysc(wejscie: string): Wynik {
  const surowe = wejscie.trim().toLowerCase();
  if (!surowe) return { domena: null, blad: null };

  // Zdejmujemy protokół, ścieżkę, port i ewentualne „www." zostawiamy — to już
  // wybór użytkownika, którą wersję mierzy.
  const bezProtokolu = surowe.replace(/^[a-z]+:\/\//, "");
  const host = bezProtokolu.split("/")[0].split("?")[0].split("#")[0].split(":")[0];

  if (!host) return { domena: null, blad: "Wpisz adres swojej strony." };
  if (/\s/.test(host)) return { domena: null, blad: "Adres nie może zawierać spacji." };
  if (!host.includes(".") || host.startsWith(".") || host.endsWith(".")) {
    return { domena: null, blad: "To nie wygląda na adres domeny, np. mojastrona.pl" };
  }
  if (!/^[a-z0-9.-]+$/.test(host)) {
    return { domena: null, blad: "Adres zawiera znaki, których nie ma w nazwach domen." };
  }
  if (ZABRONIONE.some((w) => w.test(host))) {
    return {
      domena: null,
      blad: "To adres lokalny albo wewnętrzny — panel statystyk i tak go nie zobaczy.",
    };
  }
  return { domena: host, blad: null };
}

const Polecenie = ({ tytul, tresc }: { tytul: string; tresc: string }) => {
  const [skopiowane, setSkopiowane] = useState(false);

  const kopiuj = async () => {
    try {
      await navigator.clipboard.writeText(tresc);
      setSkopiowane(true);
      setTimeout(() => setSkopiowane(false), 2000);
    } catch {
      // Bez schowka trudno — tekst i tak jest widoczny i da się zaznaczyć.
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{tytul}</span>
        <Button size="sm" variant="ghost" onClick={kopiuj} className="h-7 px-2">
          {skopiowane ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="ml-1 text-xs">{skopiowane ? "skopiowane" : "kopiuj"}</span>
        </Button>
      </div>
      <pre className="text-xs bg-muted rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
        {tresc}
      </pre>
    </div>
  );
};

const SprawdzUSiebie = () => {
  const [wejscie, setWejscie] = useState("");
  const { domena, blad } = useMemo(() => oczysc(wejscie), [wejscie]);

  const cel = domena ?? "twoja-domena.pl";

  const polecenieCurl =
    `curl -s -o /dev/null -w "%{http_code}\\n" -A "${UA_PODROBIONY}" https://${cel}/\n` +
    `curl -s -o /dev/null -w "%{http_code}\\n" -A "${UA_PODROBIONY}" https://${cel}/`;

  const poleceniePowershell =
    `Invoke-WebRequest -Uri "https://${cel}/" -UserAgent "${UA_PODROBIONY}" | Out-Null\n` +
    `Invoke-WebRequest -Uri "https://${cel}/" -UserAgent "${UA_PODROBIONY}" | Out-Null`;

  return (
    <Card id="sprawdz-u-siebie" className="mb-8">
      <CardHeader>
        <CardTitle>Sprawdź to u siebie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p>
          Nie trzeba nam wierzyć na słowo. Poniżej składamy gotowe polecenie, które wyśle
          na <strong>Twoją własną stronę</strong> dwa żądania podpisane jako PerplexityBot.
          Potem wystarczy spojrzeć we własny panel.
        </p>

        <div className="space-y-2">
          <label htmlFor="domena" className="text-sm font-medium">
            Adres Twojej strony
          </label>
          <Input
            id="domena"
            value={wejscie}
            onChange={(e) => setWejscie(e.target.value)}
            placeholder="mojastrona.pl"
            autoComplete="off"
            spellCheck={false}
          />
          {blad && <p className="text-sm text-destructive">{blad}</p>}
          {!blad && !domena && (
            <p className="text-xs text-muted-foreground">
              Wpisz własną domenę — poniżej pokazujemy przykład z adresem zastępczym.
            </p>
          )}
        </div>

        <Polecenie tytul="Linux, macOS, Windows (wiersz poleceń)" tresc={polecenieCurl} />
        <Polecenie tytul="Windows PowerShell" tresc={poleceniePowershell} />

        <div className="border-t pt-4 space-y-3">
          <h3 className="font-semibold">Co zrobić i na co patrzeć</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>
              Otwórz swój panel statystyk i <strong>zapisz obecną wartość</strong> licznika
              ruchu botów AI. W Cloudflare to „AI Crawl Control".
            </li>
            <li>Uruchom powyższe polecenie — są tam dwa żądania.</li>
            <li>Odczekaj kilka minut i odśwież panel.</li>
          </ol>

          <div className="grid md:grid-cols-2 gap-3 pt-1">
            <div className="rounded border p-3">
              <div className="text-sm font-semibold mb-1">Co powinieneś zobaczyć</div>
              <p className="text-sm text-muted-foreground">
                Nic. Żadne z tych żądań nie przyszło od Perplexity — przyszły z Twojego
                własnego komputera.
              </p>
            </div>
            <div className="rounded border border-amber-300 p-3">
              <div className="text-sm font-semibold mb-1">Co zobaczysz</div>
              <p className="text-sm">
                Licznik wyższy o dwa, przypisany do Perplexity. Panel policzył to, co
                żądanie <em>o sobie napisało</em>.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <h3 className="font-semibold">Dlaczego nie robimy tego za Ciebie</h3>
          <p className="text-sm">
            Bo <strong>nie umiemy sprawdzić, czy ta domena należy do Ciebie</strong>. Gdyby
            to pole wysyłało żądania z naszego serwera, każdy mógłby wpisać cudzy adres
            i pod cudzą stronę poleciałby podrobiony ruch — z naszego adresu. Strona, która
            rozsyła fałszywe podpisy botów, nie ma prawa mówić o rzetelności pomiaru.
          </p>
          <p className="text-sm text-muted-foreground">
            Zwróć uwagę, że to jest <em>ten sam problem</em>, o którym jest cała ta strona.
            Nie możemy zweryfikować, kim jesteś, więc nie działamy na podstawie Twojej
            deklaracji. Panele statystyk stoją przed dokładnie tym samym pytaniem — i
            odpowiadają na nie inaczej.
          </p>
          <p className="text-xs text-muted-foreground">
            Uruchamiaj to wyłącznie na stronie, którą sam prowadzisz. Dwa żądania nikomu nie
            zaszkodzą, ale wysyłanie podrobionych podpisów pod cudze serwery to już nie jest
            sprawdzanie, tylko dokładanie się do problemu.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SprawdzUSiebie;
