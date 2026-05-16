import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Solutions from "./pages/Solutions";
import ForTalents from "./pages/ForTalents";
import Work from "./pages/Work";
import HowItWorks from "./pages/HowItWorks";
import Insights from "./pages/Insights";
import About from "./pages/About";
import Contact from "./pages/Contact";
import StartAProject from "./pages/StartAProject";
import CaptionGenerator from "./pages/CaptionGenerator";
import DesignStudio from "./pages/DesignStudio";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthRedirect from "./pages/AuthRedirect";
import ClientDashboard from "./pages/workspace/ClientDashboard";
import UserDashboard from "./pages/workspace/UserDashboard";
import NewBrief from "./pages/workspace/NewBrief";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProjectDetail from "./pages/ProjectDetail";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import OSLayout from "@/os/OSLayout";
import OSDashboard from "@/os/pages/Dashboard";
import OSPipeline from "@/os/pages/Pipeline";
import OSNewProject from "@/os/pages/NewProject";
import OSProjectDetail from "@/os/pages/ProjectDetail";
import OSCalendar from "@/os/pages/Calendar";
import OSFinance from "@/os/pages/Finance";
import OSQuotations from "@/os/pages/Quotations";
import OSTeam from "@/os/pages/Team";
import OSReports from "@/os/pages/Reports";
import OSSettings from "@/os/pages/Settings";

const queryClient = new QueryClient();

const DashboardRedirect = () => {
  const { user, loading, isInternal, isClient } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (isInternal) return <Navigate to="/admin" replace />;
  if (isClient) return <Navigate to="/workspace" replace />;

  return <UserDashboard />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/solutions" element={<PageTransition><Solutions /></PageTransition>} />
        <Route path="/solutions/corporates" element={<PageTransition><Solutions /></PageTransition>} />
        <Route path="/solutions/talents" element={<PageTransition><ForTalents /></PageTransition>} />
        <Route path="/work" element={<PageTransition><Work /></PageTransition>} />
        <Route path="/work" element={<PageTransition><Work /></PageTransition>} />
        <Route path="/how-it-works" element={<PageTransition><HowItWorks /></PageTransition>} />
        <Route path="/insights" element={<PageTransition><Insights /></PageTransition>} />
        <Route path="/insights/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/start-a-project" element={<PageTransition><StartAProject /></PageTransition>} />
        <Route path="/caption-generator" element={<PageTransition><CaptionGenerator /></PageTransition>} />
        <Route path="/design-studio" element={<DesignStudio />} />

        {/* Legacy redirects */}
        <Route path="/platform" element={<PageTransition><Solutions /></PageTransition>} />
        <Route path="/case-studies" element={<PageTransition><Work /></PageTransition>} />

        {/* Auth */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/auth-redirect" element={<AuthRedirect />} />

        {/* Client Workspace */}
        <Route path="/workspace" element={<PageTransition><ProtectedRoute requireClient><ClientDashboard /></ProtectedRoute></PageTransition>} />
        <Route path="/workspace/new-brief" element={<PageTransition><ProtectedRoute><NewBrief /></ProtectedRoute></PageTransition>} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<PageTransition><DashboardRedirect /></PageTransition>} />

        {/* Shared */}
        <Route path="/project/:id" element={<PageTransition><ProtectedRoute><ProjectDetail /></ProtectedRoute></PageTransition>} />

        {/* Admin */}
        <Route path="/admin" element={<PageTransition><ProtectedRoute requireInternal><AdminDashboard /></ProtectedRoute></PageTransition>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
