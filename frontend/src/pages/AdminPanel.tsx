import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import {
  UserPlus,
  Trash2,
  LogOut,
  Building,
  Pencil,
  Users,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Workflow,
  Save,
  X,
  ArrowUpDown,
  Settings,
  Shield,
  TrendingUp,
  Clock,
  Sparkles,
  Crown,
  LayoutGrid,
  List,
} from "lucide-react";
import { StoreForm } from "../components/StoreForm";
import { UserForm } from "../components/UserForm";
import { StatusForm } from "../components/StatusForm";
import { DraggableStatusRow } from "../components/DraggableStatusRow";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from "../components/LanguageToggle";
import { SettingsTab } from "../components/SettingsTab";
import { InfoCard } from "../components/InfoCard";
import { EmptyState } from "@/components/EmptyState";

// --- Type Definitions ---
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  roleName: string;
  role_id: number;
  status: string;
  user_id: number;
}
interface Role {
  id: number;
  name: string;
}
interface Store {
  store_id: string;
  storeName: string;
  address: string;
  city: string;
  storeNotes: string;
  userId: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  user_id: number;
}
interface StoreFormData {
  id: string;
  name: string;
  phone: string;
  storeName: string;
  address: string;
  city: string;
  notes: string;
}
interface Status {
  id: number;
  name: string;
  description: string;
  color: string;
  display_order: number;
}

type SortKey = keyof User;

