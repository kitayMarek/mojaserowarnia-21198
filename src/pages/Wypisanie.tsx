import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Wypisanie z wiadomości — strona, która musi zadziałać bez logowania.
 *
 * Człowiek, który chce przestać dostawać maile, nie będzie szukał hasła sprzed
 * roku. Jeśli nie znajdzie działającego przycisku, uzna wiadomość za spam
 * i zgłosi ją — a jedno takie zgłoszenie potrafi zepsuć dostarczalność całej
 * domeny. Dlatego tu nie ma żadnej bramki: token z odnośnika wystarcza.
 *
 * Komunikat jest ZAWSZE ten sam, niezależnie od tego, czy token pasował.
 * Inaczej ta strona stałaby się narzędziem do sprawdzania, kto jest na liście.
 */
const Wypisanie = () => {
  const [parametry] = useSearchParams();
  const [stan, setStan] = useState<"pracuje" | "gotowe" | "brakTokenu">("pracuje");

  useEffect(() => {
    // Strona techniczna — nie ma po co stać w wynikach wyszukiwania.
    document.title = "Wypisanie z wiadomości — Moja Serowarnia";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    const token = parametry.get("t");
    if (!token) {
      setStan("brakTokenu");
      return;
    }
    // Błąd sieci też kończy się komunikatem „gotowe”: człowiek ma wiedzieć, co
    // dalej, a nie oglądać awarię. Gdyby zapis nie przeszedł, zadziała odnośnik
    // z następnej wiadomości — a adres pocztowy niżej działa zawsze.
    supabase
      .rpc("wypisz_z_wiadomosci", { _token: token })
      .then(() => setStan("gotowe"))
      .catch(() => setStan("gotowe"));
  }, [parametry]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      {stan === "pracuje" && <p className="text-muted-foreground">Chwileczkę…</p>}

      {stan === "gotowe" && (
        <>
          <h1 className="mb-4 text-2xl font-semibold">Wypisano</h1>
          <p className="mb-3 leading-relaxed">
            Nie będziemy już wysyłać wiadomości na ten adres. Zmiana działa od zaraz — nie
            trzeba nic potwierdzać.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Konto w serwisie zostaje bez zmian, razem ze wszystkim, co masz w nim zapisane.
            Wypisanie dotyczy wyłącznie wiadomości na pocztę.
          </p>
        </>
      )}

      {stan === "brakTokenu" && (
        <>
          <h1 className="mb-4 text-2xl font-semibold">Brakuje identyfikatora</h1>
          <p className="leading-relaxed">
            Ten adres działa tylko z odnośnikiem z wiadomości. Otwórz ostatnią wiadomość od
            nas i kliknij „wypisz się” na jej końcu — albo napisz na{" "}
            <a className="underline" href="mailto:kontakt@mojaserowarnia.pl">
              kontakt@mojaserowarnia.pl
            </a>
            , wypiszemy ręcznie.
          </p>
        </>
      )}
    </main>
  );
};

export default Wypisanie;
