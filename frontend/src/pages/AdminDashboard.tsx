import { useEffect, useState, useMemo } from "react";
import { api } from "../services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Building,
  Users,
  Workflow,
  Settings,
  Crown,
  ClipboardCheck,
  FileClock,
} from "lucide-react";
import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { DashboardHeader } from "../components/DashboardHeader";
import { EnhancedMetricCard } from "../components/EnhancedMetricCard";
import { SettingsTab } from "../components/SettingsTab";
import { ApprovalQueue } from "@/components/ApprovalQueue";
import { RequestHistoryTab } from "@/features/admin/RequestHistoryTab";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog } from "@/components/ui/dialog";

import { UserManagementTab } from "../features/admin/UserManagementTab";
import { CustomerManagementTab } from "../features/admin/CustomerManagementTab";
import { WorkflowSettingsTab } from "../features/admin/WorkflowSettingsTab";

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

const ITEMS_PER_PAGE = 10;

export const AdminPanel = () => {
  const { t, i18n } = useTranslation();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [originalStatuses, setOriginalStatuses] = useState<Status[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvalPage, setApprovalPage] = useState(1);
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreFormData | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [userViewMode, setUserViewMode] = useState<"card" | "table">("card");
  const [storeViewMode, setStoreViewMode] = useState<"card" | "table">("card");
  const [historyPage, setHistoryPage] = useState(1);
  const [allRequests, setAllRequests] = useState<any[]>([]);

  // 🔹 Confirmation dialog states
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const VALID_TABS = [
    "users",
    "stores",
    "approvals",
    "history",
    "workflow",
    "settings",
  ];

  const getTabFromHash = () => {
    const hash = window.location.hash.replace("#", "");
    return VALID_TABS.includes(hash) ? hash : "users";
  };
  const [activeTab, setActiveTab] = useState(getTabFromHash);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [
        fetchedUsers,
        fetchedRoles,
        fetchedStores,
        fetchedStatuses,
        fetchedRequests,
      ] = await Promise.all([
        api.getUsers(),
        api.getRoles(),
        api.getStores(),
        api.getStatuses(),
        api.getRequests(),
      ]);
      setUsers(fetchedUsers);
      setRoles(fetchedRoles);
      setStores(fetchedStores);
      setStatuses(fetchedStatuses);
      setAllRequests(fetchedRequests || []);
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
      fetchData();
      return true;
    } catch (err: any) {
      toast.error(t("adminPanel.toasts.operationFailed"), {
        description: err.message,
      });
      return false;
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

  const handleStatusSubmit = async (
    statusData: Omit<Status, "id">,
    editingStatus: Status | null
  ) => {
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
      return true;
    } catch (err: any) {
      toast.error(t("adminPanel.toasts.operationFailed"), {
        description: err.message,
      });
      return false;
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

  const handleApprovalAction = async () => {
    if (!currentRequestId || !currentAction) return;
    try {
      if (currentAction === "approve") {
        await api.approveRequest(currentRequestId);
        toast.success("Request approved successfully!");
      } else {
        await api.rejectRequest(currentRequestId, rejectionNote);
        toast.error("Request rejected.");
      }
      fetchData();
    } catch (err: any) {
      toast.error("Failed to update the request.", {
        description: err.message,
      });
    } finally {
      setIsApprovalDialogOpen(false);
      setCurrentRequestId(null);
      setCurrentAction(null);
      setRejectionNote("");
    }
  };

  const openApprovalDialog = (id: string, action: "approve" | "reject") => {
    setCurrentRequestId(id);
    setCurrentAction(action);
    setIsApprovalDialogOpen(true);
  };

  const requestsWithStoreNames = useMemo(() => {
    return allRequests.map((req) => {
      const store = stores.find((s) => s.store_id === req.store_id);
      return {
        ...req,
        storeName: store?.storeName || "Unknown Store",
      };
    });
  }, [allRequests, stores]);

  const pendingRequests = useMemo(() => {
    return requestsWithStoreNames.filter(
      (req) => req.status === "Pending Approval"
    );
  }, [requestsWithStoreNames]);

  const paginatedPendingRequests = useMemo(() => {
    const startIndex = (approvalPage - 1) * ITEMS_PER_PAGE;
    return pendingRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [pendingRequests, approvalPage]);

  const totalApprovalPages = Math.ceil(pendingRequests.length / ITEMS_PER_PAGE);

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
            className="grid w-full grid-cols-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 shadow-lg rounded-xl p-2"
            dir={i18n.dir()}
          >
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
            >
              <Users className="h-4 w-4 mr-2" />
              {t("adminPanel.tabs.userManagement")}
            </TabsTrigger>
            <TabsTrigger
              value="stores"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
            >
              <Building className="h-4 w-4 mr-2" />
              {t("adminPanel.tabs.customerManagement")}
            </TabsTrigger>
            <TabsTrigger
              value="approvals"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Approval Queue
              {pendingRequests.length > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
            >
              <FileClock className="h-4 w-4 mr-2" />
              Request History
            </TabsTrigger>
            <TabsTrigger
              value="workflow"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
            >
              <Workflow className="h-4 w-4 mr-2" />
              {t("adminPanel.tabs.workflowSettings")}
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
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
              viewMode={userViewMode}
              setViewMode={setUserViewMode}
            />
          </TabsContent>

          <TabsContent value="stores">
            <CustomerManagementTab
              stores={stores}
              onStoreSubmit={handleStoreSubmit}
              onDeleteStore={handleDeleteStore}
              viewMode={storeViewMode}
              setViewMode={setStoreViewMode}
            />
          </TabsContent>

          <TabsContent value="approvals">
            <ApprovalQueue
              requestsToShow={paginatedPendingRequests}
              stores={stores}
              onAction={openApprovalDialog}
              currentPage={approvalPage}
              totalPages={totalApprovalPages}
              onPageChange={setApprovalPage}
            />
          </TabsContent>

          <TabsContent value="history">
            <RequestHistoryTab
              requests={requestsWithStoreNames}
              stores={stores}
              currentPage={historyPage}
              onPageChange={setHistoryPage}
            />
          </TabsContent>

          <TabsContent value="workflow">
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

        <Dialog
          open={isStoreDialogOpen}
          onOpenChange={setIsStoreDialogOpen}
        ></Dialog>
        <Dialog
          open={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
        ></Dialog>

        {/* ✅ Reusable ConfirmDialog */}
        <ConfirmDialog
          open={isApprovalDialogOpen}
          onOpenChange={setIsApprovalDialogOpen}
          title={
            currentAction === "approve" ? "Approve Request?" : "Reject Request?"
          }
          description={`Are you sure you want to ${currentAction} this request? This action cannot be undone.`}
          confirmLabel={
            currentAction === "approve" ? "Yes, Approve" : "Yes, Reject"
          }
          confirmColor={currentAction === "approve" ? "green" : "red"}
          showTextarea={currentAction === "reject"}
          textareaLabel="Reason for Rejection"
          textareaValue={rejectionNote}
          onTextareaChange={setRejectionNote}
          disabled={currentAction === "reject" && !rejectionNote}
          onConfirm={handleApprovalAction}
        />
      </div>
    </div>
  );
};

export default AdminPanel;
