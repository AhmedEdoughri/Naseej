import {
  Send,
  Hourglass,
  CheckCircle2,
  XCircle,
  Truck,
  Wrench,
  Gift,
  PackageCheck,
  Navigation,
  Clock,
  LogIn,
  ArchiveX,
} from "lucide-react";

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
  | "Order Fulfilled"
  | "Cancelled";

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
  "Order Placed": {
    label: "Order Placed",
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
  "Pending Approval": {
    label: "Pending Approval",
    icon: Hourglass,
    colors: {
      bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30",
      bgHover:
        "group-hover:from-yellow-200 group-hover:to-yellow-300 dark:group-hover:from-yellow-800/40 dark:group-hover:to-yellow-700/40",
      border: "border-yellow-300 dark:border-yellow-700/50",
      text: "text-yellow-700 dark:text-yellow-300",
      iconBg: "from-yellow-500 to-yellow-600",
      glow: "group-hover:shadow-yellow-500/50",
    },
  },
  Approved: {
    label: "Approved",
    icon: CheckCircle2,
    colors: {
      bg: "from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30",
      bgHover:
        "group-hover:from-sky-200 group-hover:to-sky-300 dark:group-hover:from-sky-800/40 dark:group-hover:to-sky-700/40",
      border: "border-sky-300 dark:border-sky-700/50",
      text: "text-sky-700 dark:text-sky-300",
      iconBg: "from-sky-500 to-sky-600",
      glow: "group-hover:shadow-sky-500/50",
    },
  },
  Rejected: {
    label: "Rejected",
    icon: XCircle, // Corrected Icon
    colors: {
      bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30",
      bgHover:
        "group-hover:from-red-200 group-hover:to-red-300 dark:group-hover:from-red-800/40 dark:group-hover:to-red-700/40",
      border: "border-red-300 dark:border-red-700/50",
      text: "text-red-700 dark:text-red-300",
      iconBg: "from-red-500 to-red-600",
      glow: "group-hover:shadow-red-500/50",
    },
  },
  "Awaiting Drop-off": {
    label: "Awaiting Drop-off",
    icon: LogIn,
    colors: {
      bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30",
      bgHover:
        "group-hover:from-orange-200 group-hover:to-orange-300 dark:group-hover:from-orange-800/40 dark:group-hover:to-orange-700/40",
      border: "border-orange-300 dark:border-orange-700/50",
      text: "text-orange-700 dark:text-orange-300",
      iconBg: "from-orange-500 to-orange-600",
      glow: "group-hover:shadow-orange-500/50",
    },
  },
  "Driver Dispatched": {
    label: "Driver Dispatched",
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
  "In Process": {
    label: "In Process",
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
  "Preparing Order": {
    label: "Preparing Order",
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
  "Ready for Pickup": {
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
  "Out for Delivery": {
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
  "Order Fulfilled": {
    label: "Order Fulfilled",
    icon: CheckCircle2,
    colors: {
      bg: "from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-600/50",
      bgHover:
        "group-hover:from-gray-200 group-hover:to-gray-300 dark:group-hover:from-gray-600/50 dark:group-hover:to-gray-500/50",
      border: "border-gray-300 dark:border-gray-600/50",
      text: "text-gray-700 dark:text-gray-300",
      iconBg: "from-gray-500 to-gray-600",
      glow: "group-hover:shadow-gray-500/50",
    },
  },
  Cancelled: {
    label: "Cancelled",
    icon: ArchiveX,
    colors: {
      bg: "from-slate-100 to-slate-200 dark:from-slate-800/50 dark:to-slate-700/50",
      bgHover:
        "group-hover:from-slate-200 group-hover:to-slate-300 dark:group-hover:from-slate-700/50 dark:group-hover:to-slate-600/50",
      border: "border-slate-300 dark:border-slate-600/50",
      text: "text-slate-600 dark:text-slate-400",
      iconBg: "from-slate-500 to-slate-600",
      glow: "group-hover:shadow-slate-500/50",
    },
  },
};

export type { Status };

export const StatusBadge = ({ status }: { status: Status }) => {
  const config = statusConfig[status] || statusConfig["Order Placed"];
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
