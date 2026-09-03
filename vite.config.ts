import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Zmienne, bez których zbudowana aplikacja jest martwa.
 *
 * DLACZEGO TO ISTNIEJE: 3 września 2026 serwis stanął na kilka godzin. Build
 * powstał w drugiej kopii repozytorium, gdzie nie było pliku `.env` — a ten
 * plik jest w `.gitignore`, więc żaden worktree ani świeży klon go nie dostaje.
 * Vite wstawia zmienne do kodu W CZASIE BUDOWANIA, więc brak nie objawia się
 * niczym: build kończy się sukcesem, wdrożenie przechodzi, a aplikacja dopiero
 * w przeglądarce wywala się na `supabaseUrl is required` i React nie montuje
 * się w ogóle. Serwer przez cały czas oddaje poprawny dokument, więc żaden
 * `curl` ani kod odpowiedzi tego nie wyłapie.
 *
 * Cicha awaria zamieniona na głośny błąd: lepiej, żeby build padł tutaj, niż
 * żeby padła produkcja.
 */
const WYMAGANE_ZMIENNE = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];

function sprawdzZmienne(mode: string) {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const brakuje = WYMAGANE_ZMIENNE.filter((k) => !env[k]?.trim());
  if (brakuje.length === 0) return;

  throw new Error(
    [
      "",
      "BUDOWANIE PRZERWANE — brakuje zmiennych środowiskowych:",
      ...brakuje.map((k) => `  • ${k}`),
      "",
      `Katalog budowania: ${process.cwd()}`,
      "",
      "Bez nich aplikacja zbuduje się bez błędu, ale w przeglądarce padnie",
      "na „supabaseUrl is required” i nie wyrenderuje niczego.",
      "",
      "Najczęstsza przyczyna: budujesz w kopii repozytorium (worktree albo",
      "świeży klon), a plik .env jest w .gitignore i tam go nie ma.",
      "Skopiuj .env z głównego katalogu repozytorium i uruchom build ponownie.",
      "",
    ].join("\n"),
  );
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  if (command === "build") sprawdzZmienne(mode);

  return {
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'form-vendor': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts'],
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/webp|png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return 'assets/[name]-[hash][extname]';
        },
      }
    }
  },
  };
});
