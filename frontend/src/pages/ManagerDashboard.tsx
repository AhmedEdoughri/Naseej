import { useState, useEffect, useMemo } from "react";
import { Package, AlertCircle, Truck, BarChart3 } from "lucide-react";
import { EnhancedMetricCard } from "@/components/EnhancedMetricCard";
import { ReportsTab } from "@/components/ReportsTab";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/services/api";
import { toast } from "sonner";
import { ApprovalQueue } from "@/components/ApprovalQueue";
import { StoreInfoTab } from "@/features/manager/StoreInfoTab";
import { request } from "http";

const ITEMS_PER_PAGE = 5;

export const ManagerDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchAndCheckRequests = async () => {
      try {
        const data = await api.getRequests();
        const pending = data.filter(
          (req: any) => req.status === "Pending Approval"
        );
        setPendingRequests((prev) => {
          if (pending.length > prev.length && prev.length > 0) {
            // Avoid toast on initial load
            toast.info("New approval request received!");
          }
          return pending;
        });
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
      }
    };

    const fetchStores = async () => {
      try {
        const response = await api.getStores();
        if (response && Array.isArray(response)) {
          setStores(response);
        } else {
          setStores([]);
        }
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      }
    };

    fetchAndCheckRequests();
    fetchStores();
    const interval = setInterval(fetchAndCheckRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const { paginatedRequests, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = pendingRequests.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
    const total = Math.ceil(pendingRequests.length / ITEMS_PER_PAGE);
    return { paginatedRequests: paginated, totalPages: total > 0 ? total : 1 };
  }, [pendingRequests, currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const handleAction = async () => {
    if (!currentRequestId || !currentAction) return;
    try {
      if (currentAction === "approve") {
        await api.approveRequest(currentRequestId);
        toast.success("Request approved successfully!");
      } else {
        await api.rejectRequest(currentRequestId, rejectionNote);
        toast.error("Request rejected.");
      }
      setPendingRequests((prev) =>
        prev.filter((req) => req.id !== currentRequestId)
      );
    } catch (error) {
      toast.error("Failed to update the request.");
    } finally {
      setIsDialogOpen(false);
      setCurrentRequestId(null);
      setCurrentAction(null);
      setRejectionNote("");
    }
  };

  const openDialog = (id: string, action: "approve" | "reject") => {
    setCurrentRequestId(id);
    setCurrentAction(action);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <EnhancedMetricCard
          title="Total Active"
          value={23}
          icon={Package}
          color="info"
        />
        <EnhancedMetricCard
          title="Pending Pickup"
          value={7}
          icon={AlertCircle}
          color="warning"
        />
        <EnhancedMetricCard
          title="Ready for Delivery"
          value={8}
          icon={Truck}
          color="primary"
        />
        <EnhancedMetricCard
          title="Daily Completions"
          value={15}
          icon={BarChart3}
          color="success"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList
          className="grid w-full grid-cols-5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 shadow-lg rounded-xl p-2"
          dir={i18n.dir()}
        >
          {/* ✅ THE FIX IS HERE */}
          <TabsTrigger
            value="approvals"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
          >
            Approval Queue
            {pendingRequests.length > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="stores"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
          >
            Stores
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
          >
            Reports
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
          >
            Store Performance
          </TabsTrigger>
          <TabsTrigger
            value="drivers"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300 hover:scale-105 gap-x-2"
          >
            Driver Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>New Orders Awaiting Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalQueue
                requestsToShow={paginatedRequests}
                stores={stores}
                onAction={openDialog}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores">
          <StoreInfoTab stores={stores} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Store Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Placeholder data */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Driver Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Placeholder data */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
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
        onConfirm={handleAction}
      />
    </div>
  );
};
