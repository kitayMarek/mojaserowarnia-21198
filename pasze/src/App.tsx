import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
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
const Auth = lazy(() => import("@/pages/Auth"));

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
                <Route path="/auth" element={<Auth />} />
                <Route path="/kalkulator-pasz" element={<Na cel="/" />} />
                <Route path="/kalkulator-pasz-bydlo" element={<Na cel="/bydlo" />} />
                <Route path="/pasze" element={<Na cel="/poradnik" />} />
                <Route path="/pasze/udzial-surowcow" element={<Na cel="/poradnik/udzial-surowcow" />} />
                <Route path="/pasze/kury-nie-niosa" element={<Na cel="/poradnik/kury-nie-niosa" />} />
                {/* Wszystko inne to linki do treści Serowarni (serwatka, prawo, poradniki). */}
                <Route path="*" element={<DoSerowarni />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
