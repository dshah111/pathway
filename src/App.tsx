import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
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
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/planner/high-school" element={<ProtectedRoute><HighSchoolPlanner /></ProtectedRoute>} />
          <Route path="/planner/university" element={<ProtectedRoute><UniversityPlanner /></ProtectedRoute>} />
          <Route path="/planner/masters" element={<ProtectedRoute><MastersPlanner /></ProtectedRoute>} />
          <Route path="/saved-plans" element={<ProtectedRoute><SavedPlans /></ProtectedRoute>} />
          <Route path="/saved-plans/:id" element={<ProtectedRoute><ViewSavedPlan /></ProtectedRoute>} />
          <Route path="/compare-plans" element={<ProtectedRoute><PlanComparison /></ProtectedRoute>} />
          <Route path="/advisor-chat" element={<ProtectedRoute><AdvisorChat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
