import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Building, Users, Workflow, Settings, Crown } from "lucide-react";
import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

// --- REUSABLE COMPONENT IMPORTS ---
import { DashboardHeader } from "../components/DashboardHeader";
import { EnhancedMetricCard } from "../components/EnhancedMetricCard";
import { SettingsTab } from "../components/SettingsTab";

// --- NEWLY EXTRACTED TAB COMPONENT ---
import { UserManagementTab } from "../components/admin/UserManagementTab";
import { CustomerManagementTab } from "../components/admin/CustomerManagementTab";
import { WorkflowSettingsTab } from "../components/admin/WorkflowSettingsTab";

// --- DIALOGS AND OTHER COMPONENTS FOR OTHER TABS ---
// Note: We will extract these in later steps
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StoreForm } from "../components/StoreForm";
import { StatusForm } from "../components/StatusForm";

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
  email: string;
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

// --- Main AdminPanel Component ---
const AdminPanel = () => {
  const { t, i18n } = useTranslation();

  // --- State Management for the entire Admin Panel ---
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [originalStatuses, setOriginalStatuses] = useState<Status[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State for Dialogs that haven't been moved yet
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreFormData | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);

  const getTabFromHash = () => {
    const hash = window.location.hash.replace("#", "");
    return ["users", "stores", "workflow", "settings"].includes(hash)
      ? hash
      : "users";
  };
  const [activeTab, setActiveTab] = useState(getTabFromHash);

  // --- Data Fetching ---
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
    } catch (err: any) {
      setError("Could not load admin data.");
      toast.error("Failed to load data", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // --- Event Handlers (to be passed as props) ---
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const handleUserSubmit = async (userData: any, editingUser: User | null) => {
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, userData);
        toast.success(t("adminPanel.toasts.userUpdatedSuccess"));
      } else {
        await api.createUser(userData);
        toast.success(t("adminPanel.toasts.userCreatedSuccess"));
      }
      fetchData(); // Refresh data
      return true; // Indicate success
    } catch (err: any) {
      toast.error(t("adminPanel.toasts.operationFailed"), {
        description: err.message,
      });
      return false; // Indicate failure
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

  const handleStoreSubmit = async (
    storeData: StoreFormData,
    editingStore: StoreFormData | null
  ) => {
    try {
      if (editingStore) {
        await api.updateStore(editingStore.id, storeData);
        toast.success(t("adminPanel.toasts.storeUpdatedSuccess"));
      } else {
        await api.createCustomer(storeData);
        toast.success("Customer and Store created successfully!");
      }
      fetchData();
      return true;
    } catch (err: any) {
      toast.error(t("adminPanel.toasts.operationFailed"), {
        description: err.message,
      });
      return false;
    }
  };

  // MODIFICATION: Fixed the function signature
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setStatuses((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        // Update display_order based on new position
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
      fetchData(); // Refetch to reset to original order on error
    }
  };

  const handleCancelReorder = () => {
    setStatuses(originalStatuses);
    setHasOrderChanged(false);
    toast.info(t("adminPanel.toasts.changesDiscarded"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-200 border-t-amber-600 dark:border-amber-900 dark:border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-l-amber-400 dark:border-l-amber-600 rounded-full animate-ping" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:via-black relative overflow-hidden text-gray-800 dark:text-gray-200">
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
        <DashboardHeader title="Admin Panel" icon={Crown} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <EnhancedMetricCard
            title={t("adminPanel.totalUsers")}
            value={users.length}
            icon={Users}
            color="primary"
          />
          <EnhancedMetricCard
            title={t("adminPanel.totalCustomers")}
            value={stores.length}
            icon={Building}
            color="secondary"
          />
          <EnhancedMetricCard
            title={t("adminPanel.workflowStages")}
            value={statuses.length}
            icon={Workflow}
            color="success"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
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
            <UserManagementTab
              users={users}
              roles={roles}
              onUserSubmit={handleUserSubmit}
              onDeleteUser={handleDeleteUser}
              onApproveUser={handleApproveUser}
              onDenyRegistration={handleDenyRegistration}
            />
          </TabsContent>

          <TabsContent value="stores">
            <CustomerManagementTab
              stores={stores}
              onStoreSubmit={handleStoreSubmit}
              onDeleteStore={handleDeleteStore}
            />
          </TabsContent>

          <TabsContent value="workflow">
            {/* MODIFICATION: Replace placeholder with the actual component */}
            <WorkflowSettingsTab
              statuses={statuses}
              onDragEnd={handleDragEnd}
              onSaveOrder={handleSaveOrder}
              onCancelReorder={handleCancelReorder}
              hasOrderChanged={hasOrderChanged}
              onStatusSubmit={handleStatusSubmit}
              onDeleteStatus={handleDeleteStatus}
            />
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-white/80 dark:bg-gray-900/80 p-6 mt-6 rounded-2xl shadow-xl">
              <SettingsTab />
            </div>
          </TabsContent>
        </Tabs>

        {/* Note: The dialogs for Store and Status are still here for now. We will move them in future steps */}
        <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
          {/* ... Store Dialog Content */}
        </Dialog>
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          {/* ... Status Dialog Content */}
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;
