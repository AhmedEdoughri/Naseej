// frontend/src/components/dashboards/CustomerDashboard.tsx

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Package, AlertCircle, BarChart3, PlusCircle } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Custom Components
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { EnhancedMetricCard } from "@/components/EnhancedMetricCard";
import { NewOrderForm } from "../NewOrderForm";

const AnimatedRequestCard = ({
  request,
  onClick,
  isSelected,
  delay = 0,
}: {
  request: any;
  onClick: () => void;
  isSelected: boolean;
  delay?: number;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        `
        flex items-center justify-between p-4 cursor-pointer
        bg-gradient-to-r from-white to-amber-50 dark:from-gray-800/50 dark:to-gray-800/20
        rounded-xl border
        transition-all duration-300 hover:scale-102 hover:shadow-lg`,
        isSelected
          ? "border-amber-500 shadow-md"
          : "border-amber-200 dark:border-gray-700"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
          <Package className="text-white" size={20} />
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            Request #{request.id}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {request.items} items
          </p>
        </div>
      </div>
      <StatusBadge status={request.status} />
    </div>
  );
};

export const CustomerDashboard = () => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<string | null>("HWL001");
  const [isFormOpen, setIsFormOpen] = useState(false); // State to control dialog

  const recentRequests = [
    { id: "HWL001", items: 3, status: "working" as const },
    { id: "HWL002", items: 2, status: "ready" as const },
    { id: "HWL003", items: 5, status: "delivery" as const },
  ];

  const selectedRequest = recentRequests.find((req) => req.id === selectedItem);

  return (
    <div className="space-y-8">
      {/* ====== Page Header ====== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t("customerDashboard")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboardSubtitle_customer")}
          </p>
        </div>

        {/* ====== Place New Order Button & Dialog ====== */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className={cn(
                "gap-2 w-full sm:w-auto font-semibold text-white transition-all duration-300",
                "bg-gradient-to-r from-amber-500 to-yellow-500",
                "hover:from-amber-600 hover:to-yellow-600 hover:scale-105"
              )}
            >
              <PlusCircle size={20} />
              {t("placeNewOrder")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-amber-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-gray-200">
                {t("placeNewOrder")}
              </DialogTitle>
            </DialogHeader>
            <NewOrderForm onSuccess={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* ====== Metric Cards ====== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnhancedMetricCard
          title="Active Requests"
          value={5}
          icon={Package}
          color="info"
          delay={0}
        />
        <EnhancedMetricCard
          title="Items in Process"
          value={12}
          icon={AlertCircle}
          color="warning"
          delay={200}
        />
        <EnhancedMetricCard
          title="Completed This Month"
          value={48}
          icon={BarChart3}
          color="success"
          trend={{ value: 12, isPositive: true }}
          delay={400}
        />
      </div>

      {/* ====== Main Content Grid ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-800">
          <h3 className="font-bold text-xl mb-6 text-gray-800 dark:text-gray-200">
            {t("recentRequests")}
          </h3>
          <div className="space-y-4">
            {recentRequests.map((request, index) => (
              <AnimatedRequestCard
                key={request.id}
                request={request}
                onClick={() => setSelectedItem(request.id)}
                isSelected={selectedItem === request.id}
                delay={index * 150}
              />
            ))}
          </div>
        </div>

        {selectedItem && selectedRequest && (
          <div className="transform transition-all duration-700 ease-out">
            <StatusTimeline
              currentStatus={selectedRequest.status}
              itemId={selectedItem}
            />
          </div>
        )}
      </div>
    </div>
  );
};
