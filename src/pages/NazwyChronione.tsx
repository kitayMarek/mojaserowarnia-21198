import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

/**
 * Nazwy chronione w UE (ChNP, ChOG, GTS) i co z tego wynika dla serowara.
 *
 * Skad: Marek 7.11.2026 (przez sesje huba) chcial wplesc wykazy IJHARS w moduly,
 * a potem sam dopisal: strona w dziale prawo, ktora tlumaczy, co to jest produkt
 * o nazwie chronionej, ze wszystkimi rodzajami ochrony.
 *
 * Fakty: rozp. (UE) 2024/1143 (art. 26, 37, 46, 53, 68, 70, 82), rozp. delegowane
 * 665/2014, ustawa z 9.03.2023 (Dz.U. 2023 poz. 588: art. 6, 31, 46, 48, 56, 57),
 * strony IJHARS, MRiRW i KOWR, rejestr eAmbrosia (pobrany 7.11.2026). Lista na dole.
 * Nazwisk producentow z wykazu IJHARS NIE przepisujemy (osoby prywatne): tylko link.
 * Cytat art. 26 ust. 1 lit. b doslownie z polskiej wersji rozporzadzenia.
 *
 * Tresc 1:1 z mirrorem public/prawo/nazwy-chronione.html, FAQ w faqPoradnikow
 * ("prawo-nazwy-chronione").
 */

export const WYKAZ_IJHARS = "https://www.gov.pl/web/ijhars/wykaz-producentow-chnp-chog-gts";
const SYSTEM_IJHARS = "https://www.gov.pl/web/ijhars/system-chronionych-produktow";

const ZRODLA = [
  {
    tekst: "Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2024/1143 z 11 kwietnia 2024 r. w sprawie oznaczeń geograficznych win, napojów spirytusowych i produktów rolnych oraz gwarantowanych tradycyjnych specjalności i fakultatywnych określeń jakościowych dla produktów rolnych",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32024R1143",
  },
  {
    tekst: "Rozporządzenie delegowane Komisji (UE) nr 665/2014 (warunki stosowania określenia „produkt górski”)",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32014R0665",
  },
  {
    tekst: "Rozporządzenie wykonawcze Komisji (UE) 2023/1689 (rejestracja „Twaróg wędzony” jako GTS)",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32023R1689",
  },
  {
    tekst: "Ustawa z 9 marca 2023 r. o rejestracji i ochronie nazw pochodzenia, oznaczeń geograficznych oraz gwarantowanych tradycyjnych specjalności (…) oraz o produktach tradycyjnych, Dz.U. 2023 poz. 588",
    url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20230000588",
  },
  { tekst: "IJHARS: Wykaz producentów ChNP, ChOG, GTS z ważnym certyfikatem", url: WYKAZ_IJHARS },
  { tekst: "IJHARS: System chronionych produktów (zakres ochrony, zgłaszanie naruszeń)", url: SYSTEM_IJHARS },
  { tekst: "Ministerstwo Rolnictwa i Rozwoju Wsi: Oznaczenia geograficzne", url: "https://www.gov.pl/web/rolnictwo/oznaczenia-geograficzne1" },
  { tekst: "Ministerstwo Rolnictwa i Rozwoju Wsi: Kontrola i certyfikacja", url: "https://www.gov.pl/web/rolnictwo/kontrola-i-certyfikacja" },
  { tekst: "Ministerstwo Rolnictwa i Rozwoju Wsi: Lista Produktów Tradycyjnych", url: "https://www.gov.pl/web/rolnictwo/lista-produktow-tradycyjnych2" },
  { tekst: "Ministerstwo Rolnictwa i Rozwoju Wsi: Poznaj Dobrą Żywność", url: "https://www.gov.pl/web/rolnictwo/poznaj-dobra-zywnosc" },
  { tekst: "KOWR: Kupuj świadomie (krajowe systemy jakości żywności)", url: "https://www.gov.pl/web/kowr/kupujswiadomie" },
  { tekst: "Komisja Europejska: rejestr eAmbrosia", url: "https://ec.europa.eu/agriculture/eambrosia/geographical-indications-register/" },
];

