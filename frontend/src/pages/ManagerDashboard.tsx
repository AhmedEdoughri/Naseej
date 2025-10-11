import { useState, useEffect } from "react";
import { Package, AlertCircle, Truck, BarChart3 } from "lucide-react";
import { EnhancedMetricCard } from "@/components/EnhancedMetricCard";
import { ReportsTab } from "@/components/ReportsTab";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export const ManagerDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [rejectionNote, setRejectionNote] = useState("");

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const data = await api.getRequests();
        const pending = data.filter(
          (req: any) => req.status === "Pending Approval"
        );
        setPendingRequests(pending);
      } catch (error) {
        console.error("Failed to fetch pending requests:", error);
      }
    };
    fetchPendingRequests();
  }, []);

  const handleAction = async () => {
    if (!currentRequestId || !currentAction) return;

    try {
      if (currentAction === "approve") {
        await api.approveRequest(currentRequestId);
      } else {
        await api.rejectRequest(currentRequestId, rejectionNote);
      }
      setPendingRequests((prev) =>
        prev.filter((req) => req.id !== currentRequestId)
      );
    } catch (error) {
      console.error("Failed to perform action:", error);
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
      {/* --- Dashboard Metrics --- */}
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

      {/* --- New Orders Awaiting Approval --- */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl border border-amber-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>New Orders Awaiting Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Total Quantity</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.order_number}
                    </TableCell>
                    <TableCell>{request.total_qty}</TableCell>
                    <TableCell>
                      {new Date(request.deadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="Pending Approval" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => openDialog(request.id, "approve")}
                        className="mr-2"
                        variant="outline"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => openDialog(request.id, "reject")}
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No orders are currently pending approval.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Approve/Reject Confirmation Dialog --- */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white via-amber-50/20 to-yellow-50/10 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-800/50 backdrop-blur-sm border-2 border-amber-300 dark:border-amber-700/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400 flex items-center gap-2">
              {currentAction === "approve"
                ? "Approve Request?"
                : "Reject Request?"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          {/* --- CORRECTED STRUCTURE WITH SHARED BACKGROUND --- */}
          <div className="bg-amber-100/50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-amber-500 space-y-4">
            {/* Conditionally render the rejection reason input */}
            {currentAction === "reject" && (
              <div>
                <label
                  htmlFor="rejection-note"
                  className="text-sm font-medium text-gray-800 dark:text-gray-200"
                >
                  Reason for Rejection
                </label>
                <Textarea
                  id="rejection-note"
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Provide a clear reason for rejection..."
                  className="mt-2 bg-white/50 dark:bg-gray-800/50 focus-visible:ring-amber-500 border-amber-300 dark:border-gray-600"
                  rows={3}
                />
              </div>
            )}

            {/* The main description text */}
            <AlertDialogDescription className="text-gray-700 dark:text-gray-300 text-base">
              Are you sure you want to {currentAction} this request? This action
              cannot be undone.
            </AlertDialogDescription>
          </div>

          <AlertDialogFooter className="gap-2 mt-6">
            <AlertDialogCancel asChild>
              <button className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95">
                Go Back
              </button>
            </AlertDialogCancel>
            <AlertDialogAction
              // Disable button if rejecting without a note
              disabled={currentAction === "reject" && !rejectionNote}
              className={cn(
                "group relative px-5 py-2.5 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 border overflow-hidden",
                currentAction === "approve"
                  ? "bg-gradient-to-br from-green-500 to-green-700 border-green-400/30"
                  : "bg-gradient-to-br from-red-500 to-red-700 border-red-400/30",
                // Add disabled styling
                currentAction === "reject" &&
                  !rejectionNote &&
                  "bg-gray-400 dark:bg-gray-600 cursor-not-allowed border-gray-300 dark:border-gray-500"
              )}
              onClick={handleAction}
            >
              <span className="relative">
                {currentAction === "approve" ? "Yes, Approve" : "Yes, Reject"}
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Reports Section --- */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-800">
        <ReportsTab />
      </div>

      {/* --- Store Performance + Driver Status --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Performance */}
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

        {/* Driver Status */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-800">
          <h3 className="font-bold text-xl mb-6 text-gray-800 dark:text-gray-200">
            Driver Status
          </h3>
          <div className="space-y-4">
            {[
              {
                driver: "Ahmed Al-Rashid",
                status: "Out for Delivery",
                tasks: 3,
              },
              { driver: "Omar Hassan", status: "Ready for Pickup", tasks: 0 },
              {
                driver: "Yusuf Mohammed",
                status: "Out for Delivery",
                tasks: 2,
              },
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
                <StatusBadge status={driver.status as any} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
