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

  const skala = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * skala));
  const h = Math.max(1, Math.round(bitmap.height * skala));

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

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Nie udało się przetworzyć zdjęcia."))),
      "image/jpeg",
      jakosc
    )
  );
}

/** Nazwa pliku w Storage. Katalog = user_id, bo RLS pilnuje pierwszego segmentu. */
export function sciezkaZdjecia(userId: string, typ: "glowne" | "galeria" | "wpis"): string {
  return `${userId}/${typ}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
}
