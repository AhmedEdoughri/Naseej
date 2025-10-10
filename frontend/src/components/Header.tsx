import { Link, useNavigate, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isContactPage = location.pathname === "/contact";

  return (
    <header className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-amber-200 dark:border-gray-800 mb-8 transform transition-all duration-1000 ease-out hover:shadow-3xl">
      <div className="flex items-center justify-between w-full gap-4">
        {/* ICON + TITLE */}
        <div
          className="flex items-center gap-x-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-300">
            <Globe className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400">
              Naseej | نسيج
            </h1>
          </div>
        </div>

        {/* TOGGLES */}
        <div className="flex items-center gap-x-2">
          <div className="flex gap-2 p-1.5 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg border border-amber-200/50 dark:border-gray-700/50 shadow-sm">
            <LanguageToggle />
            <ModeToggle />
          </div>

          {!isContactPage && (
            <Button
              asChild
              variant="outline"
              className="group relative px-5 py-5.5 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.05] active:scale-95 border border-amber-400/30 overflow-hidden"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
