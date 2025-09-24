import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogOut,
  Store,
  Truck,
  Users,
  Settings,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useSettings } from "../contexts/SettingsContext";
import { LanguageToggle } from "../components/LanguageToggle";

// Import all dashboards from the new index file
import {
  CustomerDashboard,
  DriverDashboard,
  WorkerDashboard,
  ManagerDashboard,
} from "@/components/dashboards";

const roleData = {
  customer: {
    title: "Customer Dashboard",
    icon: Store,
    color: "text-amber-600",
    gradient: "from-amber-100 to-amber-50",
  },
  driver: {
    title: "Driver Dashboard",
    icon: Truck,
    color: "text-amber-700",
    gradient: "from-amber-200 to-amber-100",
  },
  worker: {
    title: "Worker Dashboard",
    icon: Users,
    color: "text-amber-800",
    gradient: "from-yellow-100 to-amber-50",
  },
  manager: {
    title: "Manager Dashboard",
    icon: BarChart3,
    color: "text-yellow-700",
    gradient: "from-yellow-200 to-yellow-100",
  },
  admin: {
    title: "Admin Dashboard",
    icon: Settings,
    color: "text-amber-900",
    gradient: "from-amber-300 to-amber-200",
  },
};

export default function Dashboard() {
  const [userRole, setUserRole] = useState<keyof typeof roleData | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as keyof typeof roleData;
    if (role === "admin") {
      navigate("/admin");
    } else if (role && roleData[role]) {
      setUserRole(role);
      setTimeout(() => setIsHeaderVisible(true), 300);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!userRole || settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-gray-900 dark:via-black flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-200 border-t-amber-600 dark:border-amber-900 dark:border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-l-amber-400 dark:border-l-amber-600 rounded-full animate-ping" />
        </div>
      </div>
    );
  }

  const { title, icon: Icon, color, gradient } = roleData[userRole];

  const renderContent = () => {
    switch (userRole) {
      case "customer":
        return <CustomerDashboard />;
      case "driver":
        return <DriverDashboard />;
      case "worker":
        return <WorkerDashboard />;
      case "manager":
        return <ManagerDashboard />;
      default:
        return <div>Invalid role. Please log out and try again.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-gray-900 dark:via-black relative overflow-hidden">
      <div className="relative z-10 p-6">
        <header
          dir="ltr"
          className={`bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-amber-200 dark:border-gray-800 mb-8 transform transition-all duration-1000 ease-out ${
            isHeaderVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-8"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <div className="relative transform transition-all duration-500 hover:scale-110">
                <img
                  src={settings.company_logo_url || "/placeholder.svg"}
                  alt="Company Logo"
                  className="h-16 w-16 object-contain rounded-2xl shadow-lg border-2 border-amber-200 dark:border-gray-700"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl blur opacity-30 animate-pulse" />
              </div>
              <div className="flex items-center gap-x-2">
                <div
                  className={`p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg transform transition-all duration-500 hover:scale-110 hover:rotate-12`}
                >
                  <Icon className={`h-8 w-8 ${color}`} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400">
                    {title}
                  </h1>
                  <p className="text-lg text-gray-600 font-medium dark:text-gray-400">
                    {settings.company_name || "Naseej | نسيج"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <LanguageToggle />
              <ModeToggle />
              <div className="text-right bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-gray-800 dark:to-gray-800/50 p-4 rounded-xl shadow-sm border border-amber-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 font-medium dark:text-gray-400">
                  Today
                </p>
                <p className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center justify-end">
                  <span>{currentDate.toLocaleDateString()}</span>
                  <Sparkles className="h-4 w-4 mx-1 text-amber-400" />
                  <span>{currentDate.toLocaleTimeString()}</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLogout}
                className="shadow-lg border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 dark:border-gray-700 dark:text-gray-200 dark:hover:border-amber-600 dark:hover:bg-gray-800"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="space-y-8">{renderContent()}</main>
      </div>
    </div>
  );
}
