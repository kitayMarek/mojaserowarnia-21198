/**
 * useUploadZdjecia — wysyłanie zdjęć wizytówki do Storage.
 *
 * Każdy plik przechodzi przez przygotujZdjecie(): skalowanie, przekodowanie
 * i — najważniejsze — usunięcie EXIF wraz ze współrzędnymi GPS.
 * Nie da się tego pominąć, bo to jedyna droga uploadu w aplikacji.
 */

import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { przygotujZdjecie, sciezkaZdjecia, rozmiarPliku } from "@/lib/image";

const BUCKET = "wizytowki";

export function useUploadZdjecia() {
  const { user } = useAuth();
  const [wysylanie, setWysylanie] = useState(false);
  const [postep, setPostep] = useState<string | null>(null);

  /** Zwraca publiczny URL albo rzuca błędem z komunikatem po polsku. */
  const wyslij = useCallback(
    async (file: File, typ: "glowne" | "galeria" | "wpis"): Promise<string> => {
      if (!user) throw new Error("Musisz być zalogowany, żeby dodać zdjęcie.");

      setWysylanie(true);
      setPostep("Przygotowuję zdjęcie…");
      try {
        const blob = await przygotujZdjecie(file);
        setPostep(`Wysyłam (${rozmiarPliku(blob.size)})…`);

        const sciezka = sciezkaZdjecia(user.id, typ);
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(sciezka, blob, { contentType: "image/jpeg", upsert: false });

        if (error) {
          throw new Error(
            error.message.includes("exceeded")
              ? "Zdjęcie jest za duże nawet po kompresji. Wybierz inne."
              : `Nie udało się wysłać zdjęcia: ${error.message}`
          );
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(sciezka);
        return data.publicUrl;
      } finally {
        setWysylanie(false);
        setPostep(null);
      }
    },
    [user]
  );

  /**
   * Kasuje plik ze Storage na podstawie publicznego URL.
   * Wywoływać przy usuwaniu zdjęcia i wpisu — inaczej zostają sieroty
   * zajmujące limit miejsca.
   */
  const usun = useCallback(async (publicUrl: string): Promise<void> => {
    const marker = `/${BUCKET}/`;
    const i = publicUrl.indexOf(marker);
    if (i === -1) return; // nie nasz plik — nic nie ruszamy
    const sciezka = publicUrl.slice(i + marker.length).split("?")[0];
    await supabase.storage.from(BUCKET).remove([decodeURIComponent(sciezka)]);
  }, []);

  return { wyslij, usun, wysylanie, postep };
}
