import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Truck, Users, BarChart3 } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import {
  CustomerDashboard,
  DriverDashboard,
  WorkerDashboard,
  ManagerDashboard,
} from "@/components/dashboards";
import { DashboardHeader } from "@/components/DashboardHeader"; // Import the new header

const roleData = {
  customer: { title: "Customer Dashboard", icon: Store },
  driver: { title: "Driver Dashboard", icon: Truck },
  worker: { title: "Worker Dashboard", icon: Users },
  manager: { title: "Manager Dashboard", icon: BarChart3 },
  admin: { title: "Admin Dashboard", icon: null },
};

export default function Dashboard() {
  const [userRole, setUserRole] = useState<keyof typeof roleData | null>(null);
  const navigate = useNavigate();
  const { loading: settingsLoading } = useSettings();

  useEffect(() => {
    const role = localStorage.getItem("userRole") as keyof typeof roleData;
    if (!role || !roleData[role]) {
      navigate("/login");
    } else if (role === "admin") {
      navigate("/admin");
    } else {
      setUserRole(role);
    }
  }, [navigate]);

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

  if (!userRole || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Loading Spinner */}
        <div className="w-20 h-20 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  const { title, icon } = roleData[userRole];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:via-black">
      <div className="relative z-10 p-6">
        <DashboardHeader title={title} icon={icon || undefined} />
        <main
          className="space-y-8 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
