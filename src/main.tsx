import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Pusty ekran po wdrożeniu: karta otwarta przed wdrożeniem prosi o kawałek kodu (lazy),
// którego już nie ma, a import pada bez obsługi. Wtedy jedno odświeżenie strony, najwyżej
// raz na 10 sekund, żeby przy trwałym braku nie wpaść w pętlę. Ta sama poprawka co w Mojej
// Paszy (7.11.2026, zgłoszenie Marka). Vite 5.4 łapie tu też błąd samego import().
const KLUCZ_ODSWIEZENIA = "odswiezenie-po-wdrozeniu";
window.addEventListener("vite:preloadError", (e) => {
  try {
    const t = Number(sessionStorage.getItem(KLUCZ_ODSWIEZENIA)) || 0;
    if (Date.now() - t < 10_000) return;
    sessionStorage.setItem(KLUCZ_ODSWIEZENIA, String(Date.now()));
  } catch {
    return;
  }
  e.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
