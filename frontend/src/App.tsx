import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "./contexts/SettingsContext";
import useInactivityTimeout from "./hooks/useInactivityTimeout";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const LanguageDirectionManager = () => {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir(i18n.language);
  }, [i18n, i18n.language]);
  return null; // This component doesn't render anything
};

// Updated PrivateRoute to include the inactivity timeout
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if the user is authenticated

  // If the user is authenticated, start the inactivity timer.
  // This hook will handle logging them out automatically.
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
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
              <Route path="*" element={<NotFound />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </SettingsProvider>
  </ThemeProvider>
);

export default App;
