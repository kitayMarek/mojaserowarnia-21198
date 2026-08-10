/**
 * Przygotowanie zdjęć przed wysłaniem na serwer.
 *
 * ⚠️ TO NIE JEST OPTYMALIZACJA — TO BEZPIECZEŃSTWO UŻYTKOWNIKA.
 * Zdjęcia z telefonu niosą w EXIF współrzędne GPS. Gospodarstwo to zwykle
 * także miejsce zamieszkania, więc publikacja surowego pliku ujawnia dokładny
 * adres producenta przy każdym zdjęciu.
 *
 * Przerysowanie na <canvas> i ponowne zakodowanie usuwa CAŁY EXIF przy okazji —
 * jeden zabieg załatwia prywatność, wagę pliku i czas uploadu na wolnym łączu.
 * Każdy upload MUSI przechodzić przez przygotujZdjecie().
 */

export const MAX_ROZMIAR_WEJSCIOWY = 15 * 1024 * 1024; // 15 MB — sensowna granica dla telefonu

/** Ludzki rozmiar pliku, np. "12,4 MB". */
export function rozmiarPliku(bajty: number): string {
  if (bajty < 1024) return `${bajty} B`;
  if (bajty < 1024 * 1024) return `${Math.round(bajty / 1024)} KB`;
  return `${(bajty / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export interface WynikPrzygotowania {
  blob: Blob;
  bajtyWejscia: number;
  bajtyWyjscia: number;
  wymiaryWejscia: string;
  wymiaryWyjscia: string;
}

/**
 * Skaluje, przekodowuje i tym samym pozbawia zdjęcie metadanych EXIF.
 * @param maxPx  najdłuższy bok po skalowaniu
 * @param jakosc jakość JPEG 0–1
 */
export async function przygotujZdjecie(
  file: File,
  maxPx = 1600,
  jakosc = 0.82
): Promise<Blob> {
  return (await przygotujZdjecieZInfo(file, maxPx, jakosc)).blob;
}

/**
 * Wariant zwracający też liczby — po to, żeby UI mógł je pokazać.
 *
 * Powód: 2026-08-10 na produkcję trafił plik BAJT W BAJT identyczny
 * z oryginałem, mimo że kod, wdrożony bundle i sam mechanizm działały
 * poprawnie. Przyczyny nie ustalono. Skoro cicha awaria tej ścieżki
 * oznacza opublikowanie współrzędnych GPS gospodarstwa, nie może ona
 * przechodzić niezauważona — dlatego rozmiar przed i po jest teraz
 * pokazywany użytkownikowi, a brak redukcji zgłaszany jako błąd.
 */
export async function przygotujZdjecieZInfo(
  file: File,
  maxPx = 1600,
  jakosc = 0.82
): Promise<WynikPrzygotowania> {
  if (!file.type.startsWith("image/")) {
    throw new Error("To nie jest plik graficzny. Wybierz zdjęcie JPG, PNG lub WebP.");
  }
  if (file.size > MAX_ROZMIAR_WEJSCIOWY) {
    throw new Error(
      `Plik ma ${rozmiarPliku(file.size)} — to za dużo. Wybierz mniejsze zdjęcie (do 15 MB).`
    );
  }

  let bitmap: ImageBitmap;
  try {
    // createImageBitmap respektuje orientację z EXIF, więc zdjęcia
    // z telefonu nie wyjdą obrócone o 90°.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as any);
  } catch {
    throw new Error("Nie udało się odczytać zdjęcia. Spróbuj innego pliku.");
  }

  const wIn = bitmap.width;
  const hIn = bitmap.height;
  const skala = Math.min(1, maxPx / Math.max(wIn, hIn));
  const w = Math.max(1, Math.round(wIn * skala));
  const h = Math.max(1, Math.round(hIn * skala));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Przeglądarka nie pozwoliła przetworzyć zdjęcia.");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Nie udało się przetworzyć zdjęcia."))),
      "image/jpeg",
      jakosc
    )
  );

  // Blob wyprodukowany przez canvas NIGDY nie jest bajtowo identyczny z wejściem —
  // koduje surowe piksele, więc nawet przy tej samej rozdzielczości powstaje inny
  // strumień. Identyczny rozmiar oznacza, że przetwarzanie się nie odbyło,
  // a to znaczy, że wysłalibyśmy EXIF z lokalizacją gospodarstwa.
  if (blob.size === file.size) {
    throw new Error(
      "Przetwarzanie zdjęcia nie powiodło się — plik wyszedł niezmieniony. " +
        "Nie wysyłamy go, bo mógłby zawierać dane lokalizacji GPS. Odśwież stronę (Ctrl+F5) i spróbuj ponownie."
    );
  }

  return {
    blob,
    bajtyWejscia: file.size,
    bajtyWyjscia: blob.size,
    wymiaryWejscia: `${wIn}×${hIn}`,
    wymiaryWyjscia: `${w}×${h}`,
  };
}

/** Nazwa pliku w Storage. Katalog = user_id, bo RLS pilnuje pierwszego segmentu. */
export function sciezkaZdjecia(userId: string, typ: "glowne" | "galeria" | "wpis"): string {
  return `${userId}/${typ}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
}
