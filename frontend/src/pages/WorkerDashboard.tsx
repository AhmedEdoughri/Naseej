import { useState, useEffect } from "react";
import { Package, BarChart3 } from "lucide-react";
import { EnhancedMetricCard } from "@/components/EnhancedMetricCard";

const EnhancedKanbanColumn = ({
  column,
  delay = 0,
}: {
  column: any;
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const statusColors = {
    working:
      "from-yellow-100 to-amber-100 border-yellow-300 dark:from-yellow-900/30 dark:to-amber-900/20 dark:border-yellow-800",
    wrapping:
      "from-blue-100 to-indigo-100 border-blue-300 dark:from-blue-900/30 dark:to-indigo-900/20 dark:border-blue-800",
    ready:
      "from-green-100 to-emerald-100 border-green-300 dark:from-green-900/30 dark:to-emerald-900/20 dark:border-green-800",
  };

  return (
    <div
      className={`
        bg-gradient-to-b ${statusColors[column.status]} 
        rounded-xl p-6 border-2
        transform transition-all duration-700 ease-out
        hover:scale-105 hover:shadow-xl
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">
          {column.title}
        </h4>
        <span className="px-3 py-1 bg-white/80 dark:bg-gray-900/50 backdrop-blur rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
          {column.items.length}
        </span>
      </div>

      <div className="space-y-3">
        {column.items.map((item: string, index: number) => (
          <div
            key={item}
            className="bg-white/90 dark:bg-gray-800/70 backdrop-blur p-4 rounded-lg border border-white/50 dark:border-gray-700/50 shadow-sm"
          >
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              Item #{item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WorkerDashboard = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <EnhancedMetricCard
        title="Working"
        value={8}
        icon={Package}
        color="warning"
        delay={0}
      />
      <EnhancedMetricCard
        title="Wrapping"
        value={3}
        icon={Package}
        color="info"
        delay={100}
      />
      <EnhancedMetricCard
        title="Ready"
        value={5}
        icon={Package}
        color="success"
        delay={200}
      />
      <EnhancedMetricCard
        title="Completed Today"
        value={12}
        icon={BarChart3}
        color="primary"
        delay={300}
      />
    </div>

    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-800">
      <h3 className="font-bold text-xl mb-6 text-gray-800 dark:text-gray-200">
        Kanban Board
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Working",
            status: "working" as const,
            items: ["HWL001", "HWL004", "HWL007"],
          },
          {
            title: "Wrapping",
            status: "wrapping" as const,
            items: ["HWL002", "HWL008"],
          },
          {
            title: "Ready",
            status: "ready" as const,
            items: ["HWL003", "HWL005", "HWL009"],
          },
        ].map((column, index) => (
          <EnhancedKanbanColumn
            key={column.title}
            column={column}
            delay={index * 200}
          />
        ))}
      </div>
    </div>
  </div>
);
