import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import { PlatformLayout } from "./components/layout/PlatformLayout";
import Dashboard from "./pages/platform/Dashboard";
import Wardrobe from "./pages/platform/Wardrobe";
import Stylist from "./pages/platform/Stylist";
import Profile from "./pages/platform/Profile";
import Settings from "./pages/platform/Settings";
import Looks from "./pages/platform/Looks";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pricing" element={<Pricing />} />
          {/* Platform Routes */}
          <Route path="/app" element={<PlatformLayout><Dashboard /></PlatformLayout>} />
          <Route path="/app/wardrobe" element={<PlatformLayout><Wardrobe /></PlatformLayout>} />
          <Route path="/app/looks" element={<PlatformLayout><Looks /></PlatformLayout>} />
          <Route path="/app/stylist" element={<PlatformLayout><Stylist /></PlatformLayout>} />
          <Route path="/app/profile" element={<PlatformLayout><Profile /></PlatformLayout>} />
          <Route path="/app/settings" element={<PlatformLayout><Settings /></PlatformLayout>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
