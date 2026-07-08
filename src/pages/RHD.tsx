import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale, Users, ShoppingBag, ClipboardCheck, Euro, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import FAQSchema from "@/components/FAQSchema";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";

// FAQ data for SEO
const faqData = [
  {
    question: "Czym jest Rolniczy Handel Detaliczny (RHD)?",
    answer: "RHD to wyodrębniona w polskim prawie forma handlu detalicznego umożliwiająca rolnikom produkcję żywności z własnej uprawy/hodowli oraz jej zbywanie konsumentom końcowym w uproszczonym trybie prawnym i podatkowym."
  },
  {
    question: "Kto może prowadzić RHD?",
    answer: "RHD może prowadzić rolnik posiadający gospodarstwo rodzinne lub inny rolniczy podmiot, który posiada własny surowiec z hodowli, chowu lub uprawy. Wymagane jest, aby co najmniej jeden składnik produktu pochodził z własnego gospodarstwa."
  },
  {
    question: "Jakie produkty można sprzedawać w ramach RHD?",
    answer: "W RHD można sprzedawać produkty pochodzenia roślinnego (warzywa, owoce, przetwory), produkty mleczne (sery, jogurty, masło), produkty mięsne, jaja, miód oraz produkty złożone, pod warunkiem że zawierają składnik z własnego gospodarstwa."
  },
  {
    question: "Jak zarejestrować działalność RHD?",
    answer: "Dla żywności roślinnej: zgłoszenie do Państwowej Inspekcji Sanitarnej min. 14 dni przed rozpoczęciem. Dla żywności zwierzęcej lub złożonej: wniosek do powiatowego lekarza weterynarii min. 30 dni przed rozpoczęciem działalności."
  },
  {
    question: "Czym różni się RHD od sprzedaży bezpośredniej?",
    answer: "Sprzedaż bezpośrednia obejmuje wyłącznie produkty NIEPRZETWORZONE z własnego gospodarstwa (surowe mleko, jaja, miód, warzywa, owoce). RHD jest bardziej elastyczne — pozwala sprzedawać także produkty PRZETWORZONE, np. sery i wędliny. Ser (produkt przetworzony) sprzedasz więc wyłącznie w ramach RHD, a surowe mleko lub jaja — w obu formach. Obie formy można prowadzić jednocześnie, ale każda wymaga osobnej rejestracji. W RHD sprzedaż do konsumenta finalnego jest bez limitów ilościowych na terenie całego kraju; sprzedaż bezpośrednia podlega limitom (np. do 1000 l surowego mleka tygodniowo)."
  },
  {
    question: "Co to jest numer RHD i jak wygląda?",
    answer: "Potocznie „numer RHD” to Weterynaryjny Numer Identyfikacyjny (WNI) — nadawany przez powiatowego lekarza weterynarii przy rejestracji produkcji żywności pochodzenia zwierzęcego lub złożonej (np. serów). To ciąg cyfr: pierwsze oznaczają województwo i powiat, kolejne — rodzaj działalności i numer kolejny wpisu. Na znaku weterynaryjnym zapisywany jest w owalu z kodem kraju (PL) u góry i skrótem „WE” u dołu; na etykiecie produktu zwykle bez owalnej ramki. Przy rejestracji wyłącznie roślinnej w Sanepidzie WNI nie jest nadawany — wtedy nie trzeba go podawać."
  },
  {
    question: "Czy w RHD trzeba wystawiać fakturę lub paragon?",
    answer: "Przy sprzedaży detalicznej konsumentowi finalnemu (na targu, w gospodarstwie) rolnik ryczałtowy prowadzący RHD nie musi wystawiać ani faktury, ani paragonu, ani rachunku. Na życzenie kupującego można wystawić odręczny rachunek lub dowód sprzedaży — nieobowiązkowo, ale to dobra praktyka. Przy sprzedaży do sklepu lub restauracji potrzebny jest dokument identyfikujący partię (WNI, dane producenta, opis towaru) — to wymóg weterynaryjny, nie podatkowy."
  },
  {
    question: "Czy w RHD potrzebna jest kasa fiskalna?",
    answer: "Nie. Rolnik ryczałtowy prowadzący RHD jest zwolniony z obowiązku kasy fiskalnej niezależnie od kwoty obrotu (zwolnienie przedmiotowe, szersze niż ogólny limit 20 000 zł). Podstawa: rozporządzenie Ministra Finansów z 17 grudnia 2024 r. (Dz.U. 2024 poz. 1902). Kasa staje się obowiązkowa dopiero, gdy rolnik zrezygnuje ze statusu rolnika ryczałtowego i zarejestruje się jako czynny podatnik VAT."
  },
  {
    question: "Czy przy sprzedaży sera do sklepu lub restauracji dostanę fakturę VAT RR?",
    answer: "Tak. Gdy sprzedajesz produkty — także przetworzone, jak ser — czynnemu podatnikowi VAT (sklepowi, restauracji, hurtowni), to nabywca wystawia fakturę VAT RR i dolicza Ci zryczałtowany zwrot podatku 7% do ceny netto. Przetworzone produkty RHD są „produktami rolnymi” w rozumieniu ustawy o VAT (art. 2 pkt 20, odsyłający do art. 20 ust. 1c ustawy o PIT dotyczącego RHD), więc ser się kwalifikuje. Warunki: zapłata przelewem na Twój rachunek (nie gotówką) oraz Twoje oświadczenie o statusie rolnika ryczałtowego. Przy sprzedaży konsumentowi na targu VAT RR nie występuje."
  },
  {
    question: "Czy RHD trzeba zgłaszać do urzędu skarbowego?",
    answer: "Zasadniczo nie. Startując RHD zgłaszasz się tylko do weterynarii (produkty zwierzęce/złożone) lub Sanepidu (roślinne). Dopóki przychód nie przekroczy 100 000 zł rocznie, jest zwolniony z podatku dochodowego — nie zgłaszasz nic do US ani nie składasz deklaracji. Dopiero po przekroczeniu 100 000 zł kontaktujesz się z US i możesz wybrać opodatkowanie nadwyżki ryczałtem 2%."
  },
  {
    question: "Jak opodatkowany jest RHD po przekroczeniu 100 000 zł?",
    answer: "Nadwyżkę ponad 100 000 zł można opodatkować ryczałtem 2% od przychodu (to opcja, zwykle korzystniejsza niż skala 12/32% od dochodu). Wybór ryczałtu zgłaszasz pisemnym oświadczeniem do naczelnika US do 20. dnia miesiąca następującego po miesiącu pierwszego przychodu (lub do końca roku, jeśli pierwszy przychód był w grudniu) — nie trzeba go ponawiać w kolejnych latach. Rozliczasz się rocznie na PIT-28 (15 lutego – 30 kwietnia następnego roku). Warunkiem zwolnienia do 100 000 zł jest m.in. udział własnego surowca co najmniej 50% składu produktu."
  }
];

