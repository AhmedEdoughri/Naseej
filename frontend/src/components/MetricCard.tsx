import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "info";
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
}: MetricCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    success: "text-status-completed bg-status-completed/10",
    warning: "text-status-delivery bg-status-delivery/10",
    info: "text-status-pickup bg-status-pickup/10",
  };

  return (
    <div className="business-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend.isPositive ? "text-status-completed" : "text-destructive"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
