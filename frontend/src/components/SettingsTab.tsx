import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "../services/api";
import { useSettings } from "../contexts/SettingsContext";

interface Settings {
  pickup_price: string;
  delivery_price: string;
  company_name: string;
  company_logo_url: string;
}

export const SettingsTab = () => {
  const { refetchSettings } = useSettings();
  const [settings, setSettings] = useState<Settings>({
    pickup_price: "",
    delivery_price: "",
    company_name: "",
    company_logo_url: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // The API now returns an object, not an array
        const settingsObject = await api.getSettings();
        setSettings(settingsObject);
      } catch (error) {
        toast.error("Failed to load settings.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      // The API now expects a single object
      await api.updateSettings(settings);
      toast.success("Settings saved successfully!");
      setIsDirty(false);
      refetchSettings(); // Refetch settings globally
    } catch (error) {
      toast.error("Failed to save settings.");
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Pricing Section */}
      <div>
        <h3 className="text-lg font-medium">Pricing</h3>
        <p className="text-sm text-muted-foreground">
          Set the default prices for your services.
        </p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="pickup_price">Pickup Price</Label>
              <p className="text-sm text-muted-foreground">
                Cost for a customer to request a pickup.
              </p>
            </div>
            <Input
              id="pickup_price"
              name="pickup_price"
              type="number"
              min={0}
              value={settings.pickup_price}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") {
                  // block negative sign and scientific notation
                  e.preventDefault();
                }
              }}
              className="max-w-xs"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="delivery_price">Delivery Price</Label>
              <p className="text-sm text-muted-foreground">
                Cost for delivering finished items to a customer.
              </p>
            </div>
            <Input
              id="delivery_price"
              name="delivery_price"
              type="number"
              min={0}
              value={settings.delivery_price}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") {
                  // block negative sign and scientific notation
                  e.preventDefault();
                }
              }}
              className="max-w-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isDirty}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 shadow-lg"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};