// See Also links
const seeAlsoLinks = [
  { title: "Działalność marginalna, lokalna i ograniczona (MOL)", href: "/prawo/mol", description: "Alternatywna forma działalności dla serowarów" },
  { title: "Wymagane dokumenty w RHD", href: "/prawo/rhd/dokumenty", description: "Ewidencje, rejestry i procedury" },
  { title: "Przepisy prawne UE", href: "/prawo/akty-prawne-ue", description: "Unijne regulacje dotyczące żywności" },
  { title: "System ewidencji sprzedaży", href: "/system-ewidencji", description: "Narzędzie do prowadzenia dokumentacji RHD" },
  { title: "Poradnik dla serowarów", href: "/poradnik", description: "Praktyczna wiedza o produkcji sera" }
];

const RHD = () => {
  useEffect(() => {
    document.title = "Rolniczy handel detaliczny (RHD) — zasady, limity, rejestracja";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "RHD: kto może prowadzić, co można sprzedawać, limit 100 000 zł bez podatku PIT, rejestracja w Sanepidzie (14 dni) lub u powiatowego lekarza weterynarii (30 dni)."
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      <PageBreadcrumbs items={[
        { label: "Prawo", href: "/prawo" },
        { label: "RHD" }
      ]} />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <Link 
            to="/prawo" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do sekcji Prawo
          </Link>

          <div className="mb-8">
            <PageHeader
              icon={Scale}
              color="emerald"
              title="Rolniczy Handel Detaliczny (RHD)"
              subtitle="Kompletny przewodnik po formie działalności umożliwiającej produkcję i sprzedaż serów oraz innych produktów rolnych bezpośrednio konsumentom"
            />
            <div className="mt-6">
              <ReactionButton contentType="legal_page" contentId="rhd" variant="default" />
            </div>
          </div>

          {/* TL;DR Section */}
          <TLDRSection>
            <p>
              <strong>Rolniczy Handel Detaliczny (RHD)</strong> to uproszczona forma działalności dla rolników. 
              Pozwala na produkcję i sprzedaż żywności z własnego gospodarstwa bezpośrednio konsumentom. 
              Wymaga rejestracji w Sanepidzie (produkty roślinne) lub u lekarza weterynarii (produkty zwierzęce). 
              Limit przychodów: 100 000 zł/rok ze zwolnieniem z podatku dochodowego.
            </p>
          </TLDRSection>

          <FAQSchema faqs={faqData} />

          {/* Menu szybkiego dostępu */}
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Powiązane tematy</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <Link 
                  to="/prawo/rhd/dokumenty"
                  className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Wymagane dokumenty w RHD</p>
                    <p className="text-xs text-muted-foreground">Ewidencje, rejestry i procedury</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Sekcja 1: Czym jest RHD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Czym jest RHD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  „Rolniczy Handel Detaliczny (RHD)" to wyodrębniona w polskim prawie forma handlu detalicznego, która umożliwia rolnikom (gospodarstwom rolnym) produkcję żywności w całości lub w części z własnej uprawy/hodowli/chowu oraz jej zbywanie konsumentom końcowym lub wybranym zakładom w uproszczonym trybie.
                </p>
                <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Najważniejsze cechy:</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Żywność wytworzona w gospodarstwie (albo z surowca własnego) lub w ramach gospodarstwa + przetwórstwo, sprzedaż</li>
                    <li>Zbywanie konsumentowi końcowemu (finalnemu) lub zakładom handlu detalicznego z przeznaczeniem dla konsumenta końcowego</li>
                    <li>Uproszczone wymagania (w porównaniu do dużych zakładów produkcji żywności) – na małą skalę, krótkie łańcuchy dostaw</li>
                  </ul>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="font-medium">
                    Dla serowarów i rolników oznacza to: jeśli prowadzisz gospodarstwo, samodzielnie uzyskujesz mleko lub surowiec (lub część surowca), możesz przetworzyć (np. zrobić sery, jogurty, inne wyroby) i sprzedawać je w ramach RHD — pod pewnymi warunkami.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja: RHD a sprzedaż bezpośrednia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  RHD a sprzedaż bezpośrednia — czym się różnią
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  To najczęstsze pytanie serowarów. Fundamentalna granica to <strong>przetworzenie</strong> produktu:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Sprzedaż bezpośrednia (SB)</strong> — tylko produkty <strong>nieprzetworzone</strong> z własnego gospodarstwa (produkcja pierwotna): surowe mleko, jaja, miód, warzywa, owoce.</li>
                  <li><strong>RHD</strong> — bardziej elastyczne: pozwala sprzedawać zarówno produkty <strong>nieprzetworzone, jak i przetworzone</strong> (sery, wędliny, przetwory).</li>
                </ul>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Praktyczna zasada dla serowara</h4>
                  <ul className="space-y-1">
                    <li>🥚 Jaja surowe → SB lub RHD (oba legalne)</li>
                    <li>🥛 Mleko surowe → SB lub RHD</li>
                    <li>🧀 <strong>Ser → wyłącznie RHD</strong> (produkt przetworzony)</li>
                  </ul>
                </div>
                <p>
                  <strong>Czy można prowadzić obie formy naraz?</strong> Tak — przepisy tego nie zabraniają, ale każda forma wymaga <strong>osobnej rejestracji</strong>.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-secondary/50">
                        <th className="text-left p-2 font-semibold">&nbsp;</th>
                        <th className="text-left p-2 font-semibold">Sprzedaż bezpośrednia</th>
                        <th className="text-left p-2 font-semibold">RHD</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Co można sprzedać</td>
                        <td className="p-2">tylko nieprzetworzone</td>
                        <td className="p-2">nieprzetworzone i przetworzone (ser!)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Limity ilościowe</td>
                        <td className="p-2">tak (np. do 1000 l surowego mleka/tydz.)</td>
                        <td className="p-2">do konsumenta finalnego — brak, cały kraj; limity tylko przy dostawach do sklepów/restauracji</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Rejestracja (zwierzęce)</td>
                        <td className="p-2">powiatowy lekarz weterynarii, min. 30 dni</td>
                        <td className="p-2">powiatowy lekarz weterynarii, min. 30 dni</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Rejestracja (roślinne)</td>
                        <td className="p-2">Sanepid (PSSE)</td>
                        <td className="p-2">Sanepid (PSSE), min. 14 dni</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Terytorialność (zwierzęce)</td>
                        <td className="p-2">województwo produkcji + sąsiednie (wyjątek: targi/festyny ogólnopolskie)</td>
                        <td className="p-2">do konsumenta końcowego bez ograniczeń; do sklepów/restauracji — województwo + sąsiednie</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground">
                  Podatek w RHD: przy przetwórstwie nieprzemysłowym — zwolnienie z PIT do 100 000 zł przychodu rocznie, powyżej ryczałt 2% od nadwyżki.
                </p>
              </CardContent>
            </Card>

            {/* Sekcja 2: Podstawy prawne */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Podstawy prawne RHD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Ustawy</h4>
                  <ul className="space-y-2">
                    <li className="pl-4 border-l-2 border-primary/30">
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20061711126" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Ustawa z dnia 25 sierpnia 2006 r. o bezpieczeństwie żywności i żywienia
                      </a> – w tej ustawie wprowadzono rozdział dotyczący RHD („rozdział 10a")
                    </li>
                    <li className="pl-4 border-l-2 border-primary/30">
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20160001961" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Ustawa z dnia 16 listopada 2016 r. o zmianie niektórych ustaw w celu ułatwienia sprzedaży żywności przez rolników
                      </a> (Dz. U. poz. 1961) – wprowadziła definicję RHD i warunki
                    </li>
                    <li className="pl-4 border-l-2 border-primary/30">
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20180002242" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Ustawa z dnia 9 listopada 2018 r. o zmianie niektórych ustaw w celu ułatwienia sprzedaży żywności przez rolników do sklepów i restauracji
                      </a> (Dz. U. poz. 2242) – wprowadziła kolejne ułatwienia dla RHD
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rozporządzenia</h4>
                  <ul className="space-y-2">
                    <li className="pl-4 border-l-2 border-primary/30">
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20160002159" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Rozporządzenie Ministra Rolnictwa i Rozwoju Wsi z dnia 16 grudnia 2016 r. w sprawie maksymalnej ilości żywności zbywanej w ramach rolniczego handlu detalicznego oraz zakresu i sposobu jej dokumentowania
                      </a> – określa limity i dokumentację
                    </li>
                    <li className="pl-4 border-l-2 border-primary/30">
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20220002039" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Rozporządzenie Ministra Rolnictwa i Rozwoju Wsi z dnia 12 września 2022 r. w sprawie maksymalnej ilości żywności zbywanej w ramach rolniczego handlu detalicznego do zakładów prowadzących handel detaliczny
                      </a> z przeznaczeniem dla konsumenta finalnego oraz zakresu i sposobu jej dokumentowania – nowsze regulacje
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 3: Kto może prowadzić RHD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Kto może prowadzić RHD i jakie warunki muszą być spełnione
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Kto?</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Rolnik prowadzący gospodarstwo rodzinne lub inny rolniczy podmiot</li>
                    <li>Wymagane: posiadanie surowca (hodowla, chów, uprawa) – albo częściowo własnego</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Warunki podstawowe</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Produkcja lub przetworzenie żywności, która pochodzi w całości lub w części z własnej uprawy/hodowli/chowu</li>
                    <li>Jeśli produkt zawiera tylko jeden składnik (np. jaja, mleko, warzywa) — ten składnik musi pochodzić w całości z własnego gospodarstwa</li>
                    <li>Jeśli produkt zawiera więcej niż jeden składnik (np. dżem, ser z dodatkami) — wystarczy, że co najmniej jeden składnik pochodzi z własnego gospodarstwa</li>
                    <li>Zbywanie konsumentowi końcowemu lub do określonych zakładów handlu detalicznego z przeznaczeniem dla konsumenta końcowego</li>
                    <li>Wymogi sanitarnie-higieniczne zgodnie z prawem żywnościowym: np. rejestracja zakładu, przestrzeganie przepisów higieny, oznakowanie</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Odbiorcy i obszar sprzedaży</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Odbiorcą podstawowym jest konsument końcowy — osoba fizyczna kupująca produkt dla siebie, nie w ramach działalności przedsiębiorstwa spożywczego</li>
                    <li>Sprzedaż może być także do zakładów prowadzących handel detaliczny (np. sklep, restauracja) – ale z pewnymi ograniczeniami obszarowymi w przypadku produktów pochodzenia zwierzęcego lub żywności złożonej</li>
                    <li>W przypadku żywności pochodzenia zwierzęcego lub złożonej – sprzedaż wyłącznie na obszarze województwa, w którym produkcja albo w powiatach sąsiednich</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 4: Proces rejestracji */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Proces rejestracji i prowadzenia RHD – krok po kroku
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold mb-1">Określenie asortymentu</h4>
                      <p className="text-sm text-muted-foreground">Np. sery, mleko, przetwory owocowe, chleby, miód. Sprawdź, czy Twój surowiec pochodzi z własnego gospodarstwa albo co najmniej jeden składnik z własnej produkcji.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold mb-1">Wybór miejsca produkcji/zakładu oraz miejsca sprzedaży</h4>
                      <p className="text-sm text-muted-foreground">Np. gospodarstwo + stoisko na targu, kiermasz, sprzedaż w miejscu produkcji.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold mb-1">Złożenie wniosku o wpis zakładu/zgłoszenia działalności</h4>
                      <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside mt-2">
                        <li>Jeżeli żywność zawiera tylko składniki roślinne → zgłoszenie do właściwej stacji sanitarno-epidemiologicznej (Państwowej Inspekcji Sanitarnej) co najmniej 14 dni przed rozpoczęciem działalności</li>
                        <li>Jeżeli żywność zawiera pochodzenie zwierzęce lub jest „żywnością złożoną" (roślinne + zwierzęce składniki) → wniosek do właściwego powiatowego lekarza weterynarii co najmniej 30 dni przed rozpoczęciem</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold mb-1">Oznakowanie miejsca sprzedaży</h4>
                      <p className="text-sm text-muted-foreground">W miejscu zbywania żywności w ramach RHD należy w sposób czytelny umieścić m.in.: napis „rolniczy handel detaliczny", imię nazwisko/nazwa podmiotu, adres miejsca produkcji. W przypadku żywności z udziałem zwierzęcego – również numer weterynaryjny (jeśli został nadany).</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
                    <div>
                      <h4 className="font-semibold mb-1">Spełnianie wymagań higienicznych-sanitarnych</h4>
                      <p className="text-sm text-muted-foreground">Zgodnie z rozporządzeniami UE i krajowymi (np. <a href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover underline">rozporządzenie (WE) nr 852/2004</a> w sprawie higieny środków spożywczych).</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">6</div>
                    <div>
                      <h4 className="font-semibold mb-1">Dokumentowanie sprzedaży i ewidencjonowanie</h4>
                      <p className="text-sm text-muted-foreground">W zależności od zakresu działania, warto prowadzić dokumentację surowców (zwłaszcza udział własnego surowca), sprzedaży, limitów.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">7</div>
                    <div>
                      <h4 className="font-semibold mb-1">Monitorowanie limitów oraz preferencji podatkowych</h4>
                      <p className="text-sm text-muted-foreground">Opisane w dalszej części przewodnika.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja: Numer RHD (WNI) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Numer RHD — czym jest, jak wygląda i gdzie go podawać
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Potocznie „<strong>numer RHD</strong>", formalnie <strong>Weterynaryjny Numer Identyfikacyjny (WNI)</strong> — nadaje go <strong>powiatowy lekarz weterynarii</strong> przy rejestracji produkcji obejmującej żywność pochodzenia zwierzęcego lub złożoną (np. sery, wędliny, jaja). Służy do śledzenia partii wyprodukowanych przez konkretny zakład.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">Jak wygląda numer (format)</h4>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li><strong>cyfra 1–2</strong> — symbol województwa (np. 28 = warmińsko-mazurskie)</li>
                    <li><strong>cyfra 3–4</strong> — symbol powiatu</li>
                    <li><strong>cyfra 5–6</strong> — symbol rodzaju działalności</li>
                    <li><strong>cyfra 7 i dalej</strong> — kolejność wpisu w powiecie</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    Na <strong>znaku weterynaryjnym</strong> numer ma postać owalną: u góry kod kraju <strong>PL</strong>, w środku numer zakładu, u dołu skrót <strong>„WE"</strong> (lub „EC"). Na etykiecie produktu zwierzęcego podaje się go zwykle <strong>bez owalnej ramki</strong> — sama liczba.
                  </p>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">A produkty roślinne (Sanepid)?</h4>
                  <p className="text-sm">
                    Przy rejestracji wyłącznie roślinnej (dżemy, soki, pieczywo) w <strong>Sanepidzie</strong> WNI <strong>nie jest nadawany</strong>. Przepisy wymagają podania numeru „o ile taki został nadany" — więc dla produktów roślinnych po prostu go nie podajesz. Wystarczą: napis „rolniczy handel detaliczny", imię i nazwisko oraz adres miejsca produkcji.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Gdzie podać numer — dwie warstwy oznakowania</h4>
                  <ul className="space-y-2 list-disc list-inside text-sm">
                    <li><strong>Tablica/szyld w miejscu sprzedaży</strong>: napis „rolniczy handel detaliczny", imię i nazwisko / nazwa, adres miejsca produkcji oraz WNI (przy żywności zwierzęcej/złożonej).</li>
                    <li><strong>Etykieta na produkcie</strong>: nazwa produktu, skład, data, dane producenta oraz WNI (wskazane przy żywności zwierzęcej).</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    Niuans praktyczny: napis „rolniczy handel detaliczny" z danymi musi być <strong>widoczny w miejscu sprzedaży</strong> — przepisy nie wymagają, by znajdował się na etykiecie produktu. W praktyce stosuje się trwałe tablice (PVC, plexi, sklejka wodoodporna).
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg text-sm">
                  <strong>Uwaga (2026):</strong> od <strong>18 marca 2026 r.</strong> (ustawa o zdrowiu zwierząt) WNI musi uzyskać każdy podmiot utrzymujący zwierzęta (bydło, trzoda, drób, pszczoły) — niezależnie od skali; termin rejestracji upływa <strong>18 czerwca 2026 r.</strong> WNI to odrębny numer — nie zastępuje numeru siedziby stada ARiMR.
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 5: Zakres produkcji */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Zakres produkcji i sprzedaży – co można sprzedawać w ramach RHD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Przykładowe produkty, które mogą być wprowadzone w ramach RHD:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Produkty pochodzenia roślinnego</h4>
                    <p className="text-sm text-muted-foreground">Warzywa, owoce, soki, dżemy, oleje, przetwory owocowo-warzywne</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Produkty pochodzenia zwierzęcego</h4>
                    <p className="text-sm text-muted-foreground">Mleko, sery, jaja, masło, wędliny w niewielkiej skali – o ile spełnione są warunki rejestracji i udziału własnego surowca</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Produkty złożone</h4>
                    <p className="text-sm text-muted-foreground">Potrawy, pieczywo, wyroby garmażeryjne – o ile przynajmniej jeden składnik pochodzi z własnego gospodarstwa</p>
                  </div>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="font-medium">
                    Dla serowarów to oznacza: możesz produkować sery (jeśli masz mleko z własnej hodowli) lub przetwarzać mleko i sprzedawać bezpośrednio w ramach RHD – pod warunkiem, że spełniasz wymogi sanitarne i rejestracyjne.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 6: Preferencje podatkowe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-primary" />
                  Preferencje podatkowe, limity sprzedaży i inne korzyści
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Limity przychodów</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Do pewnego poziomu przychodu rolnik prowadzący RHD może być zwolniony z podatku dochodowego</li>
                    <li>Obecnie limit wynosi <strong>100 000 zł rocznie</strong> przychodu (stan na moment publikacji) dla przychodów z RHD</li>
                    <li>Przed 2022 rokiem limit wynosił znacznie mniej (np. 40 000 zł)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Zwolnienia i uproszczenia</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>W ramach RHD często nie ma obowiązku zakładania działalności gospodarczej w sposób pełny (choć zależnie od sytuacji)</li>
                    <li>Mniej skomplikowana kontrola (w porównaniu do dużych zakładów)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ułatwienia obszarowe i dotyczące sprzedaży</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>W przypadku produktów pochodzenia roślinnego – sprzedaż może odbywać się na terenie całego kraju w niektórych warunkach</li>
                    <li>W przypadku produktów pochodzenia zwierzęcego lub żywności mieszanej („złożonej") – ograniczenia obszarowe (województwo lub sąsiednie powiaty) nadal mogą być stosowane</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja: Zgłoszenie do US i opodatkowanie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-primary" />
                  Zgłoszenie do urzędu skarbowego i opodatkowanie RHD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Czy trzeba zgłaszać RHD do US? Zasadniczo nie.</h4>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>Startujesz RHD → zgłaszasz się tylko do weterynarii (lub Sanepidu).</li>
                    <li>Sprzedajesz poniżej 100 000 zł → nic nie zgłaszasz do US, nie składasz deklaracji.</li>
                    <li>Przekraczasz 100 000 zł → wtedy kontaktujesz się z US.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Zwolnienie z PIT do 100 000 zł</h4>
                  <p className="text-sm mb-2">
                    Przychody z RHD to <strong>przychody z innych źródeł</strong> (art. 20 ust. 1c ustawy o PIT), a nie z działalności gospodarczej. Sprzedaż przetworzonych w sposób inny niż przemysłowy produktów roślinnych i zwierzęcych jest <strong>zwolniona z podatku dochodowego do 100 000 zł rocznie</strong> (wyłączone: działy specjalne produkcji rolnej i produkty akcyzowe).
                  </p>
                  <p className="text-sm font-medium mb-1">Warunki zwolnienia (wszystkie muszą być spełnione):</p>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li><strong>Własny surowiec ≥ 50%</strong> składu produktu (bez wody).</li>
                    <li><strong>Brak zatrudnienia</strong> — bez umów o pracę/zlecenie/dzieło (wyjątki: ubój, przemiał zbóż, tłoczenie oleju/soku, sprzedaż na festynach).</li>
                    <li><strong>Ewidencja</strong> odrębna za każdy rok, wpisy w dniu sprzedaży.</li>
                    <li><strong>Nieprzemysłowe</strong> przetwarzanie.</li>
                  </ul>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-3 rounded mt-3">
                    <p className="text-sm"><strong>Uwaga na pułapkę 50%:</strong> to inny próg niż sanitarny. Do celów sanitarnych wystarczy 1 składnik z własnego gospodarstwa, ale do <strong>zwolnienia podatkowego</strong> własny surowiec musi stanowić ≥ 50% składu. Produkt z jednym symbolicznym własnym dodatkiem (np. tylko przyprawa) mieści się w RHD sanitarnie, ale wypada ze zwolnienia z PIT.</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Powyżej 100 000 zł — ryczałt 2%</h4>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>Nadwyżkę można opodatkować <strong>ryczałtem 2% od przychodu</strong> — to opcja, nie obowiązek.</li>
                    <li>Jeśli nie wybierzesz ryczałtu, nadwyżka wchodzi do <strong>skali podatkowej</strong> jako przychód z innych źródeł (PIT-36).</li>
                    <li>2% od przychodu jest zwykle znacznie korzystniejsze niż 12%/32% od dochodu.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Kiedy i jak zgłosić wybór ryczałtu</h4>
                  <p className="text-sm">
                    Pisemne oświadczenie do naczelnika US właściwego wg miejsca zamieszkania — <strong>do 20. dnia miesiąca następującego po miesiącu pierwszego przychodu</strong> (lub do końca roku, jeśli pierwszy przychód był w grudniu). Oświadczenia <strong>nie składasz ponownie</strong> w kolejnych latach (obowiązuje dalej, chyba że zawiadomisz o rezygnacji). US nie wydaje potwierdzenia — nie czekaj na odpowiedź.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-secondary/50">
                        <th className="text-left p-2 font-semibold">Dokument</th>
                        <th className="text-left p-2 font-semibold">Kiedy</th>
                        <th className="text-left p-2 font-semibold">Uwagi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="p-2">Wniosek o wpis do rejestru PLW</td><td className="p-2">30 dni przed startem</td><td className="p-2">weterynaria — jedyny obowiązkowy start</td></tr>
                      <tr className="border-b"><td className="p-2">Oświadczenie o wyborze ryczałtu</td><td className="p-2">do 20. dnia miesiąca po pierwszym przychodzie (lub do 31.12 gdy grudzień)</td><td className="p-2">pismo swobodne do naczelnika US, brak oficjalnego formularza</td></tr>
                      <tr className="border-b"><td className="p-2">PIT-28</td><td className="p-2">15 lutego – 30 kwietnia roku następnego</td><td className="p-2">deklaracja roczna, tylko jeśli wybrałeś ryczałt</td></tr>
                      <tr><td className="p-2">Wpłata ryczałtu</td><td className="p-2">do 20. dnia miesiąca za miesiąc poprzedni</td><td className="p-2">miesięcznie lub kwartalnie</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg text-sm">
                  <strong>100 000 zł to limit na osobę, nie na gospodarstwo.</strong> Limit dotyczy podatnika (osoby fizycznej). Jeśli sprzedaż prowadzą małżonkowie osobno zarejestrowani w RHD, każde ma własny limit — ale wymaga to odrębnych rejestracji weterynaryjnych i odrębnych ewidencji.
                </div>
              </CardContent>
            </Card>

            {/* Sekcja: Faktura, kasa fiskalna, ewidencja */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Faktura, paragon, kasa fiskalna i ewidencja w RHD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Co wystawiasz kupującemu?</h4>
                  <p className="text-sm mb-3">
                    Przepisy są liberalne. Rolnik ryczałtowy sprzedający produkty z własnej produkcji jest <strong>zwolniony z obowiązku wystawiania faktury VAT</strong>, a jako podmiot niebędący czynnym podatnikiem VAT — także rachunku.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Sytuacja</th>
                          <th className="text-left p-2 font-semibold">Dokument</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b"><td className="p-2">Sprzedaż na targu / w gospodarstwie konsumentowi</td><td className="p-2"><strong>Nic nie musisz wystawiać</strong></td></tr>
                        <tr className="border-b"><td className="p-2">Kupujący prosi o potwierdzenie</td><td className="p-2">Odręczny rachunek / dowód sprzedaży (nieobowiązkowy, dobra praktyka)</td></tr>
                        <tr className="border-b"><td className="p-2">Sprzedaż do sklepu / restauracji (B2B)</td><td className="p-2">Dokument identyfikujący partię (WNI, dane producenta, opis towaru) — wymóg weterynaryjny, nie podatkowy</td></tr>
                        <tr><td className="p-2">Firma prosi o fakturę</td><td className="p-2">Możesz wystawić, ale nie jesteś zobligowany jako rolnik ryczałtowy</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Przy sprzedaży detalicznej konsumentowi finalnemu (targ, brama gospodarstwa) nie musisz wystawiać niczego. Ewidencja RHD to dokument <strong>wewnętrzny</strong> — dla Ciebie, nie dla kupującego.
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Kasa fiskalna — nie jest potrzebna</h4>
                  <p className="text-sm">
                    Rolnik ryczałtowy prowadzący RHD jest <strong>zwolniony z obowiązku kasy fiskalnej — niezależnie od kwoty obrotu</strong> (zwolnienie przedmiotowe, szersze niż ogólny limit 20 000 zł). Podstawa: rozporządzenie Ministra Finansów z 17 grudnia 2024 r. (Dz.U. 2024 poz. 1902), poz. 49 załącznika; obowiązuje do 31 grudnia 2027 r. Kasa staje się obowiązkowa dopiero, gdy zrezygnujesz ze statusu rolnika ryczałtowego i zarejestrujesz się jako czynny podatnik VAT (wtedy 2 miesiące na zakup kasy po przekroczeniu 20 000 zł obrotu na rzecz osób fizycznych).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ewidencja sprzedaży RHD — co musi zawierać</h4>
                  <p className="text-sm mb-2">To jedyny obowiązkowy dokument wewnętrzny. Ewidencja przetworzonych produktów roślinnych i zwierzęcych musi zawierać co najmniej:</p>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li>numer kolejnego wpisu</li>
                    <li>datę uzyskania przychodu</li>
                    <li>kwotę przychodu (z transakcji / dnia)</li>
                    <li>przychód narastająco od początku roku (licznik limitu 100 000 zł)</li>
                    <li>rodzaj i ilość przetworzonych produktów</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Zasada:</strong> dzienne przychody ewidencjonuje się <strong>w dniu sprzedaży</strong> (nie „z pamięci" po tygodniu). Ewidencję prowadzi się odrębnie za każdy rok podatkowy i przechowuje przez <strong>2 lata</strong> (może ją sprawdzić kontrola skarbowa lub IJHARS). Do prowadzenia ewidencji możesz użyć naszego{" "}
                    <Link to="/system-ewidencji" className="text-primary hover:underline">systemu ewidencji sprzedaży</Link>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja: Faktura VAT RR */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-primary" />
                  Faktura VAT RR — dodatkowe 7% przy sprzedaży do firm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  To ważne przy sprzedaży <strong>do sklepu, restauracji lub hurtowni</strong> (B2B). <strong>Fakturę VAT RR wystawia nabywca</strong> (czynny podatnik VAT), a nie Ty — na podstawie art. 116 ust. 1 ustawy o VAT, w dwóch egzemplarzach; oryginał trafia do Ciebie.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Przetworzony ser też się liczy</h4>
                  <p className="text-sm">
                    Przetworzone produkty RHD <strong>są „produktami rolnymi"</strong> w rozumieniu VAT: art. 2 pkt 20 ustawy o VAT (po nowelizacji od 1 lipca 2020 r.) odsyła do art. 20 ust. 1c ustawy o PIT — a to właśnie definicja przychodów z RHD (produkty przetworzone w sposób inny niż przemysłowy). Czyli na Twój ser <strong>można wystawić fakturę VAT RR</strong>. Uwaga: w sieci krążą artykuły twierdzące, że dla produktów przetworzonych VAT RR nie przysługuje — jest to sprzeczne z brzmieniem ustawy po nowelizacji z 2020 r.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Zryczałtowany zwrot 7% — realny zysk</h4>
                  <p className="text-sm mb-2">Nabywca dolicza do ceny netto <strong>7% zryczałtowanego zwrotu podatku</strong> i przekazuje Ci powiększoną kwotę (a sobie odlicza te 7% jako VAT naliczony). To rekompensata za brak możliwości odliczenia VAT od Twoich zakupów (kultury, opakowania, prąd).</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <tbody>
                        <tr className="border-b"><td className="p-2">Sprzedajesz sery za</td><td className="p-2 text-right font-medium">1000,00 zł netto</td></tr>
                        <tr className="border-b"><td className="p-2">Zryczałtowany zwrot 7%</td><td className="p-2 text-right font-medium">+ 70,00 zł</td></tr>
                        <tr><td className="p-2 font-semibold">Nabywca przelewa Ci</td><td className="p-2 text-right font-bold">1070,00 zł</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Warunki, które muszą być spełnione</h4>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li><strong>Nabywca</strong> — czynny podatnik VAT (restauracja, sklep, hurtownia).</li>
                    <li><strong>Ty</strong> — rolnik ryczałtowy, nieprowadzący ksiąg rachunkowych.</li>
                    <li><strong>Zapłata przelewem</strong> na Twój rachunek bankowy — gotówka wyklucza odliczenie u nabywcy.</li>
                    <li><strong>Tytuł przelewu</strong> — numer i data faktury VAT RR.</li>
                    <li><strong>Twoje oświadczenie</strong> o statusie rolnika ryczałtowego (formuła niżej).</li>
                    <li><strong>Podpisy</strong> obu stron (ręczne lub kwalifikowany podpis elektroniczny).</li>
                    <li><strong>Archiwizacja</strong> — min. 5 lat.</li>
                  </ul>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Formuła oświadczenia (art. 116 ust. 3 ustawy o VAT)</h4>
                  <p className="text-sm italic">
                    „Oświadczam, że jestem rolnikiem ryczałtowym zwolnionym od podatku od towarów i usług na podstawie art. 43 ust. 1 pkt 3 ustawy o podatku od towarów i usług."
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Bez tego oświadczenia nabywca nie może wystawić faktury VAT RR. Dobra praktyka: przygotuj gotowe oświadczenie (z danymi i numerem rachunku) i wręczaj przy pierwszej transakcji z każdym nowym nabywcą.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Kto NIE wystawia VAT RR</h4>
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    <li><strong>Konsument</strong> (osoba fizyczna) na targu — nic; Ty również nic nie wystawiasz (jesteś ustawowo zwolniony).</li>
                    <li><strong>Firma zwolniona z VAT</strong> (nie jest czynnym podatnikiem) — brak VAT RR.</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  Kto fizycznie wypełnia druk? Formalnie nabywca — ale dopuszczalne jest, że rolnik sam sporządza fakturę VAT RR, gdy nabywca udostępni formularz i przechowa kopię. <strong>KSeF (2026):</strong> dla faktur VAT RR pozostaje fakultatywny — papier z podpisami nadal działa (od 1 kwietnia 2026 r. można też wystawiać w KSeF po uwierzytelnieniu i złożeniu oświadczenia o statusie rolnika ryczałtowego).
                </p>
              </CardContent>
            </Card>

            {/* Sekcja 7: Wymogi bezpieczeństwa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Wymogi związane z bezpieczeństwem żywności, higieną i jakością
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Produkcja i sprzedaż w ramach RHD podlegają nadzorowi i kontroli organów kontroli żywności: dla produktów roślinnych - inspekcja sanitarna (Państwowa Inspekcja Sanitarna)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Dla produktów pochodzenia zwierzęcego lub żywności złożonej - nadzór przez powiatowego lekarza weterynarii</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Przestrzeganie wymagań higieniczno-sanitarnych zgodnie z <a href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover underline">rozporządzeniem (WE) nr 852/2004</a> oraz przepisami krajowymi</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Oznakowanie produkcji i miejsca sprzedaży: sprawiedliwa informacja dla konsumenta, m.in. dane producenta, adres, informacja „rolniczy handel detaliczny"</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Produkty opakowane muszą spełniać wymagania zawarte w <a href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32011R1169" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover underline">rozporządzeniu UE nr 1169/2011</a> w sprawie przekazywania konsumentom informacji o żywności</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Sekcja 8: Praktyczne wskazówki */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Praktyczne wskazówki dla serowarów i rolników
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Ustal w gospodarstwie, jakie surowce masz i w jakim procencie pochodzą z własnej uprawy/hodowli – to ważne dla spełnienia warunku „co najmniej jeden składnik"</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Rozważ lokalizację sprzedaży: gospodarstwo, targ, kiermasz – miejsce, gdzie konsument końcowy może dokonać zakupu</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Zadbaj o rejestrację zgodnie z rodzajem produkcji: jeśli sera zawierają mleko własne i dodatek, albo wędliny – konieczna rejestracja u lekarza weterynarii</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Zaplanuj oznakowanie miejsca sprzedaży (tablica „rolniczy handel detaliczny", dane producenta, adres)</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Zadbaj o oznakowanie produktów – etykiety zgodne z wymogami żywnościowymi (składniki, alergeny, producent)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Prowadź prostą ewidencję sprzedaży (ilości, odbiorcy, miejsca sprzedaży) – przydatne z punktu widzenia nadzoru i dokumentacji</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Sprawdź, czy osiągasz limity przychodu – jeżeli przekroczysz 100 000 zł (stan na dziś) mogą ulec zmianie zasady podatkowe</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Pamiętaj o ograniczeniach obszarowych: jeśli produkujesz żywność pochodzenia zwierzęcego lub złożonej, sprawdź, gdzie możesz ją sprzedawać</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Warto rozważyć dofinansowania: np. w ramach Agencja Restrukturyzacji i Modernizacji Rolnictwa gdy prowadzi się przetwórstwo i sprzedaż w ramach RHD</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 9: Podsumowanie */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Podsumowanie kluczowych punktów</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>RHD to dobre rozwiązanie dla rolników, w tym serowarów, którzy chcą sprzedawać bezpośrednio produkty własnej produkcji</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Wymaga spełnienia warunków dotyczących udziału własnego surowca, rejestracji, higieny i oznakowania</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Zyskujesz uproszczoną formę sprzedaży detalicznej – może to być ważne przy budowaniu marki lokalnej</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Musisz jednak pilnować przepisów, limitów przychodów i zakresu działalności</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Dobrze zaplanowana działalność RHD może stać się źródłem dodatkowych dochodów dla gospodarstwa</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Link do EUR-Lex */}
            <div className="bg-secondary/50 p-6 rounded-lg text-center">
              <p className="mb-4">
                Wymienione dokumenty prawne w pełnym brzmieniu można znaleźć na oficjalnej stronie EUR-Lex oraz Internetowego Systemu Aktów Prawnych:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://eur-lex.europa.eu/homepage.html?lang=pl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  <FileText className="h-5 w-5" />
                  EUR-Lex (przepisy UE)
                </a>
                <a 
                  href="https://isap.sejm.gov.pl/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  <Scale className="h-5 w-5" />
                  ISAP (przepisy polskie)
                </a>
              </div>
            </div>
          </div>

          {/* See Also Section */}
          <SeeAlso links={seeAlsoLinks} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RHD;
