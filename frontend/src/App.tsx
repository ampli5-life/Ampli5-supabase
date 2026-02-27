import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import FreeVideos from "./pages/FreeVideos";
import FreeVideoDetail from "./pages/FreeVideoDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Books from "./pages/Books";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import RefundPolicy from "./pages/RefundPolicy";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Admin from "./pages/Admin";
import News from "./pages/News";
import NotFound from "./pages/NotFound";

const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public: auth pages (no layout needed for subscription-success) */}
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />

            <Route element={<Layout />}>
              {/* Public: login, register, legal, and home pages */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />

              {/* Protected: all content pages require login */}
              <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
              <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
              <Route path="/free-videos" element={<ProtectedRoute><FreeVideos /></ProtectedRoute>} />
              <Route path="/free-videos/:id" element={<ProtectedRoute><FreeVideoDetail /></ProtectedRoute>} />
              <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
              <Route path="/blog/:slug" element={<ProtectedRoute><BlogPost /></ProtectedRoute>} />
              <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;

