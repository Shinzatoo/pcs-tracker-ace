import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Dashboard from "./pages/Dashboard";
import AgenteMaritimo from "./pages/AgenteMaritimo";
import MaritimeVoice from "./pages/MaritimeVoice";
import PcsList from "./pages/PcsList";
import PcsDetail from "./pages/PcsDetail";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-harbor flex flex-col">
          <Header />
          <main className="flex-1 pb-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agente" element={<AgenteMaritimo />} />
              <Route path="/voice" element={<MaritimeVoice />} />
              <Route path="/pcs" element={<PcsList />} />
              <Route path="/pcs/:vesselId" element={<PcsDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
