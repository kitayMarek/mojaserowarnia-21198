import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import DatasetSchema from "@/components/DatasetSchema";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";

interface GlossaryTerm {
  pl: string;
  en: string;
  definition: string;
  category: string;
  link?: string;
  linkLabel?: string;
}

const glossaryTerms: GlossaryTerm[] = [
  // Podstawowe pojęcia
  { pl: "Ser", en: "Cheese", definition: "Produkt mleczny powstający przez koagulację (ścięcie) białek mleka — głównie kazeiny — i oddzielenie powstałego skrzepu od serwatki. Mleko ścina się podpuszczką, kwasem lub kombinacją obu, dzięki czemu ser zagęszcza składniki mleka (białko, tłuszcz, wapń) w trwalszej formie. Znane są tysiące gatunków, różniących się rodzajem mleka (krowie, kozie, owcze, bawole), kulturami, sposobem produkcji i czasem dojrzewania.", category: "Podstawy", link: "/przepisy", linkLabel: "Przepisy na sery" },
  { pl: "Serowarstwo", en: "Cheesemaking", definition: "Rzemiosło i technologia wytwarzania sera z mleka — od przygotowania surowca, przez zaszczepienie kulturami i dodanie podpuszczki, po krojenie skrzepu, formowanie, prasowanie, solenie i dojrzewanie. Łączy mikrobiologię (kultury, pleśnie), chemię (pH, koagulacja) i rzemiosło; każdy etap wpływa na smak, teksturę i bezpieczeństwo gotowego sera.", category: "Podstawy", link: "/poradniki", linkLabel: "Poradniki" },
  { pl: "Serowarnia", en: "Cheese dairy / Fromagerie", definition: "Zakład lub pomieszczenie, w którym produkuje się ser — od małej serowarni zagrodowej/farmerskiej (przy gospodarstwie, na własnym mleku) po duże zakłady przemysłowe. W polskim prawie mała serowarnia może działać m.in. w ramach RHD lub MOL; wymaga spełnienia warunków higieniczno-sanitarnych (HACCP) i zwykle nadzoru weterynaryjnego.", category: "Podstawy", link: "/poradnik", linkLabel: "Organizacja serowarni" },
  { pl: "Mleko surowe", en: "Raw milk", definition: "Mleko niepasteryzowane, zachowujące naturalną mikroflorę i enzymy. W serowarstwie bywa cenione za bogatszy, bardziej złożony smak sera, ale wiąże się z większym ryzykiem mikrobiologicznym — dlatego sery z mleka surowego podlegają osobnym wymogom (m.in. minimalny czas dojrzewania). Przy mleku pasteryzowanym, w przeciwieństwie do surowego, często dodaje się chlorek wapnia, by przywrócić zdolność krzepnięcia.", category: "Podstawy", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Pasteryzacja", en: "Pasteurization", definition: "Obróbka termiczna mleka eliminująca bakterie chorobotwórcze — najczęściej ok. 72°C przez 15 sekund (HTST) lub łagodniej 63°C przez 30 minut. Zwiększa bezpieczeństwo i powtarzalność, ale częściowo uszkadza białka i niszczy naturalną mikroflorę, dlatego do mleka pasteryzowanego dodaje się kultury starterowe i zwykle chlorek wapnia. Mleko UHT (ultrawysoka temperatura) nie nadaje się do serowarstwa — jego białka są zbyt uszkodzone, by utworzyć dobry skrzep.", category: "Podstawy", link: "/poradnik", linkLabel: "Poradnik" },
  
  // Kultury i enzymy
  { pl: "Kultury starterowe", en: "Starter cultures", definition: "Wyselekcjonowane szczepy bakterii kwasu mlekowego (LAB), które rozpoczynają fermentację, przetwarzając laktozę w kwas mlekowy. To one zakwaszają mleko, uruchamiają działanie podpuszczki, kształtują smak i teksturę oraz — przez obniżenie pH — chronią ser przed bakteriami chorobotwórczymi. Dzieli się je m.in. na mezofilne i termofilne (wg temperatury pracy); dostępne są zwykle jako liofilizat do bezpośredniego dodania (DVI/DVS).", category: "Kultury", link: "/baza-kultur", linkLabel: "Baza kultur" },
  { pl: "Podpuszczka", en: "Rennet", definition: "Preparat enzymatyczny, który ścina mleko, tnąc kazeinę i powodując powstanie skrzepu. Tradycyjnie pozyskiwana z żołądków cieląt (zawiera chymozynę), dziś dostępna też jako mikrobiologiczna (z grzybów/pleśni) i roślinna (np. z ostu) — te dwie są wegetariańskie. Siłę podpuszczki podaje się w jednostkach IMCU, a dawkę dobiera do ilości mleka i typu sera.", category: "Kultury", link: "/sila-podpuszczki", linkLabel: "Kalkulator siły" },
  { pl: "Chymozyna", en: "Chymosin", definition: "Główny enzym podpuszczki odpowiedzialny za krzepnięcie mleka. Tnie kazeinę kappa, destabilizując micele kazeinowe, co prowadzi do ich łączenia się w skrzep. Naturalnie występuje w żołądku cieląt; dziś produkuje się ją także przez fermentację mikroorganizmów (FPC — fermentation-produced chymosin), co daje czystą, wegetariańską i powtarzalną podpuszczkę.", category: "Kultury", link: "/sila-podpuszczki", linkLabel: "Kalkulator siły" },
  { pl: "Kultury mezofilne", en: "Mesophilic cultures", definition: "Bakterie mlekowe działające optymalnie w niższych temperaturach, ok. 20–40°C (najczęściej 25–35°C). To podstawa większości serów świeżych i półtwardych — twarogu, goudy, edamu, cheddara. Część szczepów (typu LD) wytwarza też CO₂, tworząc drobne oczka. Powyżej ok. 40°C giną, dlatego stosuje się je w serach niemocno dogrzewanych.", category: "Kultury", link: "/bakterie-kultury", linkLabel: "Przewodnik kultur" },
  { pl: "Kultury termofilne", en: "Thermophilic cultures", definition: "Bakterie mlekowe działające w wyższych temperaturach, ok. 40–55°C — głównie Streptococcus thermophilus oraz pałeczki Lactobacillus. Wytrzymują wysokie dogrzewanie skrzepu, dlatego są niezbędne w serach włoskich i twardych: mozzarelli, caciotcie, parmezanie, gruyère czy emmentalu.", category: "Kultury", link: "/bakterie-kultury", linkLabel: "Przewodnik kultur" },
  { pl: "Kultury aromatyczne", en: "Aromatic cultures", definition: "Szczepy (m.in. Leuconostoc oraz Lactococcus lactis biovar diacetylactis) wytwarzające związki aromatyczne — przede wszystkim diacetyl o maślanym aromacie — oraz CO₂. Gaz tworzy drobne, nieregularne oczka, a aromat wzbogaca smak serów i produktów mlecznych (maślanka, śmietana, sery holenderskie). Często dodawane do kultur mezofilnych jako składnik smakowy.", category: "Kultury", link: "/bakterie-kultury", linkLabel: "Przewodnik kultur" },
  { pl: "Pleśń szlachetna", en: "Noble mold", definition: "Wyselekcjonowane, jadalne grzyby pleśniowe celowo wprowadzane do serów. Penicillium candidum (i camemberti) tworzy biały, aksamitny nalot na powierzchni (camembert, brie), a Penicillium roqueforti rozwija się wewnątrz jako niebiesko-zielone przerosty (roquefort, gorgonzola, stilton). Pleśnie rozkładają białka i tłuszcze, nadając serom kremowość oraz wyrazisty, pikantny smak.", category: "Kultury", link: "/bakterie-kultury", linkLabel: "Przewodnik kultur" },
  { pl: "Bakterie propionowe", en: "Propionic bacteria", definition: "Bakterie (Propionibacterium freudenreichii subsp. shermanii) odpowiedzialne za charakterystyczne duże oczka w serach typu szwajcarskiego, jak Emmental. Podczas ciepłego etapu dojrzewania przetwarzają kwas mlekowy, wydzielając CO₂ (który tworzy oczka) oraz kwas propionowy nadający słodko-orzechowy smak. Bez nich ser nie wytworzy klasycznych dziur.", category: "Kultury", link: "/bakterie-kultury", linkLabel: "Przewodnik kultur" },
  { pl: "Brevibacterium linens", en: "Brevibacterium linens", definition: "Bakteria skórki (tzw. maziowa) rozwijająca się na serach z mytą skórką — nadaje im pomarańczowo-czerwony kolor oraz intensywny, ostry aromat (Limburger, Munster, Taleggio). Wydziela m.in. związki siarki i kwas izowalerianowy, kojarzony z zapachem stóp. Jej rozwój wspiera się przez regularne mycie skórki solanką.", category: "Kultury", link: "/bakterie-kultury", linkLabel: "Przewodnik kultur" },
  
  // Proces produkcji
  { pl: "Koagulacja", en: "Coagulation", definition: "Proces krzepnięcia mleka — przejścia z płynu w skrzep. Zachodzi pod wpływem podpuszczki (koagulacja enzymatyczna: chymozyna tnie kazeinę, micele się łączą) albo kwasu i wysokiej temperatury (koagulacja kwasowa: białka ścinają się przy niskim pH, jak w ricotcie czy twarogu). Wiele serów wykorzystuje kombinację obu (kwasowo-podpuszczkowa).", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Skrzep", en: "Curd", definition: "Skoagulowana masa białek mleka (głównie kazeiny) z uwięzionym tłuszczem i wodą, powstała po dodaniu podpuszczki lub kwasu — zanim oddzieli się serwatkę. Jego jędrność i „czyste złamanie” decydują o dalszym procesie; skrzep tnie się na ziarno, które potem odwadnia przez dogrzewanie, mieszanie i prasowanie.", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Serwatka", en: "Whey", definition: "Płynna frakcja pozostająca po oddzieleniu skrzepu — zawiera wodę, laktozę, białka serwatkowe (albuminy) i sole mineralne. Nie jest odpadem: z serwatki robi się ricottę (białka ścinają się w wysokiej temperaturze), używa się jej w paszy, a w mleczarstwie do produkcji odżywek białkowych. Świeża serwatka bywa też naturalnym starterem kwasowości.", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Formowanie", en: "Molding", definition: "Nadawanie serowi kształtu przez przełożenie ziarna lub skrzepu do form (foremek). Forma odprowadza serwatkę i nadaje bryłę; jej rodzaj i sposób upakowania wpływają na zwięzłość ciasta oraz obecność (lub brak) otworów mechanicznych. Niektóre sery formuje się „pod serwatką”, by uniknąć pęcherzy powietrza.", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Prasowanie", en: "Pressing", definition: "Usuwanie nadmiaru serwatki i zbijanie ziarna w zwartą bryłę przez nacisk — od lekkiego (sery półtwarde) po bardzo ciężki (sery alpejskie typu gruyère, nawet ok. 10× wagi sera). Reguluje wilgotność i teksturę, łączy ziarna i kształtuje skórkę. Ser zwykle obraca się między kolejnymi, rosnącymi obciążeniami.", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Solenie", en: "Salting", definition: "Dodawanie soli, które pełni kilka ról: konserwuje (hamuje niepożądane drobnoustroje), kształtuje smak, reguluje aktywność kultur i wyciąga wilgoć ze skórki. Sól dodaje się na sucho (wcierając lub mieszając z ziarnem) albo przez zanurzenie w solance. Ilość i moment solenia istotnie wpływają na przebieg dojrzewania.", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Solanka", en: "Brine", definition: "Nasycony lub stężony roztwór soli (często z dodatkiem chlorku wapnia i regulacją pH octem), w którym zanurza się sery, by je posolić. Czas solenia zależy od wielkości sera (np. kilka godzin na kilogram). Solanka tworzy skórkę i wpływa na teksturę; trzeba ją utrzymywać w odpowiedniej temperaturze i czystości, by służyła wielokrotnie.", category: "Proces", link: "/poradnik", linkLabel: "Kalkulator solanki" },
  { pl: "Dojrzewanie", en: "Aging / Ripening / Affinage", definition: "Kontrolowane leżakowanie sera (affinage) w określonej temperaturze i wilgotności, podczas którego rozwija się smak, aromat i tekstura. Enzymy i mikroorganizmy rozkładają białka (proteoliza) i tłuszcze (lipoliza), a na skórce i/lub wewnątrz pracują pleśnie i bakterie. Trwa od kilku dni (sery świeże) po lata (twarde); wymaga obracania, a często mycia lub pielęgnacji skórki.", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Pielęgnacja skórki", en: "Rind care", definition: "Zabiegi na powierzchni sera w trakcie dojrzewania: obracanie, wycieranie, mycie solanką (lub piwem/winem), szczotkowanie, oklepywanie pleśni albo woskowanie. Kontrolują wilgotność i mikroflorę skórki, zapobiegają niepożądanym pleśniom i kształtują smak — np. mycie solanką sprzyja bakteriom maziowym nadającym ostry aromat.", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Krojenie skrzepu", en: "Cutting the curd", definition: "Dzielenie skrzepu na mniejsze ziarna — najczęściej harfą serowarską — by uwolnić serwatkę. Wielkość ziarna decyduje o wilgotności sera: im drobniejsze cięcie, tym więcej wody ucieka i tym twardszy ser (ziarno wielkości ryżu do serów twardych, większe kawałki do miękkich). Moment cięcia wyznacza m.in. metoda flokulacji.", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Dogrzewanie", en: "Scalding", definition: "Stopniowe podgrzewanie pociętego skrzepu (często do 38–55°C, zależnie od sera), które kurczy ziarno i przyspiesza oddawanie serwatki — daje twardszy, suchszy ser. Tempo i końcowa temperatura są kluczowe: zbyt szybkie lub zbyt wysokie dogrzewanie może uszkodzić ziarno albo zabić kultury (zwłaszcza mezofilne).", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Cheddaring", en: "Cheddaring", definition: "Charakterystyczny etap produkcji cheddara: po odsączeniu serwatki bloki skrzepu układa się i wielokrotnie obraca oraz przekłada, by pod własnym ciężarem dalej się odwadniały i nabierały włóknistej, „łykowatej” struktury przy stopniowym zakwaszaniu. Następnie ser mieli się, soli i prasuje.", category: "Proces", link: "/przepisy/cheddar", linkLabel: "Przepis na Cheddar" },
  { pl: "Ciągnięcie ciasta", en: "Stretching / Pasta filata", definition: "Technika „pasta filata”: skrzep o odpowiednim pH zanurza się w gorącej wodzie lub serwatce (ok. 77–82°C) i rozciąga oraz składa jak ciasto, aż stanie się gładki, błyszczący i elastyczny. Tworzy charakterystyczną, włóknistą, ciągnącą się strukturę serów takich jak mozzarella, scamorza czy provolone.", category: "Proces", link: "/przepisy/mozzarella", linkLabel: "Przepis na Mozzarellę" },
  
  // Typy serów
  { pl: "Ser twardy", en: "Hard cheese", definition: "Ser o niskiej zawartości wody (zwykle poniżej ok. 40%), długo dojrzewający — miesiące, a nawet lata. Drobne krojenie skrzepu, wysokie dogrzewanie i mocne prasowanie dają zwięzłą, czasem krystaliczną teksturę i skoncentrowany smak. Przykłady: parmezan, gruyère, emmental, dojrzały cheddar; często tarkowalne.", category: "Typy", link: "/przepisy", linkLabel: "Przepisy" },
  { pl: "Ser półtwardy", en: "Semi-hard cheese", definition: "Ser o średniej zawartości wody i twardości, zwykle krojalny i elastyczny, dojrzewający od kilku tygodni do kilku miesięcy. To najliczniejsza grupa serów stołowych — gouda, edam, tylżycki, młody cheddar. Powstaje na kulturach mezofilnych, często z prasowaniem i woskowaniem lub pielęgnacją skórki.", category: "Typy", link: "/przepisy", linkLabel: "Przepisy" },
  { pl: "Ser miękki", en: "Soft cheese", definition: "Ser o wysokiej zawartości wody i kremowej, miękkiej konsystencji, zwykle krótko dojrzewający lub świeży. Obejmuje sery z białą pleśnią (camembert, brie), maziowe oraz świeże. Produkowany bez prasowania lub z minimalnym; smak od łagodnego (świeże) po wyrazisty (dojrzałe pleśniowe i maziowe).", category: "Typy", link: "/przepisy", linkLabel: "Przepisy" },
  { pl: "Ser świeży", en: "Fresh cheese", definition: "Ser niedojrzewający lub bardzo krótko dojrzewający, o wysokiej wilgotności i delikatnym, mlecznym smaku — twaróg, ricotta, mascarpone, mozzarella, serek wiejski. Często ścinany kwasem (część z nich jest wegetariańska z natury) i przeznaczony do spożycia w ciągu kilku dni. Nie tworzy skórki.", category: "Typy", link: "/przepisy/ricotta", linkLabel: "Przepis na Ricottę" },
  { pl: "Ser pleśniowy", en: "Blue cheese / Mold cheese", definition: "Ser, w którym celowo rozwija się jadalna pleśń — wewnątrz (niebieska, Penicillium roqueforti: roquefort, gorgonzola) lub na powierzchni (biała, Penicillium candidum: camembert, brie). Pleśnie rozkładają białka i tłuszcze, dając kremowość oraz intensywny, pikantny lub grzybowy smak i aromat.", category: "Typy", link: "/przepisy/gorgonzola", linkLabel: "Przepis na Gorgonzolę" },
  { pl: "Ser z białą pleśnią", en: "White mold cheese", definition: "Ser pokryty białym, aksamitnym nalotem pleśni Penicillium candidum (camemberti) — klasyką są camembert i brie. Pleśń dojrzewa ser „od zewnątrz do środka”, rozmiękczając ciasto i nadając grzybowo-maślany smak. Z czasem wnętrze staje się niemal płynne; skórka jest jadalna.", category: "Typy", link: "/przepisy/camembert", linkLabel: "Przepis na Camembert" },
  { pl: "Ser z niebieską pleśnią", en: "Blue-veined cheese", definition: "Ser z niebiesko-zielonymi przerostami pleśni Penicillium roqueforti wewnątrz miąższu (roquefort, gorgonzola, stilton). Aby pleśń się rozwinęła, ser nakłuwa się igłami, dając jej dostęp powietrza. Efekt to wyrazisty, pikantny, słony smak oraz kruche, marmurkowe ciasto.", category: "Typy", link: "/przepisy/roquefort", linkLabel: "Przepis na Roquefort" },
  { pl: "Ser z myciem skórki", en: "Washed-rind cheese", definition: "Ser, którego skórkę podczas dojrzewania regularnie myje się solanką (czasem z piwem, winem lub alkoholem), wspierając rozwój bakterii maziowych (Brevibacterium linens). Daje to lepką, pomarańczowo-czerwoną skórkę oraz intensywny, ostry aromat i smak — Limburger, Munster, Taleggio, Maroilles.", category: "Typy", link: "/przepisy", linkLabel: "Przepisy" },
  { pl: "Ser podpuszczkowy", en: "Rennet cheese", definition: "Ser, którego skrzep powstaje głównie dzięki działaniu podpuszczki (enzymatycznej koagulacji kazeiny) — w odróżnieniu od serów kwasowych. To najszersza grupa serów dojrzewających: od goudy i cheddara po parmezan. Podpuszczka daje elastyczny, dobrze odwadniający się skrzep i umożliwia długie dojrzewanie.", category: "Typy", link: "/sila-podpuszczki", linkLabel: "Kalkulator podpuszczki" },
  { pl: "Ser kwasowy", en: "Acid-set cheese", definition: "Ser, którego skrzep powstaje przez zakwaszenie mleka (kulturami lub bezpośrednio kwasem — sok z cytryny, ocet), często wspomagane temperaturą, bez podpuszczki lub z jej minimalną ilością. Przykłady: twaróg, ricotta, mascarpone, paneer. Te sery są zwykle świeże, miękkie i — gdy bez podpuszczki zwierzęcej — wegetariańskie z natury.", category: "Typy", link: "/przepisy", linkLabel: "Przepisy" },
  
  // Sprzęt
  { pl: "Kocioł serowy", en: "Cheese vat", definition: "Naczynie, w którym podgrzewa się mleko, zaszczepia je kulturami, dodaje podpuszczkę i tnie skrzep. W warunkach domowych to garnek (najlepiej o grubym dnie, ze stali nierdzewnej), w zakładach — kocioł z płaszczem wodnym lub parowym i mieszadłem, pozwalający precyzyjnie sterować temperaturą podczas dogrzewania.", category: "Sprzęt", link: "/poradnik", linkLabel: "Wyposażenie" },
  { pl: "Harfa serowarska", en: "Cheese harp / Curd cutter", definition: "Narzędzie z napiętymi drucikami (pionowymi i poziomymi) do krojenia skrzepu na równe ziarno. Równomierne cięcie jest kluczowe — ziarna jednej wielkości oddają serwatkę w tym samym tempie, co daje jednolitą wilgotność i teksturę. W domu zastępuje ją długi nóż, ale harfa daje lepszy efekt.", category: "Sprzęt", link: "/poradnik", linkLabel: "Wyposażenie" },
  { pl: "Forma serowarska", en: "Cheese mold", definition: "Pojemnik (z otworami) nadający serowi kształt i odprowadzający serwatkę podczas formowania i prasowania. Różne kształty i rozmiary odpowiadają różnym gatunkom; często wyściela się je gazą albo stosuje formy z chustą. Wzór otworów i ścianek może odcisnąć się na skórce sera.", category: "Sprzęt", link: "/poradnik", linkLabel: "Wyposażenie" },
  { pl: "Prasa serowarska", en: "Cheese press", definition: "Urządzenie wywierające kontrolowany nacisk na ser w formie, by usunąć serwatkę i zbić ziarno w zwartą bryłę. Bywa dźwigniowa, śrubowa, sprężynowa lub hydrauliczna; pozwala stopniować obciążenie (np. 4 → 8 → 12 kg) zgodnie z przepisem. Kluczowa dla serów twardych i półtwardych.", category: "Sprzęt", link: "/poradnik", linkLabel: "Wyposażenie" },
  { pl: "Dojrzewalnia", en: "Aging room / Cave", definition: "Pomieszczenie (lub komora, „jaskinia”/cave) o ściśle kontrolowanej temperaturze i wilgotności, w którym sery dojrzewają. Typowo ok. 10–14°C i 80–95% wilgotności — warunki sprzyjające pracy enzymów, pleśni i bakterii skórki, a zarazem chroniące przed wysychaniem i niepożądanymi drobnoustrojami.", category: "Sprzęt", link: "/poradnik", linkLabel: "Wyposażenie" },
  { pl: "Termometr", en: "Thermometer", definition: "Przyrząd do pomiaru temperatury mleka i skrzepu — niezbędny, bo każdy etap (zaszczepianie kultur, dodanie podpuszczki, dogrzewanie) wymaga precyzyjnej temperatury. Kilka stopni różnicy zmienia aktywność kultur i działanie podpuszczki, a więc i efekt końcowy.", category: "Sprzęt", link: "/poradnik", linkLabel: "Wyposażenie" },
  { pl: "pH-metr", en: "pH meter", definition: "Urządzenie do pomiaru kwasowości (pH) mleka, skrzepu i sera — pozwala precyzyjnie śledzić zakwaszanie, które decyduje o teksturze, smaku i bezpieczeństwie. W zaawansowanym serowarstwie pH w kluczowych momentach (np. przed ciągnięciem mozzarelli czy soleniem) jest pewniejszym wyznacznikiem niż sam czas.", category: "Sprzęt", link: "/poradnik", linkLabel: "Wyposażenie" },
  { pl: "Mata drenarsko-prasownicza", en: "Cheese mat / Draining mat", definition: "Mata (z tworzywa albo bambusa/sitowia) ułatwiająca odpływ serwatki spod sera i zapewniająca cyrkulację powietrza pod nim podczas odsączania i dojrzewania. Pomaga równomiernie odwadniać ser i zapobiega gromadzeniu wilgoci od spodu, która sprzyjałaby niepożądanej pleśni.", category: "Sprzęt", link: "/poradnik", linkLabel: "Wyposażenie" },
  
  // Parametry i właściwości
  { pl: "Kwasowość", en: "Acidity", definition: "Poziom pH (kwasowości) mleka i sera — jeden z najważniejszych parametrów kontrolnych w serowarstwie. Decyduje o teksturze (wraz ze spadkiem pH ser traci wapń i z elastycznego staje się kruchy), o smaku (wyczuwalna „kwaskowość”), o bezpieczeństwie (niskie pH hamuje bakterie chorobotwórcze) oraz o działaniu podpuszczki i topliwości. Kwasowość rośnie w miarę pracy kultur starterowych przetwarzających laktozę w kwas mlekowy; mierzy się ją pH-metrem, a jej kontrola to klucz do powtarzalnego sera.", category: "Parametry", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Wilgotność", en: "Moisture content", definition: "Procentowa zawartość wody w serze — parametr, który najbardziej definiuje jego typ: od ok. 80% w serach świeżych, przez sery miękkie i półtwarde, po poniżej 40% w serach twardych typu parmezan. Steruje się nią wielkością krojenia skrzepu, temperaturą dogrzewania, prasowaniem i odsączaniem. Im niższa wilgotność, tym ser twardszy, dłużej się przechowuje i wolniej, ale głębiej dojrzewa.", category: "Parametry", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Zawartość tłuszczu", en: "Fat content", definition: "Udział tłuszczu w serze. Co ważne, podaje się go jako tłuszcz w suchej masie (t.s.m.), a nie jako procent od całej masy sera — ponieważ ser podczas dojrzewania traci wodę, więc procent liczony od całości zmieniałby się z dnia na dzień. Dlatego zawartość tłuszczu liczy się względem suchej masy (tego, co zostaje po odjęciu wody), co daje wartość stałą i porównywalną między serami. Tłuszcz jest głównym nośnikiem smaku, odpowiada za kremowość i odczucie w ustach; sery dzieli się m.in. na pełnotłuste, tłuste i o obniżonej zawartości tłuszczu — więcej tłuszczu to zwykle łagodniejszy, bogatszy smak.", category: "Parametry", link: "/porownanie-wartosci-odzywczych", linkLabel: "Porównanie wartości" },
  { pl: "Sucha masa", en: "Dry matter", definition: "Wszystko, co zostaje w serze po odjęciu wody — białko, tłuszcz i sole mineralne. To „właściwa” masa sera i punkt odniesienia dla zawartości tłuszczu (t.s.m.). Im wyższa sucha masa (czyli mniej wody), tym ser twardszy, bardziej skoncentrowany w smaku i trwalszy w przechowywaniu.", category: "Parametry", link: "/porownanie-wartosci-odzywczych", linkLabel: "Porównanie wartości" },
  { pl: "Oczka", en: "Eyes / Holes", definition: "Otwory w miąższu sera powstające z gazu (głównie CO₂) uwięzionego w cieście. Regularne, okrągłe „oczka” tworzą bakterie propionowe podczas ciepłego etapu dojrzewania — klasyką jest Emmental. Należy je odróżnić od „otworów mechanicznych” (nieregularnych, z niedokładnego formowania) oraz od wad gazowych („wczesne” i „późne wzdęcie”) wywołanych przez bakterie z grupy coli lub Clostridium. Wielkość i rozkład oczek wiele mówią o użytych kulturach i przebiegu dojrzewania.", category: "Parametry", link: "/przepisy/emmental", linkLabel: "Przepis na Emmental" },
  { pl: "Skórka", en: "Rind", definition: "Zewnętrzna warstwa sera, chroniąca wnętrze i regulująca oddawanie wilgoci oraz rozwój smaku. Występuje w wielu formach: naturalna (sucha, twarda), woskowana, biała pleśniowa (Penicillium candidum — camembert, brie), maziowa/myta (Brevibacterium linens — sery o ostrym aromacie) oraz owijana płótnem (cheddar). Część skórek jest jadalna, część (np. woskowana czy silnie maziowa) zwykle nie.", category: "Parametry", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Ciasto", en: "Paste / Body", definition: "Wnętrze (miąższ) sera — jego barwa, gładkość i otwartość. Profesjonalnie ocenia się ciasto jako zwięzłe lub otwarte, gładkie lub ziarniste, elastyczne lub kruche. Charakter ciasta odzwierciedla rodzaj mleka, użyte kultury, sposób solenia oraz stopień dojrzewania (proteolizy, czyli rozkładu białek).", category: "Parametry", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Konsystencja", en: "Texture", definition: "Właściwości dotykowe i strukturalne sera — od miękkiej, smarownej (sery świeże i dojrzałe pleśniowe), przez krojalną i elastyczną (gouda, edam), po twardą i tarkowalną (parmezan). Zależy od zawartości wody i tłuszczu, kwasowości oraz stopnia dojrzewania, a w czasie zmienia się wraz z rozkładem białek.", category: "Parametry", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Aromat", en: "Aroma / Bouquet", definition: "Zespół wrażeń węchowych sera, odrębny od smaku, który silnie różni się między gatunkami — od delikatnych, mlecznych i niemal kwiatowych nut serów świeżych i młodych pleśniowych, po intensywny zapach „spoconych skarpetek” serów maziowych (Limburger, Munster, Taleggio). Ten ostry aromat tworzy bakteria Brevibacterium linens, wydzielając kwas izowalerianowy — ten sam związek, który odpowiada za zapach stóp. Na aromat można wpływać: naturalnie — ziołami i przyprawami (kminek, czosnek), wędzeniem czy myciem skórki solanką, piwem lub winem; oraz przemysłowo — aromatami wędzarniczymi (płynny dym) lub preparatami lipazy wzmacniającymi ostrość.", category: "Parametry", link: "/poradnik", linkLabel: "Poradnik" },
  
  // Prawne i handlowe
  { pl: "RHD (Rolniczy Handel Detaliczny)", en: "Farm Retail Trade", definition: "Rolniczy Handel Detaliczny — uproszczona forma działalności pozwalająca rolnikom produkować żywność (w całości lub części z własnego gospodarstwa) i sprzedawać ją bezpośrednio konsumentom. Obejmuje produkty roślinne i zwierzęce (m.in. sery, mleko, jaja). Główny limit to przychód 100 000 zł rocznie ze zwolnieniem z podatku dochodowego; rejestracja w Sanepidzie (produkty roślinne) lub u powiatowego lekarza weterynarii (produkty zwierzęce).", category: "Prawo", link: "/rhd", linkLabel: "Przewodnik RHD" },
  { pl: "MOL (Działalność Marginalna, Lokalna i Ograniczona)", en: "Marginal, Local and Limited Activity", definition: "Działalność Marginalna, Lokalna i Ograniczona — uproszczona forma produkcji i sprzedaży produktów pochodzenia zwierzęcego (w tym serów) dla małych producentów. Opiera się na limitach ilościowych (dla produktów mlecznych ok. 0,5 tony tygodniowo) i obszarowych (sprzedaż na terenie województwa lub powiatów sąsiednich). Wymaga rejestracji u powiatowego lekarza weterynarii; często wybierana jako docelowy model dla małej serowarni.", category: "Prawo", link: "/mol", linkLabel: "Przewodnik MOL" },
  { pl: "Numer weterynaryjny", en: "Veterinary number", definition: "Indywidualny identyfikator zakładu produkującego żywność pochodzenia zwierzęcego, nadawany po zatwierdzeniu przez Inspekcję Weterynaryjną. Umieszcza się go m.in. na oznakowaniu produktów oraz w miejscu sprzedaży RHD przy produktach zwierzęcych, potwierdzając, że zakład jest pod nadzorem i spełnia wymogi sanitarno-weterynaryjne.", category: "Prawo", link: "/prawo", linkLabel: "Prawo żywnościowe" },
  { pl: "Chroniona Nazwa Pochodzenia", en: "Protected Designation of Origin (PDO)", definition: "Unijne oznaczenie (PDO, pol. ChNP) dla produktów, których wszystkie etapy — produkcja, przetwarzanie i przygotowanie — odbywają się w określonym regionie, z którego cechy produktu bezpośrednio wynikają. To najściślejsze z oznaczeń pochodzenia. Przykłady serów: Parmigiano Reggiano, Roquefort, a w Polsce m.in. Oscypek.", category: "Prawo", link: "/akty-prawne-ue", linkLabel: "Akty prawne UE" },
  { pl: "Chronione Oznaczenie Geograficzne", en: "Protected Geographical Indication (PGI)", definition: "Unijne oznaczenie (PGI, pol. ChOG) dla produktów związanych z określonym regionem, gdy przynajmniej jeden etap produkcji, przetwarzania lub przygotowania odbywa się na tym obszarze, a produkt ma renomę lub cechy łączące go z regionem. Wymóg luźniejszy niż przy Chronionej Nazwie Pochodzenia.", category: "Prawo", link: "/akty-prawne-ue", linkLabel: "Akty prawne UE" },
  { pl: "Gwarantowana Tradycyjna Specjalność", en: "Traditional Speciality Guaranteed (TSG)", definition: "Unijne oznaczenie (TSG, pol. GTS) chroniące tradycyjny skład lub metodę wytwarzania produktu — bez przypisania do konkretnego regionu. Podkreśla „tradycyjność” przepisu lub procesu, a nie pochodzenie geograficzne. Wśród serów GTS ma m.in. Mozzarella; w Polsce GTS to np. pierogi ruskie czy olej rydzowy.", category: "Prawo", link: "/akty-prawne-ue", linkLabel: "Akty prawne UE" },

  // Dodatkowe pojęcia (pod realne zapytania)
  { pl: "Flokulacja", en: "Flocculation", definition: "Metoda wyznaczania momentu cięcia skrzepu — obserwacja pojawienia się pierwszych płatków białka po dodaniu podpuszczki; czas flokulacji mnoży się przez współczynnik zależny od typu sera.", category: "Proces", link: "/kalkulator-beaugel", linkLabel: "Kalkulator flokulacji" },
  { pl: "IMCU", en: "International Milk-Clotting Units", definition: "Międzynarodowa jednostka siły podpuszczki, określająca jej zdolność do krzepnięcia mleka. Im wyższa wartość IMCU, tym silniejsza podpuszczka.", category: "Parametry", link: "/sila-podpuszczki", linkLabel: "Siła podpuszczki" },
  { pl: "Chlorek wapnia (CaCl₂)", en: "Calcium chloride", definition: "Dodatek przywracający mleku pasteryzowanemu zdolność do prawidłowego krzepnięcia — uzupełnia wapń utracony podczas pasteryzacji.", category: "Proces", link: "/poradnik", linkLabel: "Poradnik" },
  { pl: "Lipaza", en: "Lipase", definition: "Enzym rozkładający tłuszcze mleka; dodawany dla intensywniejszego, pikantnego smaku niektórych serów (np. włoskich czy feta).", category: "Kultury", link: "/baza-kultur", linkLabel: "Baza kultur" },
  { pl: "Kultury ochronne (bioprotekcja)", en: "Protective / bioprotective cultures", definition: "Kultury chroniące ser przed niepożądanymi drobnoustrojami (pleśnie, drożdże, bakterie psujące), poprawiające bezpieczeństwo i trwałość produktu.", category: "Kultury", link: "/baza-kultur", linkLabel: "Baza kultur" },
  { pl: "Liofilizat (DVI/DVS)", en: "Lyophilizate / freeze-dried", definition: "Forma kultur i podpuszczki w postaci wysuszonego proszku do bezpośredniego dodania do mleka (Direct Vat Inoculation/Set), bez wcześniejszego namnażania.", category: "Kultury", link: "/baza-kultur", linkLabel: "Baza kultur" },
];

const categories = [...new Set(glossaryTerms.map(term => term.category))];

const Slownik = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(term => {
      const matchesSearch = searchQuery === "" ||
        term.pl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === null || term.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const groupedTerms = useMemo(() => {
    return categories.reduce((acc, category) => {
      const termsInCategory = filteredTerms.filter(term => term.category === category);
      if (termsInCategory.length > 0) {
        acc[category] = termsInCategory;
      }
      return acc;
    }, {} as Record<string, GlossaryTerm[]>);
  }, [filteredTerms]);

  const datasetVariables = [
    "polish_term",
    "english_term",
    "definition",
    "category",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Helmet>
        <title>Słownik Serowarski Polsko-Angielski | Moja Serowarnia</title>
        <meta 
          name="description" 
          content="Kompleksowy słownik terminów serowarskich polsko-angielski. Ponad 60 terminów z definicjami: kultury starterowe, podpuszczka, koagulacja, dojrzewanie i więcej."
        />
        <meta name="keywords" content="słownik serowarski, terminologia serowarska, cheese glossary, cheesemaking terms, kultury bakteryjne, podpuszczka, rennet" />
        <link rel="canonical" href="https://mojaserowarnia.pl/slownik" />
      </Helmet>

      <DatasetSchema
        name="Słownik Terminów Serowarskich Polsko-Angielski"
        description="Dwujęzyczny słownik terminologii serowarskiej zawierający ponad 60 terminów z definicjami, pogrupowanych w kategorie tematyczne."
        url="https://mojaserowarnia.pl/slownik"
        keywords={["słownik serowarski", "terminologia serowarska", "cheese glossary", "cheesemaking terminology"]}
        creator={{ name: "Moja Serowarnia" }}
        variableMeasured={datasetVariables}
        distribution={[
          { encodingFormat: "text/html", contentUrl: "https://mojaserowarnia.pl/slownik" }
        ]}
      />

      <Navigation />

      <main className="container mx-auto px-4 py-8 mt-20">
        <PageBreadcrumbs
          items={[
            { label: "Słownik terminów" }
          ]}
        />

        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Słownik Serowarski
            </h1>
            <p className="text-lg text-muted-foreground">
              Polsko-angielski słownik terminów serowarskich z definicjami
            </p>
          </header>

          <TLDRSection>
            <p>
              <strong>Słownik terminów serowarskich (Cheese Glossary)</strong> zawiera {glossaryTerms.length}+ pojęć 
              z dziedziny serowarstwa w języku polskim i angielskim. Obejmuje: kultury starterowe (starter cultures), 
              podpuszczkę (rennet), procesy produkcji (cheesemaking processes), typy serów (cheese types), 
              sprzęt (equipment) oraz terminy prawne (RHD, MOL, PDO/PGI/TSG).
            </p>
          </TLDRSection>

          {/* Search and Filter */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Szukaj terminu (PL/EN)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Wszystkie
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Znaleziono: {filteredTerms.length} terminów
              </p>
            </CardContent>
          </Card>

          {/* Glossary Terms */}
          <div className="space-y-8">
            {Object.entries(groupedTerms).map(([category, terms]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary">#</span>
                    {category}
                    <Badge variant="secondary" className="ml-2">{terms.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {terms.map((term, index) => (
                      <div key={index} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {term.pl}
                            </h3>
                            <p className="text-sm text-primary font-medium">
                              {term.en}
                            </p>
                            {term.link && (
                              <Link 
                                to={term.link} 
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {term.linkLabel || "Więcej"}
                              </Link>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground md:text-right md:max-w-[60%]">
                            {term.definition}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTerms.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nie znaleziono terminów pasujących do wyszukiwania.
                </p>
              </CardContent>
            </Card>
          )}

          <SeeAlso
            links={[
              { href: "/baza-kultur", title: "Baza kultur bakteryjnych" },
              { href: "/przepisy", title: "Przepisy na sery" },
              { href: "/poradniki", title: "Poradniki serowarskie" },
              { href: "/bakterie-kultury", title: "Przewodnik po kulturach" },
              { href: "/prawo", title: "Prawo żywnościowe" },
            ]}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Slownik;
