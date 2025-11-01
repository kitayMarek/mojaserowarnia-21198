import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import DisclaimerModal from "@/components/DisclaimerModal";
import Index from "./pages/Index";
import BazaKultur from "./pages/BazaKultur";
import Przepisy from "./pages/Przepisy";
import RecipeDetails from "./pages/RecipeDetails";
import PoradnikiHub from "./pages/PoradnikiHub";
import Poradnik from "./pages/Poradnik";
import BakterieKultury from "./pages/BakterieKultury";
import SilaPodpuszczki from "./pages/SilaPodpuszczki";
import GdzieKupicPodpuszczke from "./pages/GdzieKupicPodpuszczke";
import Prawo from "./pages/Prawo";
import Narzedzia from "./pages/Narzedzia";
import KalkulatorBeaugel from "./pages/KalkulatorBeaugel";
import KalkulatorKosztuSera from "./pages/KalkulatorKosztuSera";
import KalkulatorMiar from "./pages/KalkulatorMiar";
import KalkulatorPasz from "./pages/KalkulatorPasz";
import PorownanieWartosciOdzywczych from "./pages/PorownanieWartosciOdzywczych";
import AktyPrawneUE from "./pages/AktyPrawneUE";
import RHD from "./pages/RHD";
import RHDDokumenty from "./pages/RHDDokumenty";
import MOL from "./pages/MOL";
import MOLDokumenty from "./pages/MOLDokumenty";
import RzezniRolnicza from "./pages/RzezniRolnicza";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Ewidencja from "./pages/Ewidencja";
import NewInvoice from "./pages/NewInvoice";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import PorownywarkaKultur from "./pages/PorownywarkaKultur";
import NotaPrawna from "./pages/NotaPrawna";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DisclaimerModal />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/baza-kultur" element={<BazaKultur />} />
            <Route path="/porownywarka-kultur" element={<PorownywarkaKultur />} />
            <Route path="/przepisy" element={<Przepisy />} />
            <Route path="/przepisy/:id" element={<RecipeDetails />} />
            <Route path="/poradniki" element={<PoradnikiHub />} />
          <Route path="/poradnik" element={<Poradnik />} />
          <Route path="/bakterie-kultury" element={<BakterieKultury />} />
          <Route path="/sila-podpuszczki" element={<SilaPodpuszczki />} />
          <Route path="/gdzie-kupic-podpuszczke" element={<GdzieKupicPodpuszczke />} />
          <Route path="/porownawie-wartosci-odzywczych" element={<PorownanieWartosciOdzywczych />} />
            <Route path="/prawo" element={<Prawo />} />
            <Route path="/narzedzia" element={<Narzedzia />} />
            <Route path="/kalkulator-beaugel" element={<KalkulatorBeaugel />} />
            <Route path="/kalkulator-kosztu-sera" element={<KalkulatorKosztuSera />} />
            <Route path="/kalkulator-miar" element={<KalkulatorMiar />} />
            <Route path="/kalkulator-pasz" element={<KalkulatorPasz />} />
            <Route path="/prawo/akty-prawne-ue" element={<AktyPrawneUE />} />
            <Route path="/prawo/rhd" element={<RHD />} />
            <Route path="/prawo/rhd/dokumenty" element={<RHDDokumenty />} />
            <Route path="/prawo/mol" element={<MOL />} />
            <Route path="/prawo/mol/dokumenty" element={<MOLDokumenty />} />
            <Route path="/prawo/rzeznia-rolnicza" element={<RzezniRolnicza />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/nota-prawna" element={<NotaPrawna />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="ewidencja" element={<Ewidencja />} />
              <Route path="rachunki/nowy" element={<NewInvoice />} />
              <Route path="rachunki" element={<Invoices />} />
              <Route path="ustawienia" element={<Settings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
