import React, { useState } from "react";
import {
  Package,
  Calendar as CalendarIcon,
  FileText,
  Truck,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useTranslation } from "react-i18next";

interface OrderFormData {
  quantity: number | string;
  notes?: string;
  inboundOption: "customer_dropoff" | "business_pickup";
  outboundOption: "customer_pickup" | "business_delivery";
  deadline: string;
}

interface NewOrderFormProps {
  onSuccess?: () => void;
}

export const NewOrderForm = ({ onSuccess }: NewOrderFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    quantity: "",
    notes: "",
    inboundOption: "customer_dropoff",
    outboundOption: "customer_pickup",
    deadline: "",
  });
  const { t } = useTranslation();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateString = minDate.toISOString().split("T")[0];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const processedValue =
      name === "quantity" && value !== ""
        ? Math.max(1, parseInt(value, 10) || 1)
        : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

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
        deadline: new Date(formData.deadline).toISOString(),
        inbound_option: formData.inboundOption,
        outbound_option: formData.outboundOption,
      });

      toast.success(t("success_orderPlaced"));
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          quantity: "",
          notes: "",
          inboundOption: "customer_dropoff",
          outboundOption: "customer_pickup",
          deadline: "",
        });
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error(t("error_orderFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {isSuccess ? (
        <div className="text-center py-8 animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mb-4 animate-bounce-in shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Order Submitted!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your order has been successfully placed
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group">
              <label
                htmlFor="quantity"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                <Package className="w-4 h-4 text-amber-500" />
                Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                disabled={isLoading}
                min={1}
                required
                placeholder="Enter quantity"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 outline-none disabled:opacity-50 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="group">
              <label
                htmlFor="deadline"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                <CalendarIcon className="w-4 h-4 text-amber-500" />
                Deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleInputChange}
                disabled={isLoading}
                min={minDateString}
                required
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 outline-none disabled:opacity-50 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="group">
            <label
              htmlFor="notes"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              Notes{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Add any special instructions or notes..."
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 outline-none disabled:opacity-50 resize-none text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl p-4 border border-amber-100 dark:border-amber-900">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Inbound Logistics
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "customer_dropoff",
                    label: "Drop-off",
                    icon: MapPin,
                  },
                  { value: "business_pickup", label: "Pick-up", icon: Truck },
                ].map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`relative flex items-center gap-2 p-3 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                      formData.inboundOption === value
                        ? "bg-amber-500 border-amber-500 shadow-md scale-[1.02]"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="inboundOption"
                      value={value}
                      checked={formData.inboundOption === value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          inboundOption: e.target.value as any,
                        }))
                      }
                      disabled={isLoading}
                      className="sr-only"
                    />
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        formData.inboundOption === value
                          ? "text-white"
                          : "text-amber-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        formData.inboundOption === value
                          ? "text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 rounded-xl p-4 border border-yellow-100 dark:border-yellow-900">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                <Truck className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                Outbound Logistics
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "customer_pickup", label: "Pick-up", icon: MapPin },
                  {
                    value: "business_delivery",
                    label: "Delivery",
                    icon: Truck,
                  },
                ].map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`relative flex items-center gap-2 p-3 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                      formData.outboundOption === value
                        ? "bg-yellow-500 border-yellow-500 shadow-md scale-[1.02]"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="outboundOption"
                      value={value}
                      checked={formData.outboundOption === value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          outboundOption: e.target.value as any,
                        }))
                      }
                      disabled={isLoading}
                      className="sr-only"
                    />
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        formData.outboundOption === value
                          ? "text-white"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        formData.outboundOption === value
                          ? "text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Submit Order
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
