import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import CookieConsent from "react-cookie-consent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import ScrollToTop from "@/components/ScrollToTop";
import DoSerowarni from "./powloka/DoSerowarni";
import Tytuly from "./powloka/Tytuly";

// Te same strony co w Serowarni; nagłówek, stopkę i okruszki podmienia vite.config.ts.
const KalkulatorPasz = lazy(() => import("@/pages/KalkulatorPasz"));
const KalkulatorPaszBydlo = lazy(() => import("@/pages/KalkulatorPaszBydlo"));
const PaszeHub = lazy(() => import("@/pages/PaszeHub"));
const UdzialSurowcow = lazy(() => import("@/pages/UdzialSurowcow"));
const KuryNieNiosa = lazy(() => import("@/pages/KuryNieNiosa"));
const ResztkiZKuchni = lazy(() => import("@/pages/ResztkiZKuchni"));
const Auth = lazy(() => import("@/pages/Auth"));
const AsystenciAi = lazy(() => import("./strony/AsystenciAi"));

const queryClient = new QueryClient();

/** Stare adresy z Serowarni (linki w treści stron, powrót po logowaniu) na nowe. */
const Na = ({ cel }: { cel: string }) => {
  const { search, hash } = useLocation();
  return <Navigate to={`${cel}${search}${hash}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Tytuly />
          <AuthProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<KalkulatorPasz />} />
                <Route path="/bydlo" element={<KalkulatorPaszBydlo />} />
                <Route path="/poradnik" element={<PaszeHub />} />
                <Route path="/poradnik/udzial-surowcow" element={<UdzialSurowcow />} />
                <Route path="/poradnik/kury-nie-niosa" element={<KuryNieNiosa />} />
                <Route path="/poradnik/resztki-z-kuchni" element={<ResztkiZKuchni />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/asystenci-ai" element={<AsystenciAi />} />
                <Route path="/kalkulator-pasz" element={<Na cel="/" />} />
                <Route path="/kalkulator-pasz-bydlo" element={<Na cel="/bydlo" />} />
                <Route path="/pasze" element={<Na cel="/poradnik" />} />
                <Route path="/pasze/udzial-surowcow" element={<Na cel="/poradnik/udzial-surowcow" />} />
                <Route path="/pasze/kury-nie-niosa" element={<Na cel="/poradnik/kury-nie-niosa" />} />
                <Route path="/pasze/resztki-z-kuchni" element={<Na cel="/poradnik/resztki-z-kuchni" />} />
                {/* Wszystko inne to linki do treści Serowarni (serwatka, prawo, poradniki). */}
                <Route path="*" element={<DoSerowarni />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>

        {/* Zgoda na Google Analytics: ten sam baner co w Serowarni (src/App.tsx), własne ciasteczko.
            Funkcje wlaczAnalityke i wylaczAnalityke są w pasze/index.html. */}
        <CookieConsent
          location="bottom"
          buttonText="Akceptuję"
          declineButtonText="Odrzuć"
          enableDeclineButton
          cookieName="moja-pasza-consent"
          style={{ background: "rgba(0, 0, 0, 0.95)", padding: "4px 16px", alignItems: "center" }}
          contentStyle={{ margin: "8px 0", flex: "1 0 280px" }}
          buttonStyle={{
            background: "#F59E0B",
            color: "white",
            fontSize: "14px",
            borderRadius: "8px",
            padding: "12px 24px",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            margin: "4px 0 8px 12px",
          }}
          declineButtonStyle={{
            background: "transparent",
            border: "1px solid white",
            color: "white",
            fontSize: "14px",
            borderRadius: "8px",
            padding: "12px 24px",
            fontWeight: "600",
            cursor: "pointer",
            margin: "4px 0 8px 0",
          }}
          expires={365}
          onAccept={() => (window as unknown as { wlaczAnalityke?: () => void }).wlaczAnalityke?.()}
          onDecline={() => (window as unknown as { wylaczAnalityke?: () => void }).wylaczAnalityke?.()}
        >
          <div className="text-sm text-white">
            Google Analytics tylko za Twoją zgodą. Bez niej nie ładujemy go wcale.{" "}
            <a href="/prywatnosc#cookies" className="text-amber-400 underline transition-colors hover:text-amber-300">
              Polityka cookies
            </a>
          </div>
        </CookieConsent>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
