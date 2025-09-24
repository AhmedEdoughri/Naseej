import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// The 'Store' type should be in your types/hwaliManager.ts file
interface Store {
  id?: string;
  name: string;
  contact_name: string;
  contact_phone: string;
  address: string;
  city: string;
  notes: string;
}

interface StoreFormProps {
  store?: Store | null;
  onSubmit: (store: Store) => void;
  onClose: () => void;
}

export const StoreForm = ({ store, onSubmit, onClose }: StoreFormProps) => {
  const [formData, setFormData] = useState<Store>({
    name: "",
    contact_name: "",
    contact_phone: "",
    address: "",
    city: "",
    notes: "",
  });

  // State to hold validation errors
  const [errors, setErrors] = useState<Partial<Store>>({});

  useEffect(() => {
    if (store) {
      setFormData(store);
    }
  }, [store]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear the error for the field being edited
    if (errors[e.target.name as keyof Store]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  // --- NEW: Validation Logic ---
  const validate = (): boolean => {
    const newErrors: Partial<Store> = {};

    // Rule 1: Store Name is required
    if (!formData.name.trim()) {
      newErrors.name = "Store name is required.";
    }

    // Rule 2: Contact Name is required
    if (!formData.contact_name.trim()) {
      newErrors.contact_name = "Contact name is required.";
    }

    // Rule 3: Contact Phone is required
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = "Contact phone is required.";
    } else {
      // Rule 4: Phone must be in a valid format (numbers and some special chars)
      const phoneRegex =
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
      if (!phoneRegex.test(formData.contact_phone)) {
        newErrors.contact_phone = "Please enter a valid phone number.";
      }
    }

    setErrors(newErrors);
    // The form is valid if the newErrors object is empty
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only submit if the form is valid
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Store Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_name">Contact Name</Label>
          <Input
            id="contact_name"
            name="contact_name"
            value={formData.contact_name}
            onChange={handleChange}
          />
          {errors.contact_name && (
            <p className="text-sm text-destructive">{errors.contact_name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
          />
          {errors.contact_phone && (
            <p className="text-sm text-destructive">{errors.contact_phone}</p>
          )}
        </div>
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
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 shadow-lg transform transition-all duration-300 hover:scale-105"
        >
          {store ? "Save Changes" : "Create Store"}
        </Button>
      </div>
    </form>
  );
};
