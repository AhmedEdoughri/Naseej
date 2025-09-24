import { Package, AlertCircle, Truck, BarChart3 } from "lucide-react";
import { EnhancedMetricCard } from "@/components/EnhancedMetricCard";
import { ReportsTab } from "@/components/ReportsTab";
import { StatusBadge } from "@/components/StatusBadge";

export const ManagerDashboard = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <EnhancedMetricCard
        title="Total Active"
        value={23}
        icon={Package}
        color="info"
        delay={0}
      />
      <EnhancedMetricCard
        title="Pending Pickup"
        value={7}
        icon={AlertCircle}
        color="warning"
        delay={100}
      />
      <EnhancedMetricCard
        title="Ready for Delivery"
        value={8}
        icon={Truck}
        color="primary"
        delay={200}
      />
      <EnhancedMetricCard
        title="Daily Completions"
        value={15}
        icon={BarChart3}
        color="success"
        trend={{ value: 8, isPositive: true }}
        delay={300}
      />
    </div>

    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-800">
      <ReportsTab />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-800">
        <h3 className="font-bold text-xl mb-6 text-gray-800 dark:text-gray-200">
          Store Performance
        </h3>
        <div className="space-y-4">
          {[
            { store: "Al-Noor Store", requests: 12, completion: "95%" },
            { store: "Zahra Boutique", requests: 8, completion: "89%" },
            { store: "Fatima Collections", requests: 15, completion: "92%" },
          ].map((store, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20 rounded-xl border border-amber-200 dark:border-gray-700"
            >
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {store.store}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {store.requests} requests this month
                </p>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {store.completion}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-800">
        <h3 className="font-bold text-xl mb-6 text-gray-800 dark:text-gray-200">
          Driver Status
        </h3>
        <div className="space-y-4">
          {[
            { driver: "Ahmed Al-Rashid", status: "On Route", tasks: 3 },
            { driver: "Omar Hassan", status: "Available", tasks: 0 },
            { driver: "Yusuf Mohammed", status: "On Route", tasks: 2 },
          ].map((driver, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50"
            >
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {driver.driver}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {driver.tasks} active tasks
                </p>
              </div>
              <StatusBadge
                status={driver.status === "Available" ? "ready" : "delivery"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
