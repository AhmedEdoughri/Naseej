import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  AlertCircle,
  BarChart3,
  PlusCircle,
  Pencil,
  XCircle,
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  Minus, // <-- NEW ICON
  Plus, // <-- NEW ICON
} from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Custom Components
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { EnhancedMetricCard } from "@/components/EnhancedMetricCard";
import { NewOrderForm } from "../NewOrderForm";
import { api } from "@/services/api";
import { EmptyState } from "@/components/EmptyState";

// AnimatedRequestCard component remains the same
const AnimatedRequestCard = ({
  request,
  onClick,
  isSelected,
  delay = 0,
  onCancel,
  onEditNotes,
}: {
  request: any;
  onClick: () => void;
  isSelected: boolean;
  delay?: number;
  onCancel: (id: string) => void;
  onEditNotes: (request: any) => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        `
        p-4 cursor-pointer
        bg-gradient-to-r from-white to-amber-50 dark:from-gray-800/50 dark:to-gray-800/20
        rounded-xl border
        transition-all duration-300 hover:scale-102 hover:shadow-lg`,
        isSelected
          ? "border-amber-500 shadow-md"
          : "border-amber-200 dark:border-gray-700"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
            <Package className="text-white" size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200 break-all">
              Order #{request.order_number}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {request.total_qty} items
            </p>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <CalendarIcon size={14} className="mr-1" />
              <span>Due: {format(new Date(request.deadline), "PPP")}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between h-full gap-2">
          {request.status && <StatusBadge status={request.status} />}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditNotes(request);
              }}
              className="group relative p-2.5 bg-gradient-to-br from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 dark:from-amber-900/30 dark:to-yellow-900/30 dark:hover:from-amber-800/40 dark:hover:to-yellow-800/40 rounded-lg border-2 border-amber-300 dark:border-amber-700/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 overflow-hidden"
              title="Edit Notes"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-amber-200/0 via-yellow-200/40 to-amber-200/0 dark:from-amber-600/0 dark:via-amber-500/20 dark:to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Pencil
                size={18}
                className="relative text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors"
              />
            </button>
            {request.status === "requested" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(request.id);
                }}
                className="group relative p-2.5 bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 dark:from-red-900/30 dark:to-red-800/30 dark:hover:from-red-800/40 dark:hover:to-red-700/40 rounded-lg border-2 border-red-300 dark:border-red-700/50 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 overflow-hidden"
                title="Cancel Request"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-200/0 via-red-200/40 to-red-200/0 dark:from-red-600/0 dark:via-red-500/20 dark:to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <XCircle
                  size={18}
                  className="relative text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomerDashboard = () => {
  const { t } = useTranslation();
  // ... (all existing state remains the same)
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditNotesOpen, setIsEditNotesOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any | null>(null);
  const [editedNotes, setEditedNotes] = useState("");
  const [requestToCancel, setRequestToCancel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [filterQuantity, setFilterQuantity] = useState<number[]>([0, 500]);
  const maxQuantity = useMemo(() => {
    if (requests.length === 0) return 500;
    const max = Math.max(...requests.map((r) => r.total_qty));
    return max > 500 ? max : 500;
  }, [requests]);
  useEffect(() => {
    setFilterQuantity([0, maxQuantity]);
  }, [maxQuantity]);

  // ... (all existing functions like fetchRequests, etc. remain the same)
  const fetchRequests = async () => {
    try {
      const data = await api.getRequests();
      setRequests(data);
      if (data.length > 0 && !selectedItem) {
        setSelectedItem(data[0].id);
      } else if (data.length === 0) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, [isFormOpen]);
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchTermMatch =
        searchTerm === "" || String(request.order_number).includes(searchTerm);
      const dateMatch =
        !filterDate ||
        new Date(request.deadline).toDateString() === filterDate.toDateString();
      const quantityMatch =
        request.total_qty >= filterQuantity[0] &&
        request.total_qty <= filterQuantity[1];
      return searchTermMatch && dateMatch && quantityMatch;
    });
  }, [requests, searchTerm, filterDate, filterQuantity]);
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDate(undefined);
    setFilterQuantity([0, maxQuantity]);
  };
  const confirmCancelRequest = async () => {
    if (requestToCancel) {
      try {
        await api.cancelRequest(requestToCancel);
        fetchRequests();
      } catch (error) {
        console.error("Failed to cancel request:", error);
      } finally {
        setRequestToCancel(null);
      }
    }
  };
  const handleEditNotes = (request: any) => {
    setEditingRequest(request);
    setEditedNotes(request.notes || "");
    setIsEditNotesOpen(true);
  };
  const handleUpdateNotes = async () => {
    if (!editingRequest) return;
    try {
      await api.updateRequestNotes(editingRequest.id, editedNotes);
      setIsEditNotesOpen(false);
      setEditingRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  };
  const selectedRequest = requests.find((req) => req.id === selectedItem);
  const { activeRequests, itemsInProcess, completedThisMonth } = useMemo(() => {
    const active = requests.filter(
      (r) => r.status !== "completed" && r.status !== "cancelled"
    );
    const completed = requests.filter(
      (r) =>
        r.status === "completed" &&
        new Date(r.requested_at).getMonth() === new Date().getMonth()
    );
    const items = active.reduce((sum, r) => sum + r.total_qty, 0);
    return {
      activeRequests: active.length,
      itemsInProcess: items,
      completedThisMonth: completed.length,
    };
  }, [requests]);

  return (
    <div className="space-y-8">
      {/* ... (Header and Metric Cards remain the same) ... */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t("customerDashboard")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboardSubtitle_customer")}
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className={cn(
                "gap-2 w-full sm:w-auto font-semibold text-white transition-all duration-300",
                "bg-gradient-to-r from-amber-500 to-yellow-500",
                "hover:from-amber-600 hover:to-yellow-600 hover:scale-105"
              )}
            >
              <PlusCircle size={20} />
              {t("placeNewOrder")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-amber-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-gray-200">
                {t("placeNewOrder")}
              </DialogTitle>
            </DialogHeader>
            <NewOrderForm onSuccess={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnhancedMetricCard
          title="Active Requests"
          value={activeRequests}
          icon={Package}
          color="info"
          delay={0}
        />
        <EnhancedMetricCard
          title="Items in Process"
          value={itemsInProcess}
          icon={AlertCircle}
          color="warning"
          delay={200}
        />
        <EnhancedMetricCard
          title="Completed This Month"
          value={completedThisMonth}
          icon={BarChart3}
          color="success"
          trend={{ value: 12, isPositive: true }}
          delay={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-gray-800">
          <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-200">
            {t("recentRequests")}
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by Order #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-amber-300 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  <Filter className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-amber-200 dark:border-gray-800">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filter Orders</h4>
                    <p className="text-sm text-muted-foreground">
                      Adjust the filters to find specific orders.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Calendar
                      mode="single"
                      selected={filterDate}
                      onSelect={setFilterDate}
                      className="rounded-md border border-amber-200 dark:border-gray-700"
                      classNames={{
                        day_selected:
                          "bg-amber-500 text-white hover:bg-amber-600 focus:bg-amber-600",
                        day_today:
                          "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200",
                      }}
                    />
                  </div>

                  {/* --- NEW: ENHANCED QUANTITY FILTER --- */}
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Quantity Range
                    </label>
                    <Slider
                      min={0}
                      max={maxQuantity}
                      step={1}
                      value={filterQuantity}
                      onValueChange={setFilterQuantity}
                      className="[&>span:first-child]:bg-amber-500"
                    />
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setFilterQuantity([
                              Math.max(0, filterQuantity[0] - 1),
                              filterQuantity[1],
                            ])
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={filterQuantity[0]}
                          onChange={(e) =>
                            setFilterQuantity([
                              Number(e.target.value),
                              filterQuantity[1],
                            ])
                          }
                          className="w-20 h-8 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setFilterQuantity([
                              filterQuantity[0] + 1,
                              filterQuantity[1],
                            ])
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setFilterQuantity([
                              filterQuantity[0],
                              Math.max(0, filterQuantity[1] - 1),
                            ])
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={filterQuantity[1]}
                          onChange={(e) =>
                            setFilterQuantity([
                              filterQuantity[0],
                              Number(e.target.value),
                            ])
                          }
                          className="w-20 h-8 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setFilterQuantity([
                              filterQuantity[0],
                              filterQuantity[1] + 1,
                            ])
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* --- NEW: STYLED CLEAR FILTER BUTTON --- */}
                  <Button
                    onClick={clearFilters}
                    className={cn(
                      "w-full font-semibold text-white transition-all duration-300",
                      "bg-gradient-to-r from-amber-500 to-yellow-500",
                      "hover:from-amber-600 hover:to-yellow-600 hover:scale-105"
                    )}
                  >
                    <X className="mr-2 h-4 w-4" /> Clear All Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request, index) => (
                <AnimatedRequestCard
                  key={request.id}
                  request={request}
                  onClick={() => setSelectedItem(request.id)}
                  isSelected={selectedItem === request.id}
                  delay={index * 150}
                  onCancel={() => setRequestToCancel(request.id)}
                  onEditNotes={handleEditNotes}
                />
              ))
            ) : (
              <EmptyState message="No orders match your filters." />
            )}
          </div>
        </div>

        {selectedItem && selectedRequest && (
          <div className="transform transition-all duration-700 ease-out">
            <StatusTimeline
              currentStatus={selectedRequest.status as any}
              itemId={selectedItem}
              orderNumber={selectedRequest.order_number}
            />
          </div>
        )}
      </div>

      {/* ... Dialogs ... */}
      <Dialog open={isEditNotesOpen} onOpenChange={setIsEditNotesOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-amber-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-200">
              Edit Notes for Order #{editingRequest?.order_number}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            rows={5}
            placeholder="Add your notes here..."
            className="bg-white/50 dark:bg-gray-800/50 focus-visible:ring-amber-500"
          />
          <Button
            onClick={handleUpdateNotes}
            className={cn(
              "w-full font-semibold text-white transition-all duration-300",
              "bg-gradient-to-r from-amber-500 to-yellow-500",
              "hover:from-amber-600 hover:to-yellow-600 hover:scale-105"
            )}
          >
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!requestToCancel}
        onOpenChange={() => setRequestToCancel(null)}
      >
        <AlertDialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white via-amber-50/20 to-yellow-50/10 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-800/50 backdrop-blur-sm border-2 border-amber-300 dark:border-amber-700/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              Cancel Request?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 dark:text-gray-300 text-base mt-3 bg-amber-100/50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-amber-500">
              This action cannot be undone. Your request will be permanently
              cancelled and removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-6">
            <AlertDialogCancel asChild>
              <button className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95">
                Go Back
              </button>
            </AlertDialogCancel>
            <AlertDialogAction
              className="group relative px-5 py-2.5 bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-red-400/30 overflow-hidden"
              onClick={confirmCancelRequest}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative">Yes, Cancel Request</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
