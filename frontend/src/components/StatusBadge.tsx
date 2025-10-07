import {
  Send,
  Truck,
  Wrench,
  Gift,
  PackageCheck,
  Navigation,
  CheckCircle2,
  Clock,
} from "lucide-react";

type Status =
  | "requested"
  | "pickup"
  | "working"
  | "wrapping"
  | "ready"
  | "delivery"
  | "completed";

const statusConfig: Record<
  Status,
  {
    label: string;
    icon: React.ElementType;
    colors: {
      bg: string;
      bgHover: string;
      border: string;
      text: string;
      iconBg: string;
      glow: string;
    };
  }
> = {
  requested: {
    label: "Requested",
    icon: Send,
    colors: {
      bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30",
      bgHover:
        "group-hover:from-blue-200 group-hover:to-blue-300 dark:group-hover:from-blue-800/40 dark:group-hover:to-blue-700/40",
      border: "border-blue-300 dark:border-blue-700/50",
      text: "text-blue-700 dark:text-blue-300",
      iconBg: "from-blue-500 to-blue-600",
      glow: "group-hover:shadow-blue-500/50",
    },
  },
  pickup: {
    label: "Pickup Scheduled",
    icon: Truck,
    colors: {
      bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30",
      bgHover:
        "group-hover:from-cyan-200 group-hover:to-cyan-300 dark:group-hover:from-cyan-800/40 dark:group-hover:to-cyan-700/40",
      border: "border-cyan-300 dark:border-cyan-700/50",
      text: "text-cyan-700 dark:text-cyan-300",
      iconBg: "from-cyan-500 to-cyan-600",
      glow: "group-hover:shadow-cyan-500/50",
    },
  },
  working: {
    label: "Working",
    icon: Wrench,
    colors: {
      bg: "from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30",
      bgHover:
        "group-hover:from-amber-200 group-hover:to-yellow-200 dark:group-hover:from-amber-800/40 dark:group-hover:to-yellow-800/40",
      border: "border-amber-300 dark:border-amber-700/50",
      text: "text-amber-700 dark:text-amber-300",
      iconBg: "from-amber-500 to-yellow-500",
      glow: "group-hover:shadow-amber-500/50",
    },
  },
  wrapping: {
    label: "Wrapping",
    icon: Gift,
    colors: {
      bg: "from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30",
      bgHover:
        "group-hover:from-pink-200 group-hover:to-rose-200 dark:group-hover:from-pink-800/40 dark:group-hover:to-rose-800/40",
      border: "border-pink-300 dark:border-pink-700/50",
      text: "text-pink-700 dark:text-pink-300",
      iconBg: "from-pink-500 to-rose-500",
      glow: "group-hover:shadow-pink-500/50",
    },
  },
  ready: {
    label: "Ready for Pickup",
    icon: PackageCheck,
    colors: {
      bg: "from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30",
      bgHover:
        "group-hover:from-emerald-200 group-hover:to-green-200 dark:group-hover:from-emerald-800/40 dark:group-hover:to-green-800/40",
      border: "border-emerald-300 dark:border-emerald-700/50",
      text: "text-emerald-700 dark:text-emerald-300",
      iconBg: "from-emerald-500 to-green-500",
      glow: "group-hover:shadow-emerald-500/50",
    },
  },
  delivery: {
    label: "Out for Delivery",
    icon: Navigation,
    colors: {
      bg: "from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30",
      bgHover:
        "group-hover:from-violet-200 group-hover:to-purple-200 dark:group-hover:from-violet-800/40 dark:group-hover:to-purple-800/40",
      border: "border-violet-300 dark:border-violet-700/50",
      text: "text-violet-700 dark:text-violet-300",
      iconBg: "from-violet-500 to-purple-500",
      glow: "group-hover:shadow-violet-500/50",
    },
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    colors: {
      bg: "from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30",
      bgHover:
        "group-hover:from-green-200 group-hover:to-emerald-200 dark:group-hover:from-green-800/40 dark:group-hover:to-emerald-800/40",
      border: "border-green-300 dark:border-green-700/50",
      text: "text-green-700 dark:text-green-300",
      iconBg: "from-green-500 to-emerald-500",
      glow: "group-hover:shadow-green-500/50",
    },
  },
};

export const StatusBadge = ({ status }: { status: Status }) => {
  const config = statusConfig[status] || statusConfig.requested;
  const Icon = config.icon;

  return (
    <div className="group inline-flex items-center gap-2 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-sm" />

      <div
        className={`
          relative inline-flex items-center gap-2.5 px-4 py-2
          bg-gradient-to-br ${config.colors.bg} ${config.colors.bgHover}
          border-2 ${config.colors.border}
          rounded-full shadow-md hover:shadow-lg ${config.colors.glow}
          transition-all duration-300
          hover:scale-105 active:scale-95
          overflow-hidden
        `}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

        <div className="relative">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${config.colors.iconBg} rounded-lg blur-md opacity-40 group-hover:opacity-60 transition-opacity`}
          />
          <div
            className={`relative p-1.5 bg-gradient-to-br ${config.colors.iconBg} rounded-lg shadow-sm`}
          >
            <Icon size={14} className="text-white" />
          </div>
        </div>

        <span
          className={`relative font-bold text-sm ${config.colors.text} whitespace-nowrap`}
        >
          {config.label}
        </span>

        <div className="relative">
          <Clock size={12} className={`${config.colors.text} animate-pulse`} />
        </div>
      </div>
    </div>
  );
};