const RODZAJE = [
  {
    skrot: "ChNP",
    nazwa: "Chroniona nazwa pochodzenia (PDO)",
    warunek: "Jakość lub cechy wynikają w istotnej lub wyłącznej mierze ze szczególnego środowiska geograficznego (art. 46 ust. 1).",
    gdzie: "Wszystkie etapy produkcji na określonym obszarze: surowiec, przetwarzanie, przygotowanie i dojrzewanie.",
    sery: "Oscypek, bryndza podhalańska, redykołka",
  },
  {
    skrot: "ChOG",
    nazwa: "Chronione oznaczenie geograficzne (PGI)",
    warunek: "Jakość, renoma lub inna cecha w głównej mierze wynika z pochodzenia (art. 46 ust. 2).",
    gdzie: "Przynajmniej jeden etap produkcji na określonym obszarze.",
    sery: "Wielkopolski ser smażony, ser koryciński swojski",
  },
  {
    skrot: "GTS",
    nazwa: "Gwarantowana tradycyjna specjalność (TSG)",
    warunek: "Tradycyjny sposób produkcji, tradycyjny skład albo tradycyjne surowce, w użyciu od co najmniej 30 lat (art. 53 i art. 2 ust. 3).",
    gdzie: "Bez obszaru: w Polsce wolno wytwarzać na terenie całego kraju, ale tylko według specyfikacji.",
    sery: "Twaróg wędzony",
  },
];

const SERY = [
  { nazwa: "Bryndza podhalańska", rodzaj: "ChNP", data: "12.06.2007", akt: "rozp. (WE) nr 642/2007" },
  { nazwa: "Oscypek", rodzaj: "ChNP", data: "14.02.2008", akt: "rozp. (WE) nr 127/2008" },
  { nazwa: "Wielkopolski ser smażony", rodzaj: "ChOG", data: "21.04.2009", akt: "rozp. (WE) nr 323/2009" },
  { nazwa: "Redykołka", rodzaj: "ChNP", data: "01.12.2009", akt: "rozp. (WE) nr 1176/2009" },
  { nazwa: "Ser koryciński swojski", rodzaj: "ChOG", data: "10.08.2012", akt: "rozp. wyk. (UE) nr 728/2012", przepis: "/przepisy/korycinski" },
  { nazwa: "Twaróg wędzony", rodzaj: "GTS", data: "06.09.2023", akt: "rozp. wyk. (UE) 2023/1689" },
];

const CYTAT_ART_26 =
  "wszelkim niewłaściwym stosowaniem, imitacją lub przywołaniem, nawet jeśli podano prawdziwe pochodzenie produktu lub usługi lub jeżeli podano chronioną nazwę w tłumaczeniu, w formie transkrybowanej lub transliterowanej, lub z towarzyszącym jej określeniem, takim jak: „w stylu”, „typu”, „zgodnie z metodą”, „jak produkowane w”, „imitacja”, „o smaku”, „podobne do” lub podobnymi określeniami, w tym również w sytuacji, gdy produkty te są wykorzystywane jako składniki";

const a = "text-primary underline";

