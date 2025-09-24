import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../services/api";

interface Settings {
  company_name?: string;
  company_logo_url?: string;
  [key: string]: any; // Allow other settings
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refetchSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  loading: true,
  refetchSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    // First, check if a token exists. If not, don't try to fetch.
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false); // Stop loading, as there's nothing to fetch
      return;
    }

    try {
      setLoading(true);
      const settingsObject = await api.getSettings();
      setSettings(settingsObject);
    } catch (error) {
      // Don't show an error toast here, as it can be annoying on initial load.
      // The console error is enough for debugging.
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, refetchSettings: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
