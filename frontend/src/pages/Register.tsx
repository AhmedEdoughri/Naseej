import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  CheckCircle2,
  Store,
  ArrowRight,
  Sparkles,
  Shield,
  User,
  Building,
  ArrowLeft,
  Home,
} from "lucide-react";
import { Header } from "@/components/Header";

const Register = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    storeName: "",
    storeAddress: "",
    storeCity: "",
    storeNotes: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [newUserId, setNewUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const response = await api.registerStore(formData);
      toast.success(t("registerSuccessToastTitle"), {
        description: t("registerSuccessToastDescription", {
          userId: response.userId,
        }),
        duration: 8000,
      });
      setIsSuccess(true);
      setMessage(response.message);
      setNewUserId(response.userId);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      toast.error(t("registerFailToastTitle"), {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-slate-900 dark:via-slate-950 relative overflow-hidden">
        <Header />
        <div className="flex items-center justify-center p-4">
          <div className="w-full max-w-lg relative z-10 mt-16">
            <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800 space-y-6 text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {t("registerSuccessTitle")}
              </h1>
              {newUserId && (
                <div className="py-4 px-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                  <p className="text-lg text-amber-800 dark:text-amber-200">
                    {t("yourUserIdIs")}{" "}
                    <strong className="font-bold text-2xl tracking-wider">
                      {newUserId}
                    </strong>
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    {t("userIdLoginNote")}
                  </p>
                </div>
              )}
              {message && (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-xl">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    {message}
                  </p>
                </div>
              )}
              <Button
                onClick={() => navigate("/")}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold py-4 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2 group"
              >
                <Home className="h-5 w-5" />
                <span>{t("backToHome")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-slate-900 dark:via-slate-950 relative overflow-hidden">
      <Header />

      <div className="flex items-center justify-center p-4 pt-10">
        <div
          className={`
           w-full max-w-lg relative z-10
           transform transition-all duration-1000 ease-out
           ${
             isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
           }
          `}
        >
          <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800 space-y-6 relative overflow-hidden">
            <Link
              to="/login?role=customer"
              aria-label="Go back to login"
              className="absolute top-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl group dark:border-slate-700 dark:bg-slate-800/70"
            >
              <ArrowLeft className="h-6 w-6 text-amber-600 transition-transform duration-300 group-hover:-translate-x-1 dark:text-amber-400" />
            </Link>

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg transform transition-all duration-500 hover:scale-110 hover:rotate-12">
                  <Store className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl blur opacity-30 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400 mb-2">
                {t("registerTitle")}
              </h1>
              <div className="flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                <Shield className="h-4 w-4 mx-2" />
                <span className="text-sm font-medium">
                  {t("registerSubtitle")}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* --- Personal Information --- */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {t("personalInformation")}
                  </h3>
                </div>

                {/* Row 1: Name + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="name"
                    placeholder={t("yourName")}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder={t("phoneNumber")}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className={
                      i18n.dir() === "rtl"
                        ? "text-right pr-3"
                        : "text-left pl-3"
                    }
                  />
                </div>

                {/* Row 2: Email + Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="email"
                    type="email"
                    placeholder={t("emailAddress")}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    name="password"
                    type="password"
                    placeholder={t("password")}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* --- Store Information --- */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4 pt-4 border-t border-amber-200 dark:border-slate-700">
                  <Building className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {t("storeInformation")}
                  </h3>
                </div>

                <Input
                  name="storeName"
                  placeholder={t("storeName")}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  name="storeAddress"
                  placeholder={t("storeAddress")}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  name="storeCity"
                  placeholder={t("storeCity")}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
                <Textarea
                  name="storeNotes"
                  placeholder={t("storeNotes")}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
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
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:from-amber-500 hover:to-yellow-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("creatingAccount")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
                    <span>{t("registerCTA")}</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>

            <div className="text-sm text-center pt-4 border-t border-amber-200 dark:border-slate-700 relative z-10 text-gray-600 dark:text-slate-400">
              {t("alreadyHaveAccount")}{" "}
              <Link
                to="/login?role=customer"
                className="font-semibold text-amber-600 hover:underline"
              >
                {t("loginHere")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
