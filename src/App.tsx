import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BazaKultur from "./pages/BazaKultur";
import Przepisy from "./pages/Przepisy";
import RecipeDetails from "./pages/RecipeDetails";
import Poradnik from "./pages/Poradnik";
import Prawo from "./pages/Prawo";
import AktyPrawneUE from "./pages/AktyPrawneUE";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/baza-kultur" element={<BazaKultur />} />
          <Route path="/przepisy" element={<Przepisy />} />
          <Route path="/przepisy/:id" element={<RecipeDetails />} />
          <Route path="/poradnik" element={<Poradnik />} />
          <Route path="/prawo" element={<Prawo />} />
          <Route path="/prawo/akty-prawne-ue" element={<AktyPrawneUE />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
