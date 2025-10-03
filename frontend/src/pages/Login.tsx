import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { Input } from "@/components/ui/input";
import {
  Store,
  Truck,
  Users,
  BarChart3,
  Settings,
  LogIn,
  ArrowRight,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Header } from "@/components/Header";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";

const roleConfig = {
  customer: { title: "Customer Portal Sign In", icon: Store },
  driver: { title: "Driver Dashboard Sign In", icon: Truck },
  worker: { title: "Worker Board Sign In", icon: Users },
  manager: { title: "Manager Dashboard Sign In", icon: BarChart3 },
  admin: { title: "Admin Panel Sign In", icon: Settings },
};

const Login = () => {
  const { t, i18n } = useTranslation();
  // --- CHANGE 1: Use 'identifier' instead of 'email' ---
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  const role = searchParams.get("role") as keyof typeof roleConfig;
  const { title, icon: Icon } = roleConfig[role] || {
    title: "Naseej | نسيج - Sign In",
    icon: LogIn,
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const expectedRole = searchParams.get("role");

    try {
      // --- CHANGE 2: Pass the 'identifier' to the API ---
      const response = await api.login(identifier, password, expectedRole);
      const { token, role, userId, is_first_login } = response;

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", userId);

      const employeeRoles = ["worker", "driver", "manager"];
      if (is_first_login && employeeRoles.includes(role)) {
        setIsFirstLogin(true);
      } else {
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.message) {
        setError(t(err.message));
      } else {
        setError(t("login_failed_generic"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ChangePasswordModal open={isFirstLogin} onOpenChange={setIsFirstLogin} />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-slate-900 dark:via-slate-950 relative overflow-hidden flex items-center justify-center p-4 pt-32">
        <div dir="ltr">
          <Header />
        </div>

        <div
          className={`
           w-full max-w-md relative z-10
           transform transition-all duration-1000 ease-out
           ${
             isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
           }
          `}
        >
          <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800 space-y-6 relative overflow-hidden">
            <Link
              to="/"
              aria-label="Go back to home"
              className="absolute top-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl group dark:border-slate-700 dark:bg-slate-800/70"
            >
              <ArrowLeft className="h-6 w-6 text-amber-600 transition-transform duration-300 group-hover:-translate-x-1 dark:text-amber-400" />
            </Link>
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg transform transition-all duration-500 hover:scale-110 hover:rotate-12">
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl blur opacity-30 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400 mb-2">
                {t("loginWelcome")}
              </h1>
              <div className="flex items-center text-amber-600 dark:text-amber-400 mb-4">
                <Shield className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{t("loginSecure")}</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div>
                  {/* --- CHANGE 3: Update the label and input field --- */}
                  <label
                    htmlFor="identifier"
                    className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {t("emailOrUserId")}
                  </label>
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder={
                      i18n.language === "ar"
                        ? "البريد الإلكتروني أو رقم المستخدم"
                        : "Email or User ID"
                    }
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      {t("password")}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-amber-600 hover:underline"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder={"••••••••"}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:from-amber-500 hover:to-yellow-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("signingIn")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("signIn")}</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
            {role === "customer" && (
              <div className="text-sm text-center">
                {t("dontHaveAccount")}{" "}
                <Link
                  to="/register"
                  className="font-semibold text-amber-600 hover:underline"
                >
                  {t("registerHere")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
