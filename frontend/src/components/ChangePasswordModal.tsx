import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { KeyRound, ArrowRight } from "lucide-react";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePasswordModal = ({
  open,
  onOpenChange,
}: ChangePasswordModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ NEW: validation error states
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async () => {
    let newErrors: typeof errors = {};

    if (newPassword.length < 8) {
      newErrors.newPassword = t("password_too_short");
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("passwordsDoNotMatch");
    }

    // ✅ If there are validation errors, show them inline and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear previous errors
    setErrors({});

    setIsLoading(true);
    try {
      await api.changePassword(newPassword, confirmPassword);
      toast.success(t("passwordChangedSuccess"));
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error) {
      toast.error(t("passwordChangeFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-amber-200 dark:border-slate-800">
        <DialogHeader className="flex flex-col items-center text-center pt-4">
          <div className="relative mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl blur opacity-30 animate-pulse" />
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400">
            {t("setNewPassword")}
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 pt-1">
            {t("updateYourPasswordPrompt")}
          </p>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          {/* NEW PASSWORD */}
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="font-semibold text-gray-700 dark:text-gray-300"
            >
              {t("newPassword")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              placeholder="••••••••"
              className={errors.newPassword ? "border-red-500" : ""}
            />
            {/* ✅ Inline error message */}
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="font-semibold text-gray-700 dark:text-gray-300"
            >
              {t("confirmPassword")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="••••••••"
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:from-amber-500 hover:to-yellow-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-x-2 group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t("saving")}</span>
              </>
            ) : (
              <>
                <span>{t("savePassword")}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