const NazwyChronione = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Nazwy chronione w UE: ChNP, ChOG i GTS. Co wolno serowarowi",
    description:
      "Czym różnią się chroniona nazwa pochodzenia, chronione oznaczenie geograficzne i gwarantowana tradycyjna specjalność, które polskie sery mają nazwę chronioną, kto może sprzedawać pod taką nazwą, czego nie wolno i jaka grozi kara.",
    inLanguage: "pl",
    url: "https://mojaserowarnia.pl/prawo/nazwy-chronione",
    image: "https://mojaserowarnia.pl/og-image.jpg",
    datePublished: "2026-11-07",
    dateModified: "2026-11-07",
    publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
  };

  const seeAlsoLinks = [
    { title: "Akty prawne UE", href: "/prawo/akty-prawne-ue", description: "Rozporządzenia UE o produkcji i sprzedaży sera." },
    { title: "Przepis na ser koryciński", href: "/przepisy/korycinski", description: "Polski ser z ChOG zrobiony w domu, nie na sprzedaż pod tą nazwą." },
    { title: "RHD: limity, rejestracja i podatki", href: "/prawo/rhd", description: "Jak legalnie sprzedawać własny ser z gospodarstwa." },
    { title: "Etykieta do sprzedaży w RHD", href: "/etykieta-rhd", description: "Generator etykiety z polami obowiązkowymi." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Prawo", href: "/prawo" }, { label: "Nazwy chronione" }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={ShieldCheck}
              color="emerald"
              title="Nazwy chronione w UE: ChNP, ChOG i GTS. Co wolno serowarowi"
              subtitle="Trzy unijne rodzaje ochrony nazw żywności, sześć polskich serów z nazwą chronioną, kto może sprzedawać pod taką nazwą i czym od ochrony nazwy różnią się Lista Produktów Tradycyjnych, „produkt górski” i krajowe znaki jakości."
            />

            <TLDRSection>
              <p>
                Unia chroni nazwy żywności na trzy sposoby: <strong>ChNP</strong> (chroniona nazwa pochodzenia),{" "}
                <strong>ChOG</strong> (chronione oznaczenie geograficzne) i <strong>GTS</strong> (gwarantowana tradycyjna
                specjalność). W Polsce chronionych jest <strong>sześć serów</strong>: oscypek, bryndza podhalańska,
                redykołka, wielkopolski ser smażony, ser koryciński swojski i twaróg wędzony. Pod taką nazwą sprzedaje
                tylko producent, który robi ser według specyfikacji i ma <strong>ważny certyfikat zgodności</strong>;
                listę takich producentów prowadzi IJHARS. Domowego sera nie sprzedaje się pod chronioną nazwą ani z
                dopiskiem „typu” czy „w stylu”. Wpis na Listę Produktów Tradycyjnych nazwy nie chroni.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trzy rodzaje ochrony: ChNP, ChOG i GTS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Wszystkie trzy opisuje rozporządzenie (UE) 2024/1143, stosowane od 13 maja 2024 r. Zastąpiło ono
                    wcześniejsze rozporządzenie nr 1151/2012. ChNP i ChOG razem nazywa się oznaczeniami geograficznymi,
                    bo wiążą nazwę z miejscem. GTS wiąże nazwę z tradycyjną recepturą albo metodą, a nie z miejscem.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b-2 border-border">
                          <th className="py-2 pr-3">Rodzaj</th>
                          <th className="py-2 pr-3">Co musi się zgadzać</th>
                          <th className="py-2 pr-3">Gdzie wolno produkować</th>
                          <th className="py-2">Polskie sery</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RODZAJE.map((r) => (
                          <tr key={r.skrot} className="border-b border-border align-top">
                            <td className="py-2 pr-3">
                              <strong>{r.skrot}</strong>
                              <br />
                              <span className="text-muted-foreground">{r.nazwa}</span>
                            </td>
                            <td className="py-2 pr-3">{r.warunek}</td>
                            <td className="py-2 pr-3">{r.gdzie}</td>
                            <td className="py-2">{r.sery}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-muted-foreground">
                    To samo rozporządzenie obejmuje oznaczenia geograficzne win i napojów spirytusowych. Tu opisujemy
                    produkty rolne i żywność, w tym sery.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Polskie sery z nazwą chronioną</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b-2 border-border">
                          <th className="py-2 pr-3">Ser</th>
                          <th className="py-2 pr-3">Rodzaj</th>
                          <th className="py-2 pr-3">Zarejestrowany</th>
                          <th className="py-2">Akt rejestracji</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SERY.map((s) => (
                          <tr key={s.nazwa} className="border-b border-border">
                            <td className="py-2 pr-3">
                              {s.przepis ? (
                                <Link to={s.przepis} className={a}>
                                  {s.nazwa}
                                </Link>
                              ) : (
                                s.nazwa
                              )}
                            </td>
                            <td className="py-2 pr-3">{s.rodzaj}</td>
                            <td className="py-2 pr-3">{s.data}</td>
                            <td className="py-2">{s.akt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-muted-foreground">
                    Data to dzień publikacji rozporządzenia rejestrującego w Dzienniku Urzędowym UE. Innych polskich serów
                    w rejestrze UE nie ma i żaden nie czeka na rejestrację (rejestr eAmbrosia i lista Ministerstwa
                    Rolnictwa, stan na 7 listopada 2026 r.). Przepis na ser koryciński mamy w dziale przepisów: to przepis
                    do domu, nie specyfikacja producenta.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kto może sprzedawać ser pod chronioną nazwą</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Tylko producent, który robi ser zgodnie ze specyfikacją zarejestrowanej nazwy i ma{" "}
                    <strong>ważny certyfikat zgodności albo świadectwo jakości</strong>. Tak pisze Ministerstwo
                    Rolnictwa, a rozporządzenie wymaga kontroli zgodności ze specyfikacją, zanim produkt trafi do obrotu
                    (art. 39 ust. 3, dla GTS art. 72 ust. 6).
                  </p>
                  <p>
                    Kontrolę przeprowadza na wniosek producenta jednostka certyfikująca upoważniona przez ministra albo
                    wojewódzki inspektor jakości handlowej artykułów rolno-spożywczych (art. 31 ustawy z 9 marca 2023 r.).
                    Listę upoważnionych jednostek podaje{" "}
                    <a href="https://www.gov.pl/web/rolnictwo/kontrola-i-certyfikacja" className={a} target="_blank" rel="noopener noreferrer">
                      Ministerstwo Rolnictwa
                    </a>
                    .
                  </p>
                  <p>
                    Producentów z ważnym certyfikatem wymienia{" "}
                    <a href={WYKAZ_IJHARS} className={a} target="_blank" rel="noopener noreferrer">
                      wykaz Inspekcji Jakości Handlowej Artykułów Rolno-Spożywczych (IJHARS)
                    </a>
                    . To plik do pobrania, zmieniany zwykle co miesiąc. Nie przepisujemy go tutaj, bo wielu producentów
                    to osoby prywatne, a aktualna wersja jest zawsze u źródła.
                  </p>
                  <p>
                    Na etykiecie sera sprzedawanego pod nazwą ChNP, ChOG albo GTS musi być <strong>symbol unijny</strong>,
                    w tym samym polu widzenia co nazwa (art. 37 ust. 3, dla GTS art. 70 ust. 2). Skróty „ChNP”, „ChOG” i
                    „GTS” są dobrowolne.
                  </p>
                  <p>
                    Rejestracja RHD albo MOL nie zastępuje certyfikatu. To osobne sprawy: RHD i MOL mówią, jak wolno
                    sprzedawać, a certyfikat, pod jaką nazwą.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Czego nie wolno: zakres ochrony nazwy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>Zarejestrowana nazwa ChNP albo ChOG jest chroniona przed (art. 26 ust. 1 rozporządzenia 2024/1143):</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      wykorzystaniem w celach handlowych dla produktów porównywalnych albo korzystaniem z jej renomy,
                      także gdy chroniony produkt jest tylko składnikiem,
                    </li>
                    <li>
                      niewłaściwym stosowaniem, imitacją i przywołaniem. Polska wersja przepisu (lit. b) brzmi:
                      <blockquote className="my-2 border-l-4 border-emerald-500 pl-3 italic text-muted-foreground">
                        „{CYTAT_ART_26}”
                      </blockquote>
                    </li>
                    <li>
                      fałszywymi lub mylącymi informacjami o pochodzeniu i cechach na opakowaniu, w reklamie, w
                      dokumentach i w interfejsach internetowych, a także opakowaniem, które sugeruje fałszywe pochodzenie,
                    </li>
                    <li>innymi praktykami, które mogą wprowadzić konsumenta w błąd.</li>
                  </ul>
                  <p>Ochrona obejmuje też sprzedaż na odległość, na przykład przez internet (art. 26 ust. 4).</p>
                  <p>
                    Nazwa GTS jest chroniona węziej (art. 68 ust. 1): przed niewłaściwym stosowaniem, imitacją i
                    przywołaniem, także w tłumaczeniu i gdy produkt jest składnikiem, oraz przed praktykami
                    wprowadzającymi w błąd. Ten przepis nie wymienia dopisków „w stylu” i „typu”.
                  </p>
                  <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-foreground">
                    <strong>W praktyce przy sprzedaży:</strong> „oscypek domowy”, „ser typu oscypek”, „bryndza jak
                    podhalańska” albo „ser w stylu korycińskiego” to nazwy, których przepis zakazuje wprost albo które
                    mieszczą się w zakazie. Jeśli sprzedajesz własny ser podobny do chronionego, nazwij go opisowo, na
                    przykład „wędzony ser z mleka owczego”, bez chronionej nazwy, bez takich dopisków i bez sugerowania
                    regionu. W razie wątpliwości zapytaj w wojewódzkim inspektoracie JHARS.
                  </div>
                  <p>
                    Ochrona dotyczy nazwy, a nie samego robienia sera. Nikt nie zabrania warzyć w domu sera tradycyjną
                    metodą; ograniczenie dotyczy tego, jak go nazwiesz w sprzedaży, ogłoszeniu, reklamie albo na etykiecie.
                    Rozporządzenie pozwala też używać nazw i symboli w celach informacyjnych i edukacyjnych, jeśli nie
                    wprowadza to w błąd (art. 37 ust. 1). Dlatego ta strona i nasz przepis mogą je podawać.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jaka grozi kara</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Za użycie nazwy niezgodnie ze specyfikacją albo z naruszeniem zakresu ochrony wojewódzki inspektor
                    JHARS nakłada decyzją <strong>karę pieniężną do 20-krotności przeciętnego wynagrodzenia</strong> z
                    poprzedniego roku. Przy ponownym naruszeniu kara sięga 50-krotności i nie może być niższa od
                    poprzedniej. Tak samo karane jest niewłaściwe użycie oznaczeń, skrótów i symboli. W niektórych
                    przypadkach inspektor może od kary odstąpić (art. 56 i 57 ustawy z 9 marca 2023 r.).
                  </p>
                  <p>
                    Naruszenie, na przykład ser sprzedawany pod chronioną nazwą bez certyfikatu, można zgłosić IJHARS na
                    adres ochronaoznaczen@ijhars.gov.pl, na formularzu ze strony{" "}
                    <a href={SYSTEM_IJHARS} className={a} target="_blank" rel="noopener noreferrer">
                      System chronionych produktów
                    </a>
                    . Zgłaszać można naruszenia na każdym etapie, także w sklepach internetowych i na targowiskach.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inne oznaczenia: co chroni nazwę, a co nie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    <strong>„Produkt górski”</strong> to fakultatywne określenie jakościowe (art. 82 rozporządzenia
                    2024/1143, szczegóły w rozporządzeniu delegowanym nr 665/2014). Nie wymaga rejestracji. Surowce i pasza
                    mają pochodzić przede wszystkim z obszarów górskich, a przetwarzanie odbywać się w górach. Przy mleku
                    i serze: zwierzęta co najmniej przez ostatnie 2/3 życia w górach (przy wypasie sezonowym co najmniej
                    1/4 życia), pasza spoza gór najwyżej 50% suchej masy rocznie, a u przeżuwaczy najwyżej 40%. Mleko
                    wolno przetwarzać do 30 km poza obszarem górskim tylko w zakładach, które działały 3 stycznia 2013 r.
                  </p>
                  <p>
                    <strong>Listę Produktów Tradycyjnych</strong> prowadzi minister rolnictwa. Trafiają na nią produkty
                    wytwarzane tradycyjnymi metodami od co najmniej 25 lat, a wniosek składa się do marszałka
                    województwa (art. 46 i 48 ustawy z 2023 r.). Ministerstwo pisze wprost: „Nazwa produktu wpisanego na
                    Listę Produktów Tradycyjnych nie podlega ochronie.”
                  </p>
                  <p>
                    <strong>Jakość Tradycja</strong> to krajowy system jakości żywności, w tym żywności tradycyjnej z
                    recepturą co najmniej 50-letnią (KOWR). <strong>Poznaj Dobrą Żywność</strong> to znak jakości ministra
                    rolnictwa przyznawany na 3 lata; zgłoszenie jest bezpłatne, a produkty kontroluje IJHARS. Oba znaki
                    wyróżniają produkt, ale nie dają ochrony nazwy takiej jak ChNP, ChOG i GTS.
                  </p>
                  <p className="text-muted-foreground">
                    Oznaczenia ekologiczne to osobny system z własną certyfikacją i nie są tematem tej strony.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jak zarejestrować nazwę</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Wniosek o rejestrację nazwy składa się do ministra właściwego do spraw rynków rolnych (art. 6 ust. 1
                    ustawy z 9 marca 2023 r.). Po etapie krajowym sprawa trafia do Komisji Europejskiej. Symboli unijnych wolno używać dopiero po publikacji rejestracji (art. 37
                    ust. 8 rozporządzenia 2024/1143).
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <SekcjaFAQ slug="prawo-nazwy-chronione" />

              <SeeAlso links={seeAlsoLinks} />

              <p className="mt-8 text-sm text-muted-foreground">
                Strona ma charakter informacyjny i nie jest poradą prawną. Specyfikacje poszczególnych serów i aktualny
                wykaz producentów są u źródła. W razie wątpliwości zapytaj w wojewódzkim inspektoracie JHARS.
              </p>

              <section className="mt-6 text-sm text-muted-foreground" aria-label="Źródła">
                <h2 className="mb-2 font-semibold text-foreground">Źródła</h2>
                <ul className="list-disc space-y-1 pl-5">
                  {ZRODLA.map((z) => (
                    <li key={z.url}>
                      <a href={z.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {z.tekst}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NazwyChronione;
