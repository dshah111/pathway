import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import HighSchoolPlanner from "./pages/HighSchoolPlanner";
import UniversityPlanner from "./pages/UniversityPlanner";
import MastersPlanner from "./pages/MastersPlanner";
import SavedPlans from "./pages/SavedPlans";
import ViewSavedPlan from "./pages/ViewSavedPlan";
import PlanComparison from "./pages/PlanComparison";
import AdvisorChat from "./pages/AdvisorChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner/high-school" element={<HighSchoolPlanner />} />
          <Route path="/planner/university" element={<UniversityPlanner />} />
          <Route path="/planner/masters" element={<MastersPlanner />} />
          <Route path="/saved-plans" element={<SavedPlans />} />
          <Route path="/saved-plans/:id" element={<ViewSavedPlan />} />
          <Route path="/compare-plans" element={<PlanComparison />} />
          <Route path="/advisor-chat" element={<AdvisorChat />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