// Animated Counter Component
const AnimatedCounter = ({
  value,
  duration = 1000,
}: {
  value: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(value * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{count}</span>;
};

// Enhanced Metric Card Component
const EnhancedMetricCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  delay = 0,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  trend?: { value: number; isPositive: boolean };
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses = {
    primary:
      "bg-gradient-to-br from-amber-100 to-yellow-200 border-amber-300 hover:from-amber-200 hover:to-yellow-300 dark:from-gray-800 dark:to-gray-800 dark:border-amber-900 dark:hover:border-amber-700",
    secondary:
      "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150 dark:from-gray-800 dark:to-gray-800 dark:border-blue-900 dark:hover:border-blue-700",
    success:
      "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:from-green-100 hover:to-emerald-150 dark:from-gray-800 dark:to-gray-800 dark:border-green-900 dark:hover:border-green-700",
  };

  const iconColors = {
    primary: "text-amber-700 dark:text-amber-400",
    secondary: "text-blue-600 dark:text-blue-400",
    success: "text-green-600 dark:text-green-400",
  };

  return (
    <div
      className={`
        ${colorClasses[color]} 
        p-6 rounded-xl border-2 cursor-pointer
        transform transition-all duration-500 ease-out
        hover:scale-105 hover:shadow-2xl hover:-translate-y-1
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        group relative overflow-hidden dark:hover:shadow-amber-500/10
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out dark:via-white/10" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`${iconColors[color]} transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
          >
            <Icon size={24} />
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm ${
                trend.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              <TrendingUp
                size={16}
                className={`mr-1 ${
                  !trend.isPositive ? "rotate-180" : ""
                } transition-transform duration-300`}
              />
              {trend.value}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300 dark:text-gray-400 dark:group-hover:text-gray-300">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-amber-800 transition-colors duration-300 dark:text-gray-100 dark:group-hover:text-amber-400">
            <AnimatedCounter value={value} />
          </p>
        </div>
      </div>
    </div>
  );
};

// Animated Table Row Component
const AnimatedTableRow = ({
  children,
  delay = 0,
  isPending = false,
}: {
  children: React.ReactNode;
  delay?: number;
  isPending?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <TableRow
      className={`
        transform transition-all duration-500 ease-out
        hover:from-amber-50 hover:to-yellow-50 dark:hover:bg-gray-800/50
        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
        ${
          isPending
            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-600"
            : "dark:border-gray-800"
        }
        group cursor-pointer
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </TableRow>
  );
};

// Enhanced Action Button Component
const AnimatedActionButton = ({
  children,
  variant = "ghost",
  size = "icon",
  onClick,
  title,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "ghost" | "outline" | "default";
  size?: "icon" | "sm" | "default";
  onClick?: () => void;
  title?: string;
  className?: string;
}) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    title={title}
    className={`
      transform transition-all duration-300 hover:scale-110 hover:shadow-lg
      hover:bg-amber-100 hover:border-amber-300 dark:hover:bg-gray-800 dark:hover:border-amber-700
      ${className}
    `}
  >
    {children}
  </Button>
);

// --- Main Component ---
const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [originalStatuses, setOriginalStatuses] = useState<Status[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { t, i18n } = useTranslation();
  const [userView, setUserView] = useState<"card" | "table">("card");
  const [customerView, setCustomerView] = useState<"card" | "table">("card");
  const [userStatusFilter, setUserStatusFilter] = useState<
    "all" | "active" | "Deactivated"
  >("all");
  const [customerStatusFilter, setCustomerStatusFilter] = useState<
    "all" | "active" | "Deactivated"
  >("all");

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTabFromHash = () => {
    const hash = window.location.hash.replace("#", "");
    return ["users", "stores", "workflow", "settings"].includes(hash)
      ? hash
      : "users";
  };
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [userTab, setUserTab] = useState("all");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreFormData | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);

  // States for sorting and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>({ key: "name", direction: "ascending" });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [fetchedUsers, fetchedRoles, fetchedStores, fetchedStatuses] =
        await Promise.all([
          api.getUsers(),
          api.getRoles(),
          api.getStores(),
          api.getStatuses(),
        ]);
      setUsers(fetchedUsers);
      setRoles(fetchedRoles);
      setStores(fetchedStores);
      setStatuses(fetchedStatuses);
      setOriginalStatuses(fetchedStatuses);
      setHasOrderChanged(false);
    } catch (err: any) {
      setError("Could not load admin data.");
      toast.error("Failed to load data", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Trigger animations
    setTimeout(() => setIsHeaderVisible(true), 300);
    setTimeout(() => setIsContentVisible(true), 600);

    const handleHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const processUsers = (userList: User[]) => {
    let filtered = userList.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // --- THIS IS THE NEW LINE ---
        String(user.user_id).includes(searchTerm)
    );

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        // Custom sorting for roles
        if (sortConfig.key === "roleName") {
          const rolePriority: { [key: string]: number } = {
            admin: 1,
            manager: 2,
          };
          const aPriority = rolePriority[a.roleName] || 99;
          const bPriority = rolePriority[b.roleName] || 99;

          let result = 0;
          if (aPriority < bPriority) {
            result = -1;
          } else if (aPriority > bPriority) {
            result = 1;
          } else {
            // If priorities are the same, sort alphabetically
            result = a.roleName.localeCompare(b.roleName);
          }
          return sortConfig.direction === "ascending" ? result : -result;
        }

        // Default sorting for other columns (this will work for user_id)
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  };

  const pendingUsers = useMemo(
    () => users.filter((user) => user.status === "pending"),
    [users]
  );
  const processedAllUsers = useMemo(
    () => processUsers(users),
    [users, searchTerm, sortConfig]
  );
  const processedPendingUsers = useMemo(
    () => processUsers(pendingUsers),
    [pendingUsers, searchTerm, sortConfig]
  );

  const requestSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setStatuses((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        return reorderedItems.map((item, index) => ({
          ...item,
          display_order: index + 1,
        }));
      });
      setHasOrderChanged(true);
    }
  };

  const handleSaveOrder = async () => {
    try {
      await api.reorderStatuses(statuses);
      setOriginalStatuses(statuses);
      setHasOrderChanged(false);
      toast.success(t("adminPanel.toasts.orderSavedSuccess"));
    } catch (err: any) {
      toast.error(t("adminPanel.toasts.orderSavedError"), {
        description: err.message,
      });
      fetchData();
    }
  };

  const handleCancelReorder = () => {
    setStatuses(originalStatuses);
    setHasOrderChanged(false);
    toast.info(t("adminPanel.toasts.changesDiscarded"));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleStatusSubmit = async (statusData: Omit<Status, "id">) => {
    try {
      if (editingStatus) {
        await api.updateStatus(editingStatus.id, statusData);
        toast.success(t("adminPanel.toasts.statusUpdatedSuccess"));
      } else {
        await api.createStatus(statusData);
        toast.success(t("adminPanel.toasts.statusCreatedSuccess"));
      }
      setIsStatusDialogOpen(false);
      setEditingStatus(null);
      fetchData();
    } catch (err: any) {
      toast.error(t("adminPanel.toasts.operationFailed"), {
        description: err.message,
      });
    }
  };

  const handleDeleteStatus = async (statusId: number) => {
    if (window.confirm(t("adminPanel.confirmations.deleteStatus"))) {
      try {
        await api.deleteStatus(statusId);
        fetchData();
        toast.success(t("adminPanel.toasts.statusDeletedSuccess"));
      } catch (err: any) {
        toast.error(t("adminPanel.toasts.deleteStatusError"), {
          description: err.message,
        });
      }
    }
  };

  const handleUserSubmit = async (userData: any) => {
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, userData);
        toast.success(t("adminPanel.toasts.userUpdatedSuccess"));
      } else {
        await api.createUser(userData);
        toast.success(t("adminPanel.toasts.userCreatedSuccess"));
      }
      setIsUserDialogOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (err: any) {
      toast.error(t("adminPanel.toasts.operationFailed"), {
        description: err.message,
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(t("adminPanel.confirmations.deleteUser"))) {
      try {
        await api.deleteUser(userId);
        fetchData();
        toast.success(t("adminPanel.toasts.userDeletedSuccess"));
      } catch (err: any) {
        toast.error(t("adminPanel.toasts.deleteUserError"), {
          description: err.message,
        });
      }
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (window.confirm(t("adminPanel.confirmations.approveUser"))) {
      try {
        await api.approveUser(userId);
        fetchData();
        toast.success(t("adminPanel.toasts.userApprovedSuccess"));
      } catch (err: any) {
        toast.error(t("adminPanel.toasts.approveUserError"), {
          description: err.message,
        });
      }
    }
  };

  const handleDenyRegistration = async (userId: string) => {
    if (window.confirm(t("adminPanel.confirmations.denyRegistration"))) {
      try {
        await api.denyRegistration(userId);
        fetchData();
        toast.success(t("adminPanel.toasts.registrationDeniedSuccess"));
      } catch (err: any) {
        toast.error(t("adminPanel.toasts.denyRegistrationError"), {
          description: err.message,
        });
      }
    }
  };

  const handleStoreSubmit = async (storeData: StoreFormData) => {
    try {
      // If editingStore exists, we are UPDATING an existing customer.
      if (editingStore) {
        // Use the 'id' from the editingStore state for the update call
        await api.updateStore(editingStore.id, storeData);
        toast.success(t("adminPanel.toasts.storeUpdatedSuccess"));
      } else {
        // --- THIS IS THE FIX ---
        // Change api.createStore to api.createCustomer
        await api.createCustomer(storeData);
        toast.success("Customer and Store created successfully!");
      }

      // Close the dialog and refresh data in both cases
      setIsStoreDialogOpen(false);
      setEditingStore(null);
      fetchData();
    } catch (err: any) {
      toast.error(t("adminPanel.toasts.operationFailed"), {
        description: err.message,
      });
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (window.confirm(t("adminPanel.confirmations.deleteStore"))) {
      try {
        await api.deleteStore(storeId);
        toast.success(t("adminPanel.toasts.storeDeletedSuccess"));
        fetchData();
      } catch (err: any) {
        toast.error(t("adminPanel.toasts.deleteStoreError"), {
          description: err.message,
        });
      }
    }
  };

  const sortCards = (items: any[]) => {
    if (!sortConfig) return items;

    return [...items].sort((a, b) => {
      if (sortConfig.key === "roleName") {
        const rolePriority: { [key: string]: number } = {
          admin: 1,
          manager: 2,
        };
        const aPriority = rolePriority[a.roleName] || 99;
        const bPriority = rolePriority[b.roleName] || 99;
        return sortConfig.direction === "ascending"
          ? aPriority - bPriority
          : bPriority - aPriority;
      }

      const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
      const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";

      if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  };

  const SortableHeader = ({
    sortKey,
    children,
    className,
  }: {
    sortKey: SortKey;
    children: React.ReactNode;
    className?: string;
  }) => {
    const isActive = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction;

    return (
      <TableHead className={className}>
        <AnimatedActionButton
          variant="ghost"
          size="default"
          onClick={() => requestSort(sortKey)}
          className={`hover:bg-transparent hover:text-amber-700 dark:hover:text-amber-400 ${
            isActive ? "text-amber-600 dark:text-amber-400 font-semibold" : ""
          }`}
        >
          {children}
          <ArrowUpDown
            className={`ml-2 h-4 w-4 transition-transform ${
              isActive && direction === "descending" ? "rotate-180" : ""
            }`}
          />
        </AnimatedActionButton>
      </TableHead>
    );
  };

  const filteredUsers = processedAllUsers.filter((user) => {
    if (userStatusFilter === "all") return true;
    return user.status === userStatusFilter;
  });

  const filteredCustomers = stores.filter((customer) => {
    if (customerStatusFilter === "all") return true;
    return customer.status === customerStatusFilter;
  });

  const renderUserTable = (userList: User[], startDelay = 0) => (
    <Table dir={i18n.dir()} className="w-full">
      <TableHeader>
        <TableRow className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20 dark:border-gray-800">
          <SortableHeader
            sortKey="name"
            className="whitespace-nowrap text-center"
          >
            {t("adminPanel.tableHeaders.name")}
          </SortableHeader>

          <SortableHeader sortKey="user_id" className="text-center">
            {t("adminPanel.tableHeaders.userId", "User ID")}
          </SortableHeader>

          <SortableHeader
            sortKey="email"
            className="whitespace-nowrap text-center"
          >
            {t("adminPanel.tableHeaders.email")}
          </SortableHeader>
          <TableHead className="whitespace-nowrap text-center">
            {t("adminPanel.tableHeaders.phone")}
          </TableHead>
          <SortableHeader
            sortKey="roleName"
            className="whitespace-nowrap text-center"
          >
            {t("adminPanel.tableHeaders.role")}
          </SortableHeader>
          <SortableHeader
            sortKey="status"
            className="whitespace-nowrap text-center"
          >
            {t("adminPanel.tableHeaders.status")}
          </SortableHeader>
          <TableHead className="whitespace-nowrap text-center">
            {t("adminPanel.tableHeaders.notes")}
          </TableHead>
          <TableHead className="text-center whitespace-nowrap">
            {t("adminPanel.tableHeaders.actions")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList.map((user, index) => (
          <AnimatedTableRow
            key={user.id}
            delay={startDelay + index * 100}
            isPending={user.status === "pending"}
          >
            <TableCell className="font-medium text-center">
              {user.status === "pending" && (
                <span
                  className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"
                  title="Pending Approval"
                ></span>
              )}
              {user.name}
            </TableCell>

            <TableCell className="text-center">{user.user_id}</TableCell>
            <TableCell className="text-center">{user.email}</TableCell>
            <TableCell className="text-center">{user.phone || "-"}</TableCell>
            <TableCell className="text-center">
              <span className="capitalize px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium dark:bg-amber-900/50 dark:text-amber-300">
                {t(`adminPanel.roles.${user.roleName.toLowerCase()}`, {
                  defaultValue: user.roleName,
                })}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <span
                className={`
                capitalize px-2 py-1 rounded-full text-xs font-medium
                ${
                  user.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                    : user.status === "Deactivated"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                }
              `}
              >
                {t(`adminPanel.statuses.${user.status.toLowerCase()}`, {
                  defaultValue: user.status,
                })}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <p
                    className="max-w-[150px] truncate cursor-pointer text-sm text-gray-600 underline hover:text-amber-700 transition-colors duration-300 dark:text-gray-400 dark:hover:text-amber-400 mx-auto"
                    title={user.notes || ""}
                  >
                    {user.notes || "-"}
                  </p>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("adminPanel.users.notesFor")} {user.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap break-words pt-4">
                    {user.notes || t("adminPanel.users.noNotes")}
                  </div>
                </DialogContent>
              </Dialog>
            </TableCell>
            <TableCell className="text-center space-x-1">
              {user.status === "pending" ? (
                <>
                  <AnimatedActionButton
                    onClick={() => handleApproveUser(user.id)}
                    title={t("adminPanel.users.approve")}
                    className="hover:bg-green-100 hover:border-green-300 dark:hover:bg-green-900/50 dark:hover:border-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </AnimatedActionButton>
                  <AnimatedActionButton
                    onClick={() => handleDenyRegistration(user.id)}
                    title={t("adminPanel.users.deny")}
                    className="hover:bg-red-100 hover:border-red-300 dark:hover:bg-red-900/50 dark:hover:border-red-700"
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                  </AnimatedActionButton>
                </>
              ) : (
                <>
                  <AnimatedActionButton
                    onClick={() => {
                      setEditingUser(user);
                      setIsUserDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </AnimatedActionButton>
                  <AnimatedActionButton
                    onClick={() => handleDeleteUser(user.id)}
                    className="hover:bg-red-100 hover:border-red-300 dark:hover:bg-red-900/50 dark:hover:border-red-700"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </AnimatedActionButton>
                </>
              )}
            </TableCell>
          </AnimatedTableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-gray-900 dark:via-gray-900 dark:to-black flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-200 border-t-amber-600 dark:border-amber-900 dark:border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-l-amber-400 dark:border-l-amber-600 rounded-full animate-ping" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-gray-900 dark:via-gray-900 dark:to-black relative overflow-hidden text-gray-800 dark:text-gray-200">
      {/* Ambient background patterns */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-amber-200 to-yellow-200 dark:from-amber-900/50 dark:to-yellow-900/50 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-yellow-200 to-amber-300 dark:from-yellow-900/50 dark:to-amber-900/50 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto p-6">
        <header
          dir="ltr"
          className={`bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-amber-200 dark:border-gray-800 mb-8 transform transition-all duration-1000 ease-out hover:shadow-3xl ${
            isHeaderVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-8"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center w-full gap-4">
            {/* Left: Crown Icon + Title */}
            <div className="flex items-center gap-x-3 min-w-[250px]">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Crown className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400">
                  Admin Panel
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium dark:text-gray-400 flex items-center gap-1">
                  Naseej | نسيج
                </p>
              </div>
            </div>

            {/* Center: Clock card */}
            <div className="flex-1 flex justify-center w-full lg:w-auto">
              <div className="group relative text-center bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-50 dark:from-gray-800 dark:via-gray-800/80 dark:to-gray-800/50 px-6 py-3 rounded-xl shadow-lg border-2 border-amber-300/50 dark:border-amber-700/30 hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 hover:scale-[1.03] cursor-default overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/0 via-yellow-200/40 to-amber-200/0 dark:from-amber-600/0 dark:via-amber-500/10 dark:to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p className="relative text-xs text-amber-700 font-semibold dark:text-amber-400 mb-1 tracking-wide">
                  TODAY
                </p>
                <p className="relative font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 flex items-center justify-center gap-x-2 flex-wrap">
                  <span className="text-amber-800 dark:text-amber-300">
                    {currentDate.toLocaleDateString()}
                  </span>
                  <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {currentDate.toLocaleTimeString()}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Language, Mode Toggle, Logout */}
            <div className="flex items-center gap-x-2 min-w-[200px] justify-end relative dropdown-container">
              <div className="flex gap-2 p-1.5 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-lg border border-amber-200/50 dark:border-gray-700/50 shadow-sm">
                <LanguageToggle />
                <ModeToggle />
              </div>

              {/* For admin, you can keep it simple: Logout only */}
              <button
                onClick={handleLogout}
                className="group relative px-5 py-2.5 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.05] active:scale-95 border border-amber-400/30 overflow-hidden flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div
          dir="ltr"
          className={`
    grid grid-cols-1 md:grid-cols-3 gap-6 mb-8
    transform transition-all duration-1000 ease-out
    ${
      isContentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }
  `}
        >
          <EnhancedMetricCard
            title={t("adminPanel.totalUsers")}
            value={users.length}
            icon={Users}
            color="primary"
            trend={{ value: 12, isPositive: true }}
            delay={0}
          />
          <EnhancedMetricCard
            title={t("adminPanel.totalCustomers")}
            value={stores.length}
            icon={Building}
            color="secondary"
            trend={{ value: 8, isPositive: true }}
            delay={0}
          />
          <EnhancedMetricCard
            title={t("adminPanel.workflowStages")}
            value={statuses.length}
            icon={Workflow}
            color="success"
            delay={0}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className={`
            w-full
            transform transition-all duration-1000 ease-out
            ${
              isContentVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }
          `}
          style={{ transitionDelay: "0ms" }}
        >
          <TabsList
            className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 shadow-lg rounded-xl p-2"
            dir={i18n.dir()}
          >
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
            >
              <Users className="h-4 w-4 mr-2" />
              {t("adminPanel.tabs.userManagement")}
            </TabsTrigger>
            <TabsTrigger
              value="stores"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
            >
              <Building className="h-4 w-4 mr-2" />
              {t("adminPanel.tabs.customerManagement")}
            </TabsTrigger>
            <TabsTrigger
              value="workflow"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
            >
              <Workflow className="h-4 w-4 mr-2" />
              {t("adminPanel.tabs.workflowSettings")}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
            >
              <Settings className="h-4 w-4 mr-2" />
              {t("adminPanel.tabs.settings")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 rounded-2xl mt-6 shadow-xl overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-amber-200 dark:border-gray-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Input
                    placeholder={t("adminPanel.users.filterPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${
                      i18n.dir() === "rtl"
                        ? "pl-8 text-right"
                        : "pr-8 text-left"
                    } border-amber-200 focus:border-amber-400 focus:ring-amber-400 dark:bg-gray-800 dark:border-gray-700 dark:focus:border-amber-500 dark:focus:ring-amber-500`}
                  />
                  {searchTerm && (
                    <AnimatedActionButton
                      className={`absolute top-0 h-full px-3 ${
                        i18n.dir() === "rtl" ? "left-0" : "right-0"
                      }`}
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </AnimatedActionButton>
                  )}
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex rounded-full border border-amber-200 dark:border-gray-700 overflow-hidden">
                    {["all", "active", "Deactivated"].map((status, index) => (
                      <button
                        key={status}
                        onClick={() => setUserStatusFilter(status as any)}
                        className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors ${
                          userStatusFilter === status
                            ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                            : "bg-amber-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700"
                        } ${
                          index !== 0
                            ? "border-l border-amber-200 dark:border-gray-700"
                            : ""
                        }`}
                      >
                        {status === "all"
                          ? "All"
                          : status === "active"
                          ? "Active"
                          : "Deactivated"}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatedActionButton
                  size="default"
                  onClick={() => {
                    setEditingUser(null);
                    setIsUserDialogOpen(true);
                  }}
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 shadow-lg"
                >
                  <UserPlus className="h-4 w-4 mr-2" />{" "}
                  {t("adminPanel.users.addNewUser")}
                </AnimatedActionButton>
              </div>

              <div className="flex justify-center w-full">
                <div className="p-1 bg-amber-50 dark:bg-gray-800 rounded-lg flex items-center space-x-1">
                  <Button
                    variant={userView === "card" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setUserView("card")}
                    title="Card View"
                    // Apply gradient style when active
                    className={
                      userView === "card"
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                        : "hover:bg-amber-100 dark:hover:bg-gray-700"
                    }
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={userView === "table" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setUserView("table")}
                    title="Table View"
                    // Apply gradient style when active
                    className={
                      userView === "table"
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                        : "hover:bg-amber-100 dark:hover:bg-gray-700"
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs
                value={userTab}
                onValueChange={setUserTab}
                className="w-full"
              >
                <TabsList
                  className={`w-full flex ${
                    i18n.dir() === "rtl" ? "flex-row-reverse" : "flex-row"
                  } justify-start rounded-none bg-amber-50/50 dark:bg-gray-800/30 p-0 border-b border-amber-200 dark:border-gray-800`}
                >
                  <TabsTrigger
                    value="all"
                    className={`flex-1 flex items-center ${
                      i18n.dir() === "rtl" ? "justify-end" : "justify-start"
                    } px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-amber-700 font-medium dark:data-[state=active]:text-amber-400 gap-x-2`}
                  >
                    <Users
                      className={`h-4 w-4 ${
                        i18n.dir() === "rtl" ? "ml-2 mr-0" : "mr-2"
                      }`}
                    />
                    {t("adminPanel.users.allUsers")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className={`flex-1 flex items-center ${
                      i18n.dir() === "rtl" ? "justify-end" : "justify-start"
                    } px-6 py-4 rounded-none border-b-2 border-transparent
                      data-[state=active]:border-amber-400
                      data-[state=active]:bg-transparent
                      data-[state=active]:shadow-none
                      data-[state=active]:text-amber-700
                      font-medium dark:data-[state=active]:text-amber-400 gap-x-2`}
                  >
                    <Clock
                      className={`h-4 w-4 ${
                        i18n.dir() === "rtl" ? "ml-2 mr-0" : "mr-2"
                      }`}
                    />
                    {t("adminPanel.users.pendingRequests")}
                    {pendingUsers.length > 0 && (
                      <span
                        className={`${
                          i18n.dir() === "rtl" ? "mr-2 ml-0" : "ml-2"
                        } bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-sm`}
                      >
                        {pendingUsers.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="p-4 md:p-6">
                  {filteredUsers.length > 0 ? (
                    userView === "card" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortCards(filteredUsers).map((user, index) => (
                          <InfoCard
                            key={user.id}
                            item={user}
                            type="user"
                            delay={index * 50}
                            onEdit={() => {
                              setEditingUser(user);
                              setIsUserDialogOpen(true);
                            }}
                            onDelete={() => handleDeleteUser(user.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      renderUserTable(filteredUsers)
                    )
                  ) : (
                    <EmptyState message="No users found." />
                  )}
                </TabsContent>

                <TabsContent value="pending" className="p-4 md:p-6">
                  {pendingUsers.length > 0 ? (
                    userView === "card" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortCards(pendingUsers).map((user, index) => (
                          <InfoCard
                            key={user.id}
                            item={user}
                            type="user"
                            delay={index * 50}
                            onEdit={() => {
                              setEditingUser(user);
                              setIsUserDialogOpen(true);
                            }}
                            onDelete={() => handleDeleteUser(user.id)}
                            onApprove={() => handleApproveUser(user.id)}
                            onDeny={() => handleDenyRegistration(user.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      renderUserTable(processedPendingUsers)
                    )
                  ) : (
                    <EmptyState message="No pending user requests." />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="stores">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 rounded-2xl mt-6 shadow-xl overflow-hidden">
              {/* Header with icon and "Add New Store" button */}
              <div className="flex justify-between items-center p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20 flex-wrap">
                <div className="flex items-center space-x-3">
                  <Building className="h-6 w-6 text-amber-500" />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Partner Customers
                  </h2>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex rounded-full border border-amber-200 dark:border-gray-700 overflow-hidden">
                    {["all", "active", "Deactivated"].map((status, index) => (
                      <button
                        key={status}
                        onClick={() => setCustomerStatusFilter(status as any)}
                        className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors ${
                          customerStatusFilter === status
                            ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                            : "bg-amber-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700"
                        } ${
                          index !== 0
                            ? "border-l border-amber-200 dark:border-gray-700"
                            : ""
                        }`}
                      >
                        {status === "all"
                          ? "All"
                          : status === "active"
                          ? "Active"
                          : "Deactivated"}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatedActionButton
                  size="default"
                  onClick={() => {
                    setEditingStore(null);
                    setIsStoreDialogOpen(true);
                  }}
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg hover:from-amber-500 hover:to-yellow-600"
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add a New Customer
                </AnimatedActionButton>
              </div>

              {/* Card / Table toggle */}
              <div className="flex justify-center w-full mb-4">
                <div className="p-1 bg-amber-50 dark:bg-gray-800 rounded-lg flex items-center space-x-1">
                  <Button
                    variant={customerView === "card" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setCustomerView("card")}
                    title="Card View"
                    className={
                      customerView === "card"
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                        : "hover:bg-amber-100 dark:hover:bg-gray-700"
                    }
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={customerView === "table" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setCustomerView("table")}
                    title="Table View"
                    className={
                      customerView === "table"
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                        : "hover:bg-amber-100 dark:hover:bg-gray-700"
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {filteredCustomers.length > 0 ? (
                customerView === "card" ? (
                  // --- CARD VIEW ---
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 md:p-6">
                    {filteredCustomers.map((customer, index) => (
                      <InfoCard
                        key={customer.store_id}
                        item={customer}
                        type="customer"
                        delay={index * 50}
                        onEdit={() => {
                          const formCompatibleStore: StoreFormData = {
                            id: customer.store_id,
                            name: customer.contact_name,
                            phone: customer.contact_phone,
                            storeName: customer.storeName,
                            address: customer.address,
                            city: customer.city,
                            notes: customer.storeNotes,
                          };
                          setEditingStore(formCompatibleStore);
                          setIsStoreDialogOpen(true);
                        }}
                        onDelete={() => handleDeleteUser(customer.store_id)}
                      />
                    ))}
                  </div>
                ) : (
                  // --- TABLE VIEW ---
                  <div className="overflow-hidden rounded-xl border p-4 md:p-6">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-amber-50 to-yellow-50">
                          <TableHead className="text-center">
                            Store Name
                          </TableHead>
                          <TableHead className="text-center">
                            Contact Name
                          </TableHead>
                          <TableHead className="text-center">User ID</TableHead>
                          <TableHead className="text-center">Phone</TableHead>
                          <TableHead className="text-center">Address</TableHead>
                          <TableHead className="text-center">City</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Notes</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((store, index) => (
                          <AnimatedTableRow
                            key={store.store_id}
                            delay={index * 100}
                          >
                            <TableCell className="text-center font-medium">
                              {store.storeName}
                            </TableCell>
                            <TableCell className="text-center">
                              {store.contact_name}
                            </TableCell>
                            <TableCell className="text-center text-sm text-gray-500 dark:text-gray-400">
                              {store.user_id}
                            </TableCell>
                            <TableCell className="text-center">
                              {store.contact_phone}
                            </TableCell>
                            <TableCell className="text-center">
                              {store.address}
                            </TableCell>
                            <TableCell className="text-center">
                              {store.city}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`capitalize px-3 py-1 text-xs font-semibold rounded-full ${
                                  store.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 animate-pulse"
                                    : store.status === "Deactivated"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                }`}
                              >
                                {t(
                                  `adminPanel.statuses.${store.status?.toLowerCase()}`,
                                  { defaultValue: store.status }
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {store.storeNotes}
                            </TableCell>
                            <TableCell className="text-center space-x-2">
                              <AnimatedActionButton
                                onClick={() => {
                                  const formCompatibleStore: StoreFormData = {
                                    id: store.store_id,
                                    name: store.contact_name,
                                    phone: store.contact_phone,
                                    storeName: store.storeName,
                                    address: store.address,
                                    city: store.city,
                                    notes: store.storeNotes,
                                  };
                                  setEditingStore(formCompatibleStore);
                                  setIsStoreDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </AnimatedActionButton>
                              <AnimatedActionButton
                                onClick={() =>
                                  handleDeleteStore(store.store_id)
                                }
                                className="hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </AnimatedActionButton>
                            </TableCell>
                          </AnimatedTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              ) : (
                <div className="p-4 md:p-6">
                  <EmptyState message="No customers found." />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="workflow">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 rounded-2xl p-6 mt-6 shadow-xl">
              <div className="flex justify-between items-center mb-6 flex-wrap">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500">
                    <Workflow className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Workflow Statuses
                  </h2>
                </div>
                <div className="flex items-center space-x-2 flex-wrap">
                  {hasOrderChanged && (
                    <>
                      <AnimatedActionButton
                        onClick={handleCancelReorder}
                        variant="outline"
                        size="default"
                        className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                        <X className="h-4 w-4 mr-2" /> Cancel
                      </AnimatedActionButton>
                      <AnimatedActionButton
                        onClick={handleSaveOrder}
                        size="default"
                        className="bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 shadow-lg"
                      >
                        <Save className="h-4 w-4 mr-2" /> Save Order
                      </AnimatedActionButton>
                    </>
                  )}
                  <AnimatedActionButton
                    size="default"
                    onClick={() => {
                      setEditingStatus(null);
                      setIsStatusDialogOpen(true);
                    }}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 shadow-lg"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add a New Status
                  </AnimatedActionButton>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-amber-200 dark:border-gray-800">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={statuses}
                    strategy={verticalListSortingStrategy}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20 dark:border-gray-800">
                          <TableHead className="w-12"></TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Order
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Name
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Description
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Color
                          </TableHead>
                          <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statuses.map((status) => (
                          <DraggableStatusRow
                            key={status.id}
                            status={status}
                            onEdit={(s) => {
                              setEditingStatus(s);
                              setIsStatusDialogOpen(true);
                            }}
                            onDelete={handleDeleteStatus}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 rounded-2xl p-6 mt-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  System Settings
                </h2>
              </div>
              <SettingsTab />
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-center font-medium flex items-center justify-center">
              <XCircle className="h-5 w-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Enhanced Dialogs */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-amber-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-x-2">
                <Users className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                {editingUser
                  ? t("adminPanel.users.editUser")
                  : t("adminPanel.users.createUser")}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              user={editingUser}
              roles={roles.filter((role) => role.name !== "customer")}
              onSubmit={handleUserSubmit}
              onClose={() => setIsUserDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
          <DialogContent /* ... */>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-6 w-6 text-amber-500" />
                <span>Edit Store Details</span>
              </DialogTitle>
            </DialogHeader>
            <StoreForm
              store={editingStore}
              onSubmit={handleStoreSubmit}
              onClose={() => setIsStoreDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-amber-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                {editingStatus ? "Edit Status" : "Create a New Status"}
              </DialogTitle>
              <DialogDescription>
                {editingStatus
                  ? "Update the details for this status."
                  : "Add a new status to the workflow."}
              </DialogDescription>
            </DialogHeader>
            <StatusForm
              status={editingStatus}
              statuses={statuses}
              onSubmit={handleStatusSubmit}
              onClose={() => setIsStatusDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;
