import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HexColorPicker } from "react-colorful";

// Interface for a single status object
interface Status {
  id?: number;
  name: string;
  description: string;
  color: string;
  display_order: number;
}

// Props for the StatusForm component
interface StatusFormProps {
  status?: Status | null;
  statuses: Status[];
  onSubmit: (status: Omit<Status, "id">) => void;
  onClose: () => void;
}

// Type for form validation errors
type StatusErrors = {
  [K in keyof Omit<Status, "id">]?: string;
};

export const StatusForm = ({
  status,
  statuses,
  onSubmit,
  onClose,
}: StatusFormProps) => {
  const [formData, setFormData] = useState<Omit<Status, "id">>({
    name: "",
    description: "",
    color: "#353b44ff",
    display_order: 1,
  });
  const [errors, setErrors] = useState<StatusErrors>({});
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  useEffect(() => {
    if (status) {
      setFormData({
        name: status.name,
        description: status.description,
        color: status.color,
        display_order: status.display_order,
      });
    } else {
      const maxOrder = statuses.reduce(
        (max, s) => (s.display_order > max ? s.display_order : max),
        0
      );
      setFormData({
        name: "",
        description: "",
        color: "#353b44ff",
        display_order: maxOrder + 1,
      });
    }
  }, [status, statuses]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const processedValue =
      name === "display_order" ? parseInt(value, 10) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name as keyof StatusErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: StatusErrors = {};
    if (!formData.name.trim()) newErrors.name = "Status name is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.color.trim()) newErrors.color = "Color is required.";
    if (formData.display_order <= 0)
      newErrors.display_order = "Display order must be a positive number.";
    const isOrderInUse = statuses.some(
      (s) => s.display_order === formData.display_order && s.id !== status?.id
    );
    if (isOrderInUse)
      newErrors.display_order = "This order number is already in use.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const popover: React.CSSProperties = { position: "absolute", zIndex: 2 };
  const cover: React.CSSProperties = {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Status Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name">Status Name</Label>
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

      {/* Description Textarea */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Color Picker */}
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center gap-2">
            <div
              className="p-1 bg-white border border-gray-300 rounded cursor-pointer dark:bg-slate-900 dark:border-slate-700"
              onClick={() => setDisplayColorPicker(!displayColorPicker)}
            >
              <div
                className="w-16 h-8 rounded"
                style={{ backgroundColor: formData.color }}
              />
            </div>
            <Input
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-24"
            />
          </div>
          {displayColorPicker && (
            <div style={popover}>
              <div style={cover} onClick={() => setDisplayColorPicker(false)} />
              <HexColorPicker
                color={formData.color}
                onChange={(color) =>
                  setFormData((prev) => ({ ...prev, color }))
                }
              />
            </div>
          )}
          {errors.color && (
            <p className="text-sm text-destructive">{errors.color}</p>
          )}
        </div>

        {/* Display Order Input */}
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            name="display_order"
            type="number"
            min="1"
            value={formData.display_order}
            onChange={handleChange}
          />
          {errors.display_order && (
            <p className="text-sm text-destructive">{errors.display_order}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 shadow-lg transform transition-all duration-300 hover:scale-105"
        >
          {status ? "Save Changes" : "Create Status"}
        </Button>
      </div>
    </form>
  );
};
