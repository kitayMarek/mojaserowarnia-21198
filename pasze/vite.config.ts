import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Serwis mojapasza.com: osobna aplikacja z tymi samymi stronami pasz co Moja
 * Serowarnia (src/pages/KalkulatorPasz.tsx, KalkulatorPaszBydlo.tsx, PaszeHub.tsx).
 * Plan: dokument „Pasze: wydzielenie na osobną domenę” (Claude Docs), 23.10.2026.
 *
 * PODMIANA POWŁOKI: strony pasz importują nagłówek, stopkę i okruszki Serowarni
 * oraz jej ustawienia (src/lib/serwis.ts: nazwa, adres, łącznik MCP, ścieżki).
 * Zamiast je zmieniać, tu przekierowujemy te importy na powłokę mojapasza
 * (pasze/src/powloka). Kolejność aliasów ma znaczenie: dokładne ścieżki przed „@”.
 *
 * .env leży w głównym katalogu repozytorium (envDir niżej). Bez niego aplikacja
 * zbuduje się bez błędu i padnie w przeglądarce, tak jak Serowarnia 3.09.2026,
 * dlatego build sprawdza zmienne tak samo jak vite.config.ts w głównym katalogu.
 */
const KORZEN = path.resolve(__dirname, "..");
const WYMAGANE_ZMIENNE = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];

function sprawdzZmienne(mode: string) {
  const env = loadEnv(mode, KORZEN, "VITE_");
  const brakuje = WYMAGANE_ZMIENNE.filter((k) => !env[k]?.trim());
  if (brakuje.length) {
    throw new Error(`BUDOWANIE PRZERWANE: brakuje ${brakuje.join(", ")} w ${KORZEN}/.env (buduj z głównego katalogu repozytorium).`);
  }
}

const powloka = (plik: string) => path.resolve(__dirname, "src/powloka", plik);

export default defineConfig(({ mode, command }) => {
  if (command === "build") sprawdzZmienne(mode);

  return {
    root: __dirname,
    envDir: KORZEN,
    publicDir: path.resolve(__dirname, "public"),
    server: { host: "::", port: 8090 },
    plugins: [react()],
    esbuild: { drop: mode === "production" ? ["console", "debugger"] : [] },
    resolve: {
      alias: [
        { find: /^@\/components\/Navigation$/, replacement: powloka("Naglowek.tsx") },
        { find: /^@\/components\/Footer$/, replacement: powloka("Stopka.tsx") },
        { find: /^@\/components\/PageBreadcrumbs$/, replacement: powloka("Okruszki.tsx") },
        { find: /^@\/lib\/serwis$/, replacement: powloka("serwis.ts") },
        { find: "@", replacement: path.resolve(KORZEN, "src") },
      ],
    },
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      sourcemap: false,
    },
  };
});
