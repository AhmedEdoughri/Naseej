import { Package, Truck, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EnhancedMetricCard } from "@/components/EnhancedMetricCard";

// You can create a more robust RouteTaskCard component if needed
const RouteTaskCard = ({ task }: { task: any }) => (
  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-amber-50 dark:from-gray-800/50 dark:to-gray-800/20 border-l-4 border-amber-400 rounded-xl shadow-sm">
    <div className="flex items-center space-x-4">
      {task.status === "completed" ? (
        <CheckCircle className="text-green-500" size={20} />
      ) : (
        <Package className="text-amber-600" size={20} />
      )}
      <div>
        <p className="font-semibold">{task.store}</p>
        <p className="text-sm text-gray-600">{task.address}</p>
        <p className="text-sm text-gray-600 flex items-center">
          <Clock size={14} className="mr-2" /> {task.time}
        </p>
      </div>
    </div>
    <Button
      variant={task.status === "completed" ? "secondary" : "default"}
      size="sm"
    >
      {task.status === "completed" ? "✓ Completed" : "Update"}
    </Button>
  </div>
);

export const DriverDashboard = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <EnhancedMetricCard
        title="Today's Pickups"
        value={3}
        icon={Package}
        color="info"
        delay={0}
      />
      <EnhancedMetricCard
        title="Today's Deliveries"
        value={5}
        icon={Truck}
        color="success"
        delay={200}
      />
    </div>

    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-800">
      <h3 className="font-bold text-xl mb-6 text-gray-800 dark:text-gray-200">
        Today's Route
      </h3>
      <div className="space-y-4">
        {[
          {
            type: "pickup",
            store: "Al-Noor Store",
            address: "123 Tripoli Street",
            time: "9:00 AM",
            status: "completed" as const,
          },
          {
            type: "delivery",
            store: "Fatima Wedding Hall",
            address: "456 Benghazi Road",
            time: "2:00 PM",
            status: "delivery" as const,
          },
          {
            type: "pickup",
            store: "Zahra Boutique",
            address: "789 Misrata Ave",
            time: "4:00 PM",
            status: "requested" as const,
          },
        ].map((task, index) => (
          <RouteTaskCard key={index} task={task} />
        ))}
      </div>
    </div>
  </div>
);
