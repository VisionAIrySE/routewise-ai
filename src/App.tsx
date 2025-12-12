import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Inspections from "./pages/Inspections";
import Calendar from "./pages/Calendar";
import RouteDetail from "./pages/RouteDetail";
import Install from "./pages/Install";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/install" element={<Install />} />
            
            {/* Onboarding - protected but doesn't require onboarding complete */}
            <Route path="/onboarding" element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            } />
            
            {/* Protected routes - require onboarding complete */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout><Index /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/inspections" element={
              <ProtectedRoute>
                <AppLayout><Inspections /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <AppLayout><Calendar /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/routes/:routeId" element={
              <ProtectedRoute>
                <AppLayout><RouteDetail /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
