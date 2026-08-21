import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Kanoniczny from "@/components/Kanoniczny";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import CookieConsent from "react-cookie-consent";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const BazaKultur = lazy(() => import("./pages/BazaKultur"));
const Przepisy = lazy(() => import("./pages/Przepisy"));
const RecipeDetails = lazy(() => import("./pages/RecipeDetails"));
const JogurtDomowy = lazy(() => import("./pages/JogurtDomowy"));
const KefirDomowy = lazy(() => import("./pages/KefirDomowy"));
const SerZJogurtu = lazy(() => import("./pages/SerZJogurtu"));
const PrzepisyKulinarne = lazy(() => import("./pages/PrzepisyKulinarne"));
const CulinaryRecipeDetails = lazy(() => import("./pages/CulinaryRecipeDetails"));
const PoradnikiHub = lazy(() => import("./pages/PoradnikiHub"));
const Poradnik = lazy(() => import("./pages/Poradnik"));
const BakterieKultury = lazy(() => import("./pages/BakterieKultury"));
const SilaPodpuszczki = lazy(() => import("./pages/SilaPodpuszczki"));
const GdzieKupicPodpuszczke = lazy(() => import("./pages/GdzieKupicPodpuszczke"));
const Prawo = lazy(() => import("./pages/Prawo"));
const Narzedzia = lazy(() => import("./pages/Narzedzia"));
const EtykietaRhd = lazy(() => import("./pages/EtykietaRhd"));
const FakturaVatRr = lazy(() => import("./pages/FakturaVatRr"));
const KalkulatorBeaugel = lazy(() => import("./pages/KalkulatorBeaugel"));
const KalkulatorKosztuSera = lazy(() => import("./pages/KalkulatorKosztuSera"));
const KalkulatorMiar = lazy(() => import("./pages/KalkulatorMiar"));
const KalkulatorPasz = lazy(() => import("./pages/KalkulatorPasz"));
const KalkulatorPaszBydlo = lazy(() => import("./pages/KalkulatorPaszBydlo"));
const PorownanieWartosciOdzywczych = lazy(() => import("./pages/PorownanieWartosciOdzywczych"));
const OrganizacjaSerowarni = lazy(() => import("./pages/OrganizacjaSerowarni"));
const KalkulatorSolanki = lazy(() => import("./pages/KalkulatorSolanki"));
const WedzenieSera = lazy(() => import("./pages/WedzenieSera"));
const KlasykaPolskiegoSerowarstwa = lazy(() => import("./pages/KlasykaPolskiegoSerowarstwa"));
const SerowarstwoStaropolskie = lazy(() => import("./pages/SerowarstwoStaropolskie"));
const KleckiJakoscMleka = lazy(() => import("./pages/KleckiJakoscMleka"));
const EncyklopediaSerowarstwo = lazy(() => import("./pages/EncyklopediaSerowarstwo"));
const LicznerskiSerowarstwo = lazy(() => import("./pages/LicznerskiSerowarstwo"));
const LicznerskiMleko = lazy(() => import("./pages/LicznerskiMleko"));
const LicznerskiSery = lazy(() => import("./pages/LicznerskiSery"));
const AktyPrawneUE = lazy(() => import("./pages/AktyPrawneUE"));
const RHD = lazy(() => import("./pages/RHD"));
const RHDDokumenty = lazy(() => import("./pages/RHDDokumenty"));
const MOL = lazy(() => import("./pages/MOL"));
const MOLDokumenty = lazy(() => import("./pages/MOLDokumenty"));
const RzezniRolnicza = lazy(() => import("./pages/RzezniRolnicza"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Ewidencja = lazy(() => import("./pages/Ewidencja"));
const NewInvoice = lazy(() => import("./pages/NewInvoice"));
const DashboardVatRr = lazy(() => import("./pages/DashboardVatRr"));
const MojaSerowarnia = lazy(() => import("./pages/MojaSerowarnia"));
const AdminSerowarnie = lazy(() => import("./pages/AdminSerowarnie"));
const Serowarnie = lazy(() => import("./pages/Serowarnie"));
const SerowarniaProfil = lazy(() => import("./pages/SerowarniaProfil"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Settings = lazy(() => import("./pages/Settings"));
const Contact = lazy(() => import("./pages/Contact"));
const PorownywarkaKultur = lazy(() => import("./pages/PorownywarkaKultur"));
const NotaPrawna = lazy(() => import("./pages/NotaPrawna"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminNews = lazy(() => import("./pages/AdminNews"));
const AdminLlmStats = lazy(() => import("./pages/AdminLlmStats"));
const AdminCultureClicks = lazy(() => import("./pages/AdminCultureClicks"));
const AdminFeedIngredients = lazy(() => import("./pages/AdminFeedIngredients"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SystemEwidencji = lazy(() => import("./pages/SystemEwidencji"));
const Wiadomosci = lazy(() => import("./pages/Wiadomosci"));
const AutomatyzacjaSocialMedia = lazy(() => import("./pages/AutomatyzacjaSocialMedia"));
const Slownik = lazy(() => import("./pages/Slownik"));
const MojeListy = lazy(() => import("./pages/MojeListy"));
const KulturyPrzewodnik = lazy(() => import("./pages/KulturyPrzewodnik"));
const KulturyMezofilne = lazy(() => import("./pages/KulturyMezofilne"));
const KulturyTermofilne = lazy(() => import("./pages/KulturyTermofilne"));
const KulturyJogurtowe = lazy(() => import("./pages/KulturyJogurtowe"));
const SeryWege = lazy(() => import("./pages/SeryWege"));
const WoskowanieSera = lazy(() => import("./pages/WoskowanieSera"));
const DojrzewalniaZLodowki = lazy(() => import("./pages/DojrzewalniaZLodowki"));
const SolenieSera = lazy(() => import("./pages/SolenieSera"));
const PaszeHub = lazy(() => import("./pages/PaszeHub"));
const SerwatkaDlaZwierzat = lazy(() => import("./pages/SerwatkaDlaZwierzat"));
const NieudanySer = lazy(() => import("./pages/NieudanySer"));
const MlekoDoSera = lazy(() => import("./pages/MlekoDoSera"));
const WadyMlekaWadySera = lazy(() => import("./pages/WadyMlekaWadySera"));

// These components are NOT lazy loaded (needed immediately)
import DashboardLayout from "./components/dashboard/DashboardLayout";
import ScrollToTop from "@/components/ScrollToTop";
import AdminRoute from "./components/AdminRoute";

// Powłoka publicznych stron: rezerwuje miejsce na stały lewy sidebar (Navigation) na desktopie (lg+).
// Dashboard/admin/auth/404 mają własny layout i NIE dostają tego offsetu.
const SidebarShell = () => (
  <div className="lg:pl-64">
    <Outlet />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Kanoniczny />
          <AuthProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
            <Route element={<SidebarShell />}>
            <Route path="/" element={<Index />} />
            <Route path="/baza-kultur" element={<BazaKultur />} />
            <Route path="/porownywarka-kultur" element={<PorownywarkaKultur />} />
            <Route path="/moje-listy" element={<MojeListy />} />
            <Route path="/kultury/przewodnik" element={<KulturyPrzewodnik />} />
            <Route path="/kultury/mezofilne" element={<KulturyMezofilne />} />
            <Route path="/kultury/termofilne" element={<KulturyTermofilne />} />
            <Route path="/kultury/jogurtowe" element={<KulturyJogurtowe />} />
            <Route path="/sery-wege" element={<SeryWege />} />
            <Route path="/przepisy" element={<Przepisy />} />
            {/* Nabial fermentowany - trasy statyczne MUSZA byc przed /przepisy/:id */}
            <Route path="/przepisy/jogurt-domowy" element={<JogurtDomowy />} />
            <Route path="/przepisy/kefir-domowy" element={<KefirDomowy />} />
            <Route path="/przepisy/ser-z-jogurtu" element={<SerZJogurtu />} />
            <Route path="/przepisy/:id" element={<RecipeDetails />} />
            <Route path="/przepisy-kulinarne" element={<PrzepisyKulinarne />} />
            <Route path="/przepisy-kulinarne/:id" element={<CulinaryRecipeDetails />} />
            <Route path="/poradniki" element={<PoradnikiHub />} />
          <Route path="/poradnik" element={<Poradnik />} />
          <Route path="/organizacja-serowarni" element={<OrganizacjaSerowarni />} />
          <Route path="/wedzenie-sera" element={<WedzenieSera />} />
          <Route path="/woskowanie-sera" element={<WoskowanieSera />} />
          <Route path="/dojrzewalnia-z-lodowki" element={<DojrzewalniaZLodowki />} />
          <Route path="/solenie-sera" element={<SolenieSera />} />
          <Route path="/pasze" element={<PaszeHub />} />
          <Route path="/serwatka-dla-zwierzat" element={<SerwatkaDlaZwierzat />} />
          <Route path="/nieudany-ser" element={<NieudanySer />} />
          <Route path="/mleko-do-sera" element={<MlekoDoSera />} />
          <Route path="/wady-mleka-a-wady-sera" element={<WadyMlekaWadySera />} />
          <Route path="/klasyka-serowarstwa" element={<KlasykaPolskiegoSerowarstwa />} />
          <Route path="/serowarstwo-staropolskie" element={<SerowarstwoStaropolskie />} />
          <Route path="/klecki-jakosc-mleka" element={<KleckiJakoscMleka />} />
          <Route path="/encyklopedia-serowarstwo" element={<EncyklopediaSerowarstwo />} />
          <Route path="/licznerski" element={<LicznerskiSerowarstwo />} />
          <Route path="/licznerski-mleko" element={<LicznerskiMleko />} />
          <Route path="/licznerski-sery" element={<LicznerskiSery />} />
          <Route path="/bakterie-kultury" element={<BakterieKultury />} />
          <Route path="/sila-podpuszczki" element={<SilaPodpuszczki />} />
          <Route path="/gdzie-kupic-podpuszczke" element={<GdzieKupicPodpuszczke />} />
          <Route path="/porownanie-wartosci-odzywczych" element={<PorownanieWartosciOdzywczych />} />
            <Route path="/prawo" element={<Prawo />} />
            <Route path="/narzedzia" element={<Narzedzia />} />
            <Route path="/serowarnie" element={<Serowarnie />} />
            <Route path="/serowarnie/:slug" element={<SerowarniaProfil />} />
            <Route path="/etykieta-rhd" element={<EtykietaRhd />} />
            <Route path="/faktura-vat-rr" element={<FakturaVatRr />} />
            <Route path="/kalkulator-beaugel" element={<KalkulatorBeaugel />} />
            <Route path="/kalkulator-kosztu-sera" element={<KalkulatorKosztuSera />} />
            <Route path="/kalkulator-miar" element={<KalkulatorMiar />} />
            <Route path="/kalkulator-solanki" element={<KalkulatorSolanki />} />
            <Route path="/kalkulator-pasz" element={<KalkulatorPasz />} />
            <Route path="/kalkulator-pasz-bydlo" element={<KalkulatorPaszBydlo />} />
            <Route path="/prawo/akty-prawne-ue" element={<AktyPrawneUE />} />
            <Route path="/prawo/rhd" element={<RHD />} />
            <Route path="/prawo/rhd/dokumenty" element={<RHDDokumenty />} />
            <Route path="/prawo/mol" element={<MOL />} />
            <Route path="/prawo/mol/dokumenty" element={<MOLDokumenty />} />
            <Route path="/prawo/rzeznia-rolnicza" element={<RzezniRolnicza />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/nota-prawna" element={<NotaPrawna />} />
            <Route path="/system-ewidencji" element={<SystemEwidencji />} />
            <Route path="/wiadomosci" element={<Wiadomosci />} />
            <Route path="/automatyzacja-social-media" element={<AutomatyzacjaSocialMedia />} />
            <Route path="/slownik" element={<Slownik />} />
            </Route>
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/news" element={<AdminRoute><AdminNews /></AdminRoute>} />
            <Route path="/admin/statystyki-llm" element={<AdminRoute><AdminLlmStats /></AdminRoute>} />
            <Route path="/admin/klikniecia" element={<AdminRoute><AdminCultureClicks /></AdminRoute>} />
            <Route path="/admin/skladniki" element={<AdminRoute><AdminFeedIngredients /></AdminRoute>} />
            <Route path="/admin/serowarnie" element={<AdminRoute><AdminSerowarnie /></AdminRoute>} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="ewidencja" element={<Ewidencja />} />
              <Route path="rachunki/nowy" element={<NewInvoice />} />
              <Route path="rachunki" element={<Invoices />} />
              <Route path="faktura-vat-rr" element={<DashboardVatRr />} />
              <Route path="moja-serowarnia" element={<MojaSerowarnia />} />
              <Route path="ustawienia" element={<Settings />} />
            </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
        
        {/* Cookie Consent Banner - RODO/GDPR Compliance */}
        <CookieConsent
          location="bottom"
          buttonText="Akceptuję wszystkie"
          declineButtonText="Odrzuć"
          enableDeclineButton
          cookieName="moja-serowarnia-consent"
          style={{
            background: "rgba(0, 0, 0, 0.95)",
            padding: "10px 20px",
            alignItems: "center",
          }}
          buttonStyle={{
            background: "#F59E0B",
            color: "white",
            fontSize: "14px",
            borderRadius: "8px",
            padding: "12px 24px",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
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
          }}
          expires={365}
          onAccept={() => {
            // Włącz Google Analytics tracking
            if ((window as any).gtag) {
              (window as any).gtag('consent', 'update', {
                analytics_storage: 'granted'
              });
            }
            console.log('[Cookie Consent] Użytkownik zaakceptował cookies');
          }}
          onDecline={() => {
            // Wyłącz Google Analytics tracking
            if ((window as any)['ga-disable-G-XR997KZQKB']) {
              (window as any)['ga-disable-G-XR997KZQKB'] = true;
            }
            console.log('[Cookie Consent] Użytkownik odrzucił cookies');
          }}
        >
          <div className="text-sm text-white">
            Strona używa plików cookie (m.in. Google Analytics). Treści mają charakter informacyjny — weryfikuj dane u producenta.{" "}
            <a
              href="/nota-prawna"
              className="underline text-amber-400 hover:text-amber-300 transition-colors"
            >
              Nota Prawna i Polityka Cookies
            </a>
          </div>
        </CookieConsent>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
