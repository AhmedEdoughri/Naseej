import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id?: string;
  name: string;
  phone: string;
  email: string;
  role_id: number | string;
  roleName?: string;
  status: string;
  password?: string;
  notes?: string;
}
interface Role {
  id: number;
  name: string;
}

interface UserFormProps {
  user?: User | null;
  roles: Role[];
  onSubmit: (user: User) => void;
  onClose: () => void;
}

export const UserForm = ({ user, roles, onSubmit, onClose }: UserFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    phone: "",
    role_id: "",
    status: "",
    password: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<User>>({});
  const isStoreUser = user?.roleName === "customer";

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        role_id: user.role_id || "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof User]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof User]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<User> = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.phone.trim()) {
      newErrors.phone = t("adminPanel.userForm.phoneRequired");
    } else {
      const phoneRegex =
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
      if (!phoneRegex.test(formData.phone))
        newErrors.phone = t("adminPanel.userForm.phoneValid");
    }
    if (!isStoreUser && !formData.role_id) {
      newErrors.role_id = t("adminPanel.userForm.roleRequired");
    }
    if (!formData.status)
      newErrors.status = t("adminPanel.userForm.accountRequired");

    const isNewUser = !user?.id;
    if (isNewUser && (!formData.password || formData.password.length < 6)) {
      newErrors.password = t("adminPanel.userForm.passwordRequired");
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = t("adminPanel.userForm.passwordLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("adminPanel.userForm.fullName")}</Label>
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

      <div className="space-y-2">
        <Label htmlFor="email">{t("adminPanel.userForm.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t("adminPanel.userForm.phone")}</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("adminPanel.userForm.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={
            user
              ? t("adminPanel.userForm.PasswordPlaceholder")
              : t("adminPanel.userForm.newPasswordPlaceholder")
          }
          onChange={handleChange}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("adminPanel.userForm.notes")}</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder={t("adminPanel.userForm.notesPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {!isStoreUser && (
          <div className="space-y-2">
            <Label htmlFor="role_id">{t("adminPanel.userForm.role")}</Label>
            <Select
              value={String(formData.role_id)}
              onValueChange={(value) => handleSelectChange("role_id", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("adminPanel.userForm.selectRole")}
                />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role_id && (
              <p className="text-sm text-destructive">{errors.role_id}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="status">
            {t("adminPanel.userForm.accountStatus")}
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t("adminPanel.userForm.selectStatus")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                {t("adminPanel.statuses.active")}
              </SelectItem>
              <SelectItem value="locked">
                {t("adminPanel.statuses.locked")}
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          {t("adminPanel.userForm.cancel")}
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 shadow-lg transform transition-all duration-300 hover:scale-105"
        >
          {user
            ? t("adminPanel.userForm.saveChanges")
            : t("adminPanel.userForm.createUser")}
        </Button>
      </div>
    </form>
  );
};
