import {
  Package,
  Send,
  Truck,
  Wrench,
  Gift,
  PackageCheck,
  Navigation,
  CheckCircle2,
  FileClock,
  ThumbsUp,
  XCircle,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

type Status =
  | "Order Placed"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Awaiting Drop-off"
  | "Driver Dispatched"
  | "In Process"
  | "Preparing Order"
  | "Ready for Pickup"
  | "Out for Delivery"
  | "Order Fulfilled";

type Step = {
  status: Status;
  icon: React.ElementType;
  label: string;
  outcomes?: Step[];
};

export const StatusTimeline = ({
  currentStatus,
  itemId,
  orderNumber,
  inbound_option,
  outbound_option,
}: {
  currentStatus: Status;
  itemId: string;
  orderNumber: number;
  inbound_option: "customer_dropoff" | "business_pickup";
  outbound_option: "customer_pickup" | "business_delivery";
}) => {
  const { t } = useTranslation();

  const steps = useMemo(() => {
    const dynamicSteps: Step[] = [
      {
        status: "Order Placed", // Updated
        icon: Send,
        label: t("status_order_placed", "Order Placed"),
      },
      {
        status: "Pending Approval",
        icon: FileClock,
        label: t("status_pending_approval", "Pending Approval"),
        outcomes: [
          {
            status: "Approved",
            icon: ThumbsUp,
            label: t("status_approved", "Approved"),
          },
          {
            status: "Rejected",
            icon: XCircle,
            label: t("status_rejected", "Rejected"),
          },
        ],
      },
    ];

    if (inbound_option === "customer_dropoff") {
      dynamicSteps.push({
        status: "Awaiting Drop-off",
        icon: LogIn,
        label: t("status_awaiting_dropoff", "Awaiting Drop-off"),
      });
    } else {
      dynamicSteps.push({
        status: "Driver Dispatched", // Updated
        icon: Truck,
        label: t("status_pickup_dispatched", "Driver Dispatched for Pickup"),
      });
    }

    dynamicSteps.push(
      {
        status: "In Process", // Updated
        icon: Wrench,
        label: t("status_in_process", "In Process"),
      },
      {
        status: "Preparing Order", // Updated
        icon: Gift,
        label: t("status_preparing_order", "Preparing Order"),
      },
      {
        status: "Ready for Pickup", // Updated
        icon: PackageCheck,
        label:
          outbound_option === "customer_pickup"
            ? t("status_ready_for_pickup", "Ready for Pickup")
            : t("status_ready_for_delivery", "Ready for Delivery"),
      }
    );

    if (outbound_option === "business_delivery") {
      dynamicSteps.push({
        status: "Out for Delivery", // Updated
        icon: Navigation,
        label: t("status_out_for_delivery", "Out for Delivery"),
      });
    }

    dynamicSteps.push({
      status: "Order Fulfilled", // Updated
      icon: CheckCircle2,
      label: t("status_order_fulfilled", "Order Fulfilled"),
    });

    return dynamicSteps;
  }, [t, inbound_option, outbound_option]);

  const flattenedSteps = steps.flatMap((step) =>
    step.outcomes ? [step, ...step.outcomes] : [step]
  );
  const currentFlatIndex = flattenedSteps.findIndex(
    (step) => step.status === currentStatus
  );
  const isRejected = currentStatus === "Rejected";
  const approvalStepIndex = steps.findIndex(
    (s) => s.status === "Pending Approval"
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
          <div
            className={cn(
              "absolute top-4 left-[27px] w-1 bg-gradient-to-b from-amber-200 via-yellow-200 to-amber-200 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700 rounded-full shadow-sm",
              isRejected ? "h-[220px]" : "bottom-4"
            )}
          />

          <div className="relative pl-2 flex flex-col gap-y-5">
            {steps.map((step, index) => {
              if (isRejected && index > approvalStepIndex) return null;

              const stepFlatIndex = flattenedSteps.findIndex(
                (s) => s.status === step.status
              );
              const isStepCurrent = step.status === currentStatus;
              const isStepCompleted = isRejected
                ? index <= approvalStepIndex
                : currentFlatIndex > stepFlatIndex;

              return (
                <div key={step.status}>
                  <div
                    className={cn(
                      "flex items-start mb-3 last:mb-0 relative transition-all duration-500",
                      isStepCurrent && "scale-105"
                    )}
                  >
                    <div className="relative">
                      {isStepCurrent && !isRejected && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full blur-xl opacity-60 animate-pulse" />
                          <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-40 animate-ping" />
                        </>
                      )}
                      <div
                        className={cn(
                          "relative flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-lg",
                          isStepCompleted
                            ? "bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-300 dark:border-amber-600 text-white"
                            : isStepCurrent
                            ? "bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 border-white dark:border-gray-900 text-white shadow-xl"
                            : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                        )}
                      >
                        <step.icon size={26} />
                        {isStepCompleted && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-md">
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-6 pt-3 flex-1">
                      <div
                        className={cn(
                          "inline-block px-4 py-2 rounded-lg",
                          isStepCompleted
                            ? "bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30"
                            : isStepCurrent
                            ? "bg-gradient-to-r from-amber-200 to-yellow-200 dark:from-amber-800/50 dark:to-yellow-800/50 shadow-md"
                            : "bg-gray-50 dark:bg-gray-800/50"
                        )}
                      >
                        <p
                          className={cn(
                            "font-bold text-lg",
                            isStepCompleted
                              ? "text-amber-800 dark:text-amber-300"
                              : isStepCurrent
                              ? "text-amber-900 dark:text-amber-200"
                              : "text-gray-400 dark:text-gray-500"
                          )}
                        >
                          {step.label}
                        </p>
                        {isStepCurrent && (
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1 animate-pulse">
                            In Progress...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {step.status === "Pending Approval" &&
                    currentFlatIndex >=
                      flattenedSteps.findIndex(
                        (s) => s.status === "Pending Approval"
                      ) && (
                      <div className="relative ml-7 pl-7 pt-4 mb-3 border-l-2 border-dashed border-amber-400 dark:border-gray-600">
                        {step.outcomes?.map((outcome) => {
                          const isOutcomeCurrent =
                            currentStatus === outcome.status;
                          const wasApproved =
                            !isRejected &&
                            currentFlatIndex >
                              flattenedSteps.findIndex(
                                (s) => s.status === "Approved"
                              );
                          const isSelectedPath =
                            (outcome.status === "Approved" &&
                              (isOutcomeCurrent || wasApproved)) ||
                            (isRejected && outcome.status === "Rejected");
                          const color =
                            outcome.status === "Approved" ? "green" : "red";

                          return (
                            <div
                              key={outcome.status}
                              className="flex items-start mb-3 last:mb-0 relative"
                            >
                              {isOutcomeCurrent && (
                                <>
                                  <div
                                    className={`absolute -left-8 -top-2 w-10 h-10 bg-gradient-to-br from-${color}-400 to-${color}-500 rounded-full blur-xl opacity-60 animate-pulse`}
                                  />
                                  <div
                                    className={`absolute -left-8 -top-2 w-10 h-10 bg-${color}-400 rounded-full blur-md opacity-40 animate-ping`}
                                  />
                                </>
                              )}
                              <div
                                className={cn(
                                  "relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm",
                                  isSelectedPath
                                    ? `bg-${color}-500 border-${color}-200 text-white`
                                    : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                                )}
                              >
                                <outcome.icon size={20} />
                              </div>
                              <div className="ml-4 pt-1.5">
                                <p
                                  className={cn(
                                    "font-semibold text-md",
                                    isSelectedPath
                                      ? `text-${color}-700 dark:text-${color}-300`
                                      : "text-gray-400 dark:text-gray-500"
                                  )}
                                >
                                  {outcome.label}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
