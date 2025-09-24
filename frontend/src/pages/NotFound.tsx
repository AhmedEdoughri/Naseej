import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-slate-900 dark:via-slate-950 flex flex-col items-center justify-center text-center p-4">
      <Header />
      <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-lg p-12 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
              <AlertTriangle className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-slate-400 max-w-sm mx-auto mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2 group"
        >
          <Home className="h-5 w-5" />
          <span>Go Back Home</span>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
