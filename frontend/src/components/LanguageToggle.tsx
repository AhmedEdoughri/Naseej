import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { cn } from "../lib/utils";

export const LanguageToggle = ({ className }: { className?: string }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="icon"
      aria-label="Toggle language"
      className={cn(className)}
    >
      <Languages className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  );
};
