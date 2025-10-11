import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Sparkles,
  Lock,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useSettings } from "../contexts/SettingsContext";
import { createPortal } from "react-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DashboardHeaderProps {
  title: string;
  icon?: React.ElementType; // optional icon
  homeLink?: string; // link to main dashboard
}

export const DashboardHeader = ({
  title,
  icon: Icon,
  homeLink = "/dashboard",
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Update date every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".dropdown-container") &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Toggle dropdown position
  const toggleDropdown = () => {
    if (!dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 208,
      });
    }
    setDropdownOpen((prev) => !prev);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    setIsLogoutAlertOpen(true);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password cannot be the same as the current password");
      return;
    }

    setLoading(true);
    try {
      await api.updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordChangeSuccess(true);
      setTimeout(() => {
        setPasswordChangeSuccess(false);
        setIsModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }, 2000);
      toast.success("Password changed successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="ltr">
      <header className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-amber-200 dark:border-gray-800 mb-8 transform transition-all duration-1000 ease-out hover:shadow-3xl">
        <div className="flex flex-col lg:flex-row items-center w-full gap-4">
          {/* ICON + TITLE */}
          <div
            className="flex items-center gap-x-3 min-w-[250px] cursor-pointer"
            onClick={() => navigate(homeLink)}
          >
            {Icon && (
              <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Icon className="h-7 w-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400">
                {title}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium dark:text-gray-400">
                {settings.company_name || "Naseej | نسيج"}
              </p>
            </div>
          </div>

          {/* DATE DISPLAY */}
          <div className="flex-1 flex justify-center w-full lg:w-auto">
            <div className="group relative text-center bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-50 dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-800/50 px-6 py-3 rounded-xl shadow-lg border-2 border-amber-300/50 dark:border-amber-700/30 hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 hover:scale-[1.03] cursor-default overflow-hidden">
              <p className="relative text-xs text-amber-700 font-semibold dark:text-amber-400 mb-1 tracking-wide">
                TODAY
              </p>
              <p className="relative font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 flex items-center justify-center gap-x-2 flex-wrap">
                <span className="text-amber-800 dark:text-amber-300">
                  {currentDate.toLocaleDateString()}
                </span>
                <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                <span className="text-gray-700 dark:text-gray-300">
                  {currentDate.toLocaleTimeString()}
                </span>
              </p>
            </div>
          </div>

          {/* ACCOUNT / TOGGLES */}
          <div className="flex items-center gap-x-2 min-w-[200px] justify-end relative dropdown-container">
            <div className="flex gap-2 p-1.5 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg border border-amber-200/50 dark:border-gray-700/50 shadow-sm">
              <LanguageToggle />
              <ModeToggle />
            </div>

            <Button
              asChild
              variant="outline"
              className="group relative px-5 py-5.5 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.05] active:scale-95 border border-amber-400/30 overflow-hidden"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>

            <div className="relative">
              <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className="group relative px-5 py-2.5 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.05] active:scale-95 border border-amber-400/30 overflow-hidden"
              >
                <span className="relative flex items-center gap-2">
                  <span>Account</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </span>
              </button>

              {dropdownOpen &&
                createPortal(
                  <div
                    ref={dropdownRef}
                    style={{
                      position: "absolute",
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: "208px",
                    }}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-gray-700 rounded-xl shadow-2xl z-[9999] overflow-hidden animate-scale-in"
                  >
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 dark:hover:from-gray-700 dark:hover:to-gray-700 transition-all duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
                      onClick={() => {
                        setIsModalOpen(true);
                        setDropdownOpen(false);
                      }}
                    >
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Change Password
                    </button>
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium border-t border-gray-200 dark:border-gray-700"
                      onClick={handleLogoutClick}
                    >
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                      Logout
                    </button>
                  </div>,
                  document.body
                )}
            </div>
          </div>
        </div>
      </header>

      {/* LOGOUT ALERT */}
      <AlertDialog open={isLogoutAlertOpen} onOpenChange={setIsLogoutAlertOpen}>
        <AlertDialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white via-amber-50/20 to-yellow-50/10 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-800/50 backdrop-blur-sm border-2 border-amber-300 dark:border-amber-700/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg">
                <AlertTriangle className="text-white h-6 w-6" />
              </div>
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 dark:text-gray-300 text-base mt-3 bg-amber-100/50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-amber-500">
              Are you sure you want to end your session? You will be returned to
              the main page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-6">
            <AlertDialogCancel asChild>
              <button className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95">
                Go Back
              </button>
            </AlertDialogCancel>
            <AlertDialogAction
              className="group relative px-5 py-2.5 bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-red-400/30 overflow-hidden"
              onClick={confirmLogout}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative">Yes, Log Out</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl border-2 border-amber-200 dark:border-gray-800 animate-scale-in">
            {passwordChangeSuccess ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mb-4 animate-bounce-in shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Password Changed!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your password has been updated successfully
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Change Password
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="current"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Current Password
                    </Label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        id="current"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={loading}
                        className="w-full pr-10 px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 focus:bg-white dark:focus:bg-gray-900 outline-none disabled:opacity-50 text-gray-900 dark:text-gray-100"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="new"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      New Password
                    </Label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="new"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        className="w-full pr-10 px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 focus:bg-white dark:focus:bg-gray-900 outline-none disabled:opacity-50 text-gray-900 dark:text-gray-100"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="confirm"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirm"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        className="w-full pr-10 px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 focus:bg-white dark:focus:bg-gray-900 outline-none disabled:opacity-50 text-gray-900 dark:text-gray-100"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    disabled={loading}
                    className="flex-1 border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? "Saving..." : "Save Password"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
