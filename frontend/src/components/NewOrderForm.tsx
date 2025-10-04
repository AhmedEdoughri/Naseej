// frontend/src/components/NewOrderForm.tsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

interface OrderFormData {
  quantity: number | string;
  notes?: string;
  inboundOption: "customer_dropoff" | "business_pickup";
  outboundOption: "customer_pickup" | "business_delivery";
  deadline: Date | undefined;
}

interface NewOrderFormProps {
  onSuccess?: () => void;
}

export const NewOrderForm = ({ onSuccess }: NewOrderFormProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    quantity: "",
    notes: "",
    inboundOption: "customer_dropoff",
    outboundOption: "customer_pickup",
    deadline: undefined,
  });

  const minDeadline = new Date();
  minDeadline.setDate(minDeadline.getDate() + 3);
  minDeadline.setHours(0, 0, 0, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue =
      name === "quantity"
        ? value === ""
          ? ""
          : Math.max(1, parseInt(value, 10))
        : value;
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleDateChange = (date: Date | undefined) =>
    setFormData((prev) => ({ ...prev, deadline: date }));
  const handleInboundOptionChange = (
    value: "customer_dropoff" | "business_pickup"
  ) => setFormData((prev) => ({ ...prev, inboundOption: value }));
  const handleOutboundOptionChange = (
    value: "customer_pickup" | "business_delivery"
  ) => setFormData((prev) => ({ ...prev, outboundOption: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deadline || !formData.quantity) {
      toast.error(t("error_fillAllFields"));
      return;
    }

    setIsLoading(true);
    try {
      await api.createRequest({
        total_qty: Number(formData.quantity),
        notes: formData.notes || null,
        deadline: formData.deadline.toISOString(),
        inbound_option: formData.inboundOption,
        outbound_option: formData.outboundOption,
      });
      toast.success(t("success_orderPlaced"));
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(t("error_orderFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Quantity */}
        <div className="">
          <Input
            id="quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            disabled={isLoading}
            min={1}
            placeholder={t("quantity")}
            className="rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400 transition-all duration-300"
          />
        </div>

        {/* Notes */}
        <div className="">
          <Input
            id="notes"
            name="notes"
            type="text"
            value={formData.notes}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder={`${t("notes")} (${t("optional")})`}
            className="rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400 transition-all duration-300"
          />
        </div>

        {/* Inbound Options */}
        <div className="col-span-1 md:col-span-2 flex flex-col">
          <Label className="mb-2 text-gray-700 dark:text-gray-300 font-semibold">
            {t("inboundLogistics")}
          </Label>
          <RadioGroup
            value={formData.inboundOption}
            onValueChange={handleInboundOptionChange}
            className="flex space-x-6"
            disabled={isLoading}
          >
            {["customer_dropoff", "business_pickup"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option as any}
                  id={option}
                  className="w-6 h-6 rounded-full border-2 border-amber-500 checked:bg-amber-500 focus:outline-none focus:ring-amber-400 focus:ring-2 transition-all duration-200"
                />
                <Label
                  htmlFor={option}
                  className="text-gray-700 dark:text-gray-300"
                >
                  {t(option)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Outbound Options */}
        <div className="col-span-1 md:col-span-2 flex flex-col">
          <Label className="mb-2 text-gray-700 dark:text-gray-300 font-semibold">
            {t("outboundLogistics")}
          </Label>
          <RadioGroup
            value={formData.outboundOption}
            onValueChange={handleOutboundOptionChange}
            className="flex space-x-6"
            disabled={isLoading}
          >
            {["customer_pickup", "business_delivery"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option as any}
                  id={option}
                  className="w-6 h-6 rounded-full border-2 border-amber-500 checked:bg-amber-500 focus:outline-none focus:ring-amber-400 focus:ring-2 transition-all duration-200"
                />
                <Label
                  htmlFor={option}
                  className="text-gray-700 dark:text-gray-300"
                >
                  {t(option)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Deadline */}
        <div className="col-span-1 md:col-span-2 flex flex-col items-center">
          <Label className="mb-2 text-gray-700 dark:text-gray-300 w-full">
            {t("deadline")}
          </Label>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={formData.deadline}
              onSelect={handleDateChange}
              disabled={(date) => date < minDeadline || isLoading}
              className="w-full max-w-sm rounded-xl border-2 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all duration-200"
              style={{ margin: "0 auto", display: "block" }}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="col-span-1 md:col-span-2">
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full flex justify-center items-center gap-3 font-semibold text-white rounded-xl py-3 text-lg",
              "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 transition-all duration-300",
              "disabled:opacity-70 disabled:scale-100"
            )}
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? t("submitting") : t("submitOrder")}
          </Button>
        </div>
      </form>
    </div>
  );
};
