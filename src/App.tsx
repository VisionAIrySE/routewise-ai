import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Inspections from "./pages/Inspections";
import Calendar from "./pages/Calendar";
import RouteDetail from "./pages/RouteDetail";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/install" element={<Install />} />
          <Route path="/" element={<AppLayout><Index /></AppLayout>} />
          <Route path="/inspections" element={<AppLayout><Inspections /></AppLayout>} />
          <Route path="/calendar" element={<AppLayout><Calendar /></AppLayout>} />
          <Route path="/routes/:routeId" element={<AppLayout><RouteDetail /></AppLayout>} />
          <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
