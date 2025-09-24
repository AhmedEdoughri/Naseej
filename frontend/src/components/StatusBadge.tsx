interface StatusBadgeProps {
  status:
    | "requested"
    | "pickup"
    | "working"
    | "wrapping"
    | "ready"
    | "delivery"
    | "completed";
  size?: "sm" | "md";
}

const statusLabels = {
  requested: "Requested",
  pickup: "Picking Up",
  working: "Working",
  wrapping: "Wrapping",
  ready: "Ready for Delivery",
  delivery: "On the Way",
  completed: "Delivered",
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const sizeClasses = size === "md" ? "px-3 py-2 text-sm" : "px-2 py-1 text-xs";

  return (
    <span
      className={`status-badge status-${status} ${sizeClasses} font-medium`}
    >
      {statusLabels[status]}
    </span>
  );
}
