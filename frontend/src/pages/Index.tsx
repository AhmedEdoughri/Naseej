import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store,
  Truck,
  Users,
  BarChart3,
  Settings,
  Package,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  Minus,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import hwaliHero from "@/assets/hwali-hero.png";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import React from "react";

// Define the Status type
interface Status {
  id: number;
  name: string;
  color: string;
}

const AnimatedRoleCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  gradient = false,
  delay = 0,
  isLoggedIn = false,
  className = "",
}: {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
  gradient?: boolean;
  delay?: number;
  isLoggedIn?: boolean;
  className?: string;
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        ${
          gradient
            ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-white"
            : "bg-white text-gray-800 dark:bg-slate-800/50 dark:text-gray-200"
        }
        border border-amber-200 dark:border-slate-800 rounded-xl p-6 cursor-pointer
        transform transition-all duration-500 ease-out
        hover:scale-105 hover:shadow-2xl hover:-translate-y-2
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        group relative overflow-hidden
        shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-500/10
        ${className}
      `}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out dark:via-white/10" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`
              p-3 rounded-xl transition-all duration-300
              ${
                gradient
                  ? "bg-white/20 backdrop-blur-sm"
                  : "bg-amber-100 dark:bg-slate-700/50"
              }
              group-hover:scale-110 group-hover:rotate-12
            `}
          >
            <Icon
              className={`h-6 w-6 ${
                gradient ? "text-white" : "text-amber-600 dark:text-amber-400"
              }`}
            />
          </div>
          <ArrowRight
            className={`
              h-5 w-5 transition-all duration-300
              ${
                gradient ? "text-white/70" : "text-gray-400 dark:text-slate-500"
              }
              group-hover:translate-x-1 group-hover:text-amber-600 dark:group-hover:text-amber-400
            `}
          />
        </div>
        <h3
          className={`
            font-bold text-lg mb-2 transition-colors duration-300
            ${
              gradient
                ? "text-white"
                : "text-gray-800 group-hover:text-amber-700 dark:text-gray-200 dark:group-hover:text-amber-400"
            }
          `}
        >
          {isLoggedIn ? `Go to ${title}` : title}
        </h3>
        <p
          className={`
            text-sm leading-relaxed transition-colors duration-300
            ${gradient ? "text-white/90" : "text-gray-600 dark:text-slate-400"}
          `}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
const AnimatedStatusFlow = ({
  statuses,
  className = "",
}: {
  statuses: Status[];
  className?: string;
}) => {
  const { t } = useTranslation();
  const [visibleStatuses, setVisibleStatuses] = useState<number[]>([]);

  useEffect(() => {
    statuses.forEach((_, index) => {
      setTimeout(() => {
        setVisibleStatuses((prev) => [...prev, index]);
      }, index * 200);
    });
  }, [statuses]);

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-amber-200 dark:border-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102">
      <div className="flex items-center mb-4 gap-x-2">
        <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 animate-pulse" />
        <h3 className="font-bold text-gray-800 dark:text-gray-200">
          {t("statusFlowTitle")}
        </h3>
      </div>
      <div className="flex flex-col items-center gap-y-2">
        {statuses.map((status, index) => (
          <React.Fragment key={status.id}>
            <div
              className={`
          w-full flex items-center justify-between p-3 rounded-lg
          bg-gradient-to-r from-amber-50 to-transparent dark:from-slate-700/30
          border border-amber-100 dark:border-slate-700/50
          transform transition-all duration-500 ease-out
          hover:scale-102 hover:shadow-md hover:from-amber-100 hover:to-amber-50 dark:hover:from-slate-700/50 dark:hover:to-slate-700/20
          ${
            visibleStatuses.includes(index)
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4"
          }
          group cursor-pointer
        `}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-x-3">
                <div
                  className="w-3 h-3 rounded-full shadow-sm transition-all duration-300 group-hover:scale-125"
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-gray-600 dark:text-slate-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300 font-medium">
                  {t(`statuses.${status.name.toLowerCase()}`)}
                </span>
              </div>
              <CheckCircle className="h-4 w-4 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300" />
            </div>

            {/* Add a down arrow if it's not the last item */}
            {index < statuses.length - 1 && (
              <ChevronDown className="h-5 w-5 text-amber-400 opacity-60" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const AnimatedStats = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    orders: 0,
    stores: 0,
    drivers: 0,
  });

  useEffect(() => {
    setIsVisible(true);

    const targets = { orders: 1247, stores: 89, drivers: 23 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounters({
        orders: Math.floor(targets.orders * easeOut),
        stores: Math.floor(targets.stores * easeOut),
        drivers: Math.floor(targets.drivers * easeOut),
      });

      if (step >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      label: t("ordersProcessed"),
      value: counters.orders,
      icon: Package,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: t("partnerStores"),
      value: counters.stores,
      icon: Store,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: t("activeDrivers"),
      value: counters.drivers,
      icon: Truck,
      color: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div
      className={`
      grid grid-cols-1 md:grid-cols-3 gap-6 mb-12
      transform transition-all duration-1000 ease-out
      ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
    `}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`
            bg-white dark:bg-slate-800/50 border border-amber-200 dark:border-slate-800 rounded-xl p-6 text-center shadow-lg
            hover:shadow-xl hover:scale-105 transition-all duration-300
            transform
            ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }
          `}
          style={{ transitionDelay: `${index * 0}ms` }}
        >
          <div
            className={`
            inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
            bg-gradient-to-br from-amber-100 to-amber-200 dark:from-slate-700/50 dark:to-slate-700
            transform transition-all duration-300 hover:scale-110 hover:rotate-12
          `}
          >
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {stat.value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-400 font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [loggedInRole, setLoggedInRole] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) {
      setLoggedInRole(role);
    }

    setTimeout(() => setIsHeroVisible(true), 300);
    setTimeout(() => setIsContentVisible(true), 800);
  }, []);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const fetchedStatuses = await api.getStatuses();
        setStatuses(fetchedStatuses);
      } catch (error) {
        console.error("Failed to fetch statuses:", error);
      }
    };

    fetchStatuses();
  }, []);

  const handleRoleClick = (role: string, path: string) => {
    if (loggedInRole === role) {
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-slate-900 dark:via-slate-950 relative overflow-hidden">
      <div
        dir="ltr"
        className="absolute top-6 right-6 z-20 flex items-center gap-x-4"
      >
        <Button
          asChild
          className="bg-transparent text-white border border-white/50 hover:bg-white/20"
        >
          <Link to="/contact">{t("contactUs")}</Link>
        </Button>
        <Minus className="h-5 w-5 text-white/80" />
        <LanguageToggle className="bg-transparent text-white border border-white/50 hover:bg-white/20" />
        <Button
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bg-transparent text-white border border-white/50 hover:bg-white/20"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden z-10">
        <div className="absolute inset-0">
          <img
            src={hwaliHero}
            alt="Professional Hwali management system workspace"
            className="w-full h-full object-cover opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-yellow-600 opacity-90 dark:from-amber-800 dark:to-yellow-800 dark:opacity-80"></div>
        </div>
        <div className="relative text-white py-20 px-1 pt-12">
          <div
            className={`
            max-w-4xl mx-auto text-center
            transform transition-all duration-1000 ease-out
            ${
              isHeroVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }
          `}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-500 to-white bg-clip-text text-transparent pb-4 pt-4"
            >
              {t("welcomeMessage")}
            </motion.h1>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              {t("welcomeSubtitle")}
            </p>
            <div
              className={`
              flex flex-col sm:flex-row gap-4 justify-center items-center
              transform transition-all duration-1000 ease-out
              ${
                isHeroVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }
            `}
              style={{ transitionDelay: "0ms" }}
            >
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-300 flex items-center gap-x-2 group"
              >
                <span>{t("getStarted")}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button className="px-8 py-4 bg-transparent border border-white/50 rounded-xl text-white font-semibold hover:bg-white/10 hover:scale-105 transition-all duration-300 flex items-center gap-x-2">
                <Clock className="h-5 w-5" />
                <span>{t("learnMore")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        <AnimatedStats />
        <div
          className={`
          text-center mb-16
          transform transition-all duration-1000 ease-out
          ${
            isContentVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }
        `}
        >
          <div className="flex items-center justify-center mb-4 gap-x-2">
            <TrendingUp className="h-8 w-8 text-amber-600 dark:text-amber-400 mr-3 animate-pulse" />
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
              {t("selectRole")}
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t("selectRoleDescription")}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNS 1 & 2: Main Panels */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Driver Dashboard (Row 1, Col 1) */}
            <AnimatedRoleCard
              title={t("driverDashboardTitle")}
              description={t("driverDashboardDescription")}
              icon={Truck}
              onClick={() => handleRoleClick("driver", "/login?role=driver")}
              delay={0}
              isLoggedIn={loggedInRole === "driver"}
              className="h-full"
            />

            {/* Worker Board (Row 1, Col 2) */}
            <AnimatedRoleCard
              title={t("workerBoardTitle")}
              description={t("workerBoardDescription")}
              icon={Users}
              onClick={() => handleRoleClick("worker", "/login?role=worker")}
              delay={0}
              isLoggedIn={loggedInRole === "worker"}
              className="h-full"
            />

            {/* Customer View (Row 2, Col 1) */}
            <AnimatedRoleCard
              title={t("customerViewTitle")}
              description={t("customerViewDescription")}
              icon={Store}
              onClick={() =>
                handleRoleClick("customer", "/login?role=customer")
              }
              delay={0}
              isLoggedIn={loggedInRole === "customer"}
              className="h-full"
            />

            {/* Admin Panel (Row 2, Col 2) */}
            <AnimatedRoleCard
              title={t("adminPanelTitle")}
              description={t("adminPanelDescription")}
              icon={Settings}
              onClick={() => handleRoleClick("admin", "/login?role=admin")}
              delay={0}
              isLoggedIn={loggedInRole === "admin"}
              className="h-full"
            />

            {/* Manager Overview (Row 3, spans Col 1 & 2) */}
            <div className="md:col-span-2">
              <AnimatedRoleCard
                title={t("managerOverviewTitle")}
                description={t("managerOverviewDescription")}
                icon={BarChart3}
                onClick={() =>
                  handleRoleClick("manager", "/login?role=manager")
                }
                gradient={true}
                delay={0}
                isLoggedIn={loggedInRole === "manager"}
              />
            </div>
          </div>

          {/* COLUMN 3: Status Flow */}
          <div className="lg:col-span-1 h-full">
            <div
              className={`
        transform transition-all duration-500 ease-out
        ${
          isContentVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }
      `}
              style={{ transitionDelay: "1000ms" }}
            >
              <AnimatedStatusFlow statuses={statuses} className="h-full" />
            </div>
          </div>
        </div>
      </div>
      <footer
        className={`
        relative z-10 mt-5 py-12 border-t border-amber-200 dark:border-slate-800
        transform transition-all duration-1000 ease-out
        ${
          isContentVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }
      `}
        style={{ transitionDelay: "2000ms" }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4 gap-x-2">
            <Package className="h-8 w-8 text-amber-600 dark:text-amber-400 mr-3" />
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Naseej | نسيج
            </span>
          </div>
          <p className="text-gray-600 dark:text-slate-400">{t("footerText")}</p>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link to="/contact">{t("contactUs")}</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
