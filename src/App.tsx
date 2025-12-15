import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Inspections from "./pages/Inspections";
import Calendar from "./pages/Calendar";
import RouteDetail from "./pages/RouteDetail";
import TeamDashboard from "./pages/TeamDashboard";
import Settings from "./pages/Settings";
import Install from "./pages/Install";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminReferrals from "./pages/admin/AdminReferrals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/install" element={<Install />} />
            
            {/* Onboarding - protected but doesn't require onboarding complete */}
            <Route path="/onboarding" element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            } />
            
            {/* Protected routes - require onboarding complete */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout><Index /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/inspections" element={
              <ProtectedRoute>
                <AppLayout><Inspections /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/calendar" element={
              <ProtectedRoute>
                <AppLayout><Calendar /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/routes/:routeId" element={
              <ProtectedRoute>
                <AppLayout><RouteDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/team" element={
              <ProtectedRoute>
                <AppLayout><TeamDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/app/settings" element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/app/admin" element={<AdminOverview />} />
            <Route path="/app/admin/users" element={<AdminUsers />} />
            <Route path="/app/admin/subscriptions" element={<AdminSubscriptions />} />
            <Route path="/app/admin/promo-codes" element={<AdminPromoCodes />} />
            <Route path="/app/admin/referrals" element={<AdminReferrals />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
