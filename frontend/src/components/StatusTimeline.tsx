import {
  Package,
  Send,
  Truck,
  Wrench,
  Gift,
  PackageCheck,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type Status =
  | "requested"
  | "pickup"
  | "working"
  | "wrapping"
  | "ready"
  | "delivery"
  | "completed";

export const StatusTimeline = ({
  currentStatus,
  itemId,
  orderNumber,
}: {
  currentStatus: Status;
  itemId: string;
  orderNumber: number;
}) => {
  const { t } = useTranslation();

  const steps: { status: Status; icon: React.ElementType; label: string }[] = [
    { status: "requested", icon: Send, label: t("status_requested") },
    { status: "pickup", icon: Truck, label: t("status_pickup") },
    { status: "working", icon: Wrench, label: t("status_working") },
    { status: "wrapping", icon: Gift, label: t("status_wrapping") },
    { status: "ready", icon: PackageCheck, label: t("status_ready") },
    { status: "delivery", icon: Navigation, label: t("status_delivery") },
    { status: "completed", icon: CheckCircle2, label: t("status_completed") },
  ];

  const currentStepIndex = steps.findIndex(
    (step) => step.status === currentStatus
  );

  return (
    <div className="group bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/20 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-amber-200/60 dark:border-gray-800 hover:shadow-2xl hover:border-amber-300 dark:hover:border-amber-700/50 transition-all duration-500 h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/0 via-yellow-100/20 to-amber-100/0 dark:from-amber-600/0 dark:via-amber-500/5 dark:to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center mb-8 pb-6 border-b-2 border-amber-200/50 dark:border-gray-800">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl blur-lg opacity-50 animate-pulse" />
            <div className="relative p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg">
              <Package className="text-white" size={28} />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="font-bold text-2xl bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400">
              {t("orderStatus")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium break-all mt-1">
              Order{" "}
              <span className="text-amber-600 dark:text-amber-400">#ORD-</span>
              {orderNumber}
            </p>
          </div>
        </div>

        <div className="relative pl-2">
          <div className="absolute top-4 bottom-4 left-[27px] w-1 bg-gradient-to-b from-amber-200 via-yellow-200 to-amber-200 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700 rounded-full shadow-sm" />

          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div
                key={step.status}
                className={cn(
                  "flex items-start mb-10 last:mb-0 relative transition-all duration-500",
                  isCurrent && "scale-105"
                )}
                style={{
                  animation: isCurrent ? "none" : undefined,
                }}
              >
                <div className="relative">
                  {isCurrent && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full blur-xl opacity-60 animate-pulse" />
                      <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-40 animate-ping" />
                    </>
                  )}

                  {isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full blur-md opacity-30" />
                  )}

                  <div
                    className={cn(
                      "relative flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-lg",
                      isCompleted
                        ? "bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-300 dark:border-amber-600 text-white transform hover:scale-110"
                        : isCurrent
                        ? "bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 border-white dark:border-gray-900 text-white shadow-xl"
                        : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-750"
                    )}
                  >
                    <step.icon
                      size={26}
                      className={cn(
                        "transition-transform duration-300",
                        isCurrent && "animate-pulse"
                      )}
                    />

                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-md">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-6 pt-3 flex-1">
                  <div
                    className={cn(
                      "inline-block px-4 py-2 rounded-lg transition-all duration-500",
                      isCompleted
                        ? "bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30"
                        : isCurrent
                        ? "bg-gradient-to-r from-amber-200 to-yellow-200 dark:from-amber-800/50 dark:to-yellow-800/50 shadow-md"
                        : "bg-gray-50 dark:bg-gray-800/50"
                    )}
                  >
                    <p
                      className={cn(
                        "font-bold text-lg transition-colors duration-500",
                        isCompleted
                          ? "text-amber-800 dark:text-amber-300"
                          : isCurrent
                          ? "text-amber-900 dark:text-amber-200"
                          : "text-gray-400 dark:text-gray-500"
                      )}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1 animate-pulse">
                        {"In Progress ..."}
                      </p>
                    )}
                    {isCompleted && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                        {"Completed"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
