import { useState } from "react";
import { Package, AlertCircle, BarChart3 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { EnhancedMetricCard } from "@/components/EnhancedMetricCard";

const AnimatedRequestCard = ({
  request,
  delay = 0,
}: {
  request: any;
  delay?: number;
}) => {
  return (
    <div
      className={`
        flex items-center justify-between p-4 
        bg-gradient-to-r from-white to-amber-50 dark:from-gray-800/50 dark:to-gray-800/20
        rounded-xl border border-amber-200 dark:border-gray-700
        transition-transform duration-300 hover:scale-102 hover:shadow-lg
      `}
      style={{ transitionDelay: `${delay}ms` }}
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
  const [selectedItem, setSelectedItem] = useState<string | null>("HWL001");

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-800">
          <h3 className="font-bold text-xl mb-6 text-gray-800 dark:text-gray-200">
            Recent Requests
          </h3>
          <div className="space-y-4">
            {[
              { id: "HWL001", items: 3, status: "working" as const },
              { id: "HWL002", items: 2, status: "ready" as const },
              { id: "HWL003", items: 5, status: "delivery" as const },
            ].map((request, index) => (
              <AnimatedRequestCard
                key={request.id}
                request={request}
                delay={index * 150}
              />
            ))}
          </div>
        </div>

        {selectedItem && (
          <div className="transform transition-all duration-700 ease-out opacity-100 translate-x-0">
            <StatusTimeline currentStatus="working" itemId={selectedItem} />
          </div>
        )}
      </div>
    </div>
  );
};
