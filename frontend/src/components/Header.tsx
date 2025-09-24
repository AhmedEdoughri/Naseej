import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Package } from "lucide-react";

export const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div dir="ltr" className="container mx-auto">
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="flex items-center gap-x-2 group">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg transform transition-transform duration-300 group-hover:rotate-12">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400">
              Naseej | نسيج
            </h1>
          </Link>
          <div className="flex items-center gap-x-2">
            <LanguageToggle />
            <ModeToggle />
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-700"></div>
      </div>
    </header>
  );
};
