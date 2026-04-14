import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Solutions from "./pages/Solutions";
import ForTalents from "./pages/ForTalents";
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

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/solutions" element={<PageTransition><Solutions /></PageTransition>} />
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
        <Route path="/workspace" element={<PageTransition><ProtectedRoute><ClientDashboard /></ProtectedRoute></PageTransition>} />
        <Route path="/workspace/new-brief" element={<PageTransition><ProtectedRoute><NewBrief /></ProtectedRoute></PageTransition>} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<PageTransition><ProtectedRoute><UserDashboard /></ProtectedRoute></PageTransition>} />

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
