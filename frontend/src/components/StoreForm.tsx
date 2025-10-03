import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// This interface now handles all fields for creating/editing a customer
interface CustomerStoreFormData {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  storeName: string;
  address: string;
  city: string;
  notes: string;
}

interface StoreFormProps {
  store?: Partial<CustomerStoreFormData> | null; // Use the same type for consistency
  onSubmit: (data: Partial<CustomerStoreFormData>) => void;
  onClose: () => void;
}

export const StoreForm = ({ store, onSubmit, onClose }: StoreFormProps) => {
  const [formData, setFormData] = useState<CustomerStoreFormData>({
    name: "",
    phone: "",
    email: "",
    password: "",
    storeName: "",
    address: "",
    city: "",
    notes: "",
  });

  // --- THIS IS THE CORRECTED USEEFFECT ---
  useEffect(() => {
    // If a 'store' object is passed, we are editing. Populate the form.
    if (store) {
      setFormData({
        id: store.id || "",
        name: store.name || "",
        phone: store.phone || "",
        email: store.email || "", // Email will be pre-filled but disabled
        password: "", // Password should always be empty for security
        storeName: store.storeName || "",
        address: store.address || "",
        city: store.city || "",
        notes: store.notes || "",
      });
    } else {
      // If 'store' is null, we are creating. Ensure the form is completely blank.
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        storeName: "",
        address: "",
        city: "",
        notes: "",
      });
    }
  }, [store]); // This effect re-runs whenever the 'store' prop changes

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium text-amber-700 dark:text-amber-400">
        User Information
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Contact Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Contact Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={!!store}
          />
        </div>
        {/* Only show the password field when creating a new user (when 'store' is null) */}
        {!store && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        )}
      </div>

      <hr className="my-6 border-amber-200 dark:border-gray-700" />
      <h3 className="text-lg font-medium text-amber-700 dark:text-amber-400">
        Store Information
      </h3>

      <div className="space-y-2">
        <Label htmlFor="storeName">Store Name</Label>
        <Input
          id="storeName"
          name="storeName"
          value={formData.storeName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white..."
        >
          {store ? "Save Changes" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
};
