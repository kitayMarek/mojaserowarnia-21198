import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Tytuły kart i opisy stron mojapasza.com.
 *
 * Strony pasz pochodzą z Serowarni i same ustawiają document.title z dopiskiem
 * „| Moja Serowarnia” (KalkulatorPasz, KalkulatorPaszBydlo, Auth), a PaszeHub
 * bierze tytuł z metaStron.ts Serowarni, którego tu nie ma. Żeby nie ruszać
 * tych stron, ten komponent pilnuje <head>: gdy strona wpisze swój tytuł albo
 * opis, od razu przywraca wersję mojapasza. Strona ustawia go w useEffect,
 * czyli po nas, dlatego obserwator, a nie jednorazowe ustawienie.
 *
 * Tytuł strony głównej trzyma frazę z Google („kalkulator paszy”, 23.10.2026
 * pozycja 1,7 dla „kalkulator paszy dla kur”), bo przy przełączeniu przejmie
 * ruch z /kalkulator-pasz. Limity jak w metaStron.ts: tytuł do ~60 znaków.
 */
const TYTULY: Record<string, { tytul: string; opis: string }> = {
  "/": {
    tytul: "Kalkulator paszy dla drobiu: normy i mieszanki | Moja Pasza",
    opis: "Ułóż paszę dla kur niosek, brojlerów, kaczek, gęsi i indyków z własnych surowców. Kalkulator sprawdza normy białka, energii, wapnia i fosforu.",
  },
  "/bydlo": {
    tytul: "Kalkulator paszy dla bydła: dawki pokarmowe | Moja Pasza",
    opis: "Dawka pokarmowa dla krów mlecznych i opasów: bilans energii i białka z paszami objętościowymi i treściwymi.",
  },
  "/poradnik": {
    tytul: "Pasze i żywienie zwierząt w gospodarstwie | Moja Pasza",
    opis: "Normy żywieniowe drobiu, dodatki do paszy (olej, muszle, grit, metionina) i bezpieczne wykorzystanie serwatki w żywieniu zwierząt.",
  },
  "/poradnik/udzial-surowcow": {
    tytul: "Ile jakiego surowca w paszy dla drobiu | Moja Pasza",
    opis: "Najwyższe zalecane udziały zbóż, grochu, bobiku, łubinu i rzepaku dla piskląt, brojlerów, niosek, kaczek i gęsi, z powodem i źródłem.",
  },
  "/poradnik/kury-nie-niosa": {
    tytul: "Kury nie niosą jajek? Najczęstsze przyczyny | Moja Pasza",
    opis: "Dajesz kurom dobre jedzenie, a nie niosą? Krótki dzień i pierzenie, za mało białka i wapnia, sama pszenica i resztki z kuchni. Co zrobić.",
  },
  "/auth": {
    tytul: "Logowanie | Moja Pasza",
    opis: "Zaloguj się, żeby zapisywać mieszanki z kalkulatora paszy.",
  },
};

const Tytuly = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const wpis = TYTULY[pathname.replace(/\/+$/, "") || "/"];
    if (!wpis) return;

    const ustaw = () => {
      if (document.title !== wpis.tytul) document.title = wpis.tytul;
      const opis = document.querySelector('meta[name="description"]');
      if (opis && opis.getAttribute("content") !== wpis.opis) opis.setAttribute("content", wpis.opis);
    };
    ustaw();

    const obserwator = new MutationObserver(ustaw);
    obserwator.observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["content"],
    });
    return () => obserwator.disconnect();
  }, [pathname]);

  return null;
};

export default Tytuly;
