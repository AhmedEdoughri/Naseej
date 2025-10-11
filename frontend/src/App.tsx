import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminDashboard";
import Contact from "./pages/Contact";
// --- NEW: Import the OrderHistory page ---
import OrderHistoryPage from "./features/customer/OrderHistory";

// Components & Providers
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "./contexts/SettingsContext";
import useInactivityTimeout from "./hooks/useInactivityTimeout";

const queryClient = new QueryClient();

const LanguageDirectionManager = () => {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir(i18n.language);
  }, [i18n, i18n.language]);
  return null;
};

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  if (isAuthenticated) {
    useInactivityTimeout();
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <SettingsProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner richColors position="bottom-right" />
          <BrowserRouter>
            <LanguageDirectionManager />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />

              {/* Private Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminPanel />
                  </PrivateRoute>
                }
              />
              {/* --- NEW ROUTE FOR ORDER HISTORY --- */}
              <Route
                path="/order-history"
                element={
                  <PrivateRoute>
                    <OrderHistoryPage />
                  </PrivateRoute>
                }
              />

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </SettingsProvider>
  </ThemeProvider>
);

export default App;
