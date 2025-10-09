import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/services/api";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StatusBadge, Status } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Package,
  Calendar as CalendarIcon,
  History,
} from "lucide-react";
import { format } from "date-fns";
import { debounce } from "lodash";

interface Order {
  id: string;
  order_number: string;
  deadline: string;
  status: string;
  total_qty: number;
  notes?: string;
  requested_at: string;
}

const OrderHistoryPage = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(
    null
  );

  const debouncedFetch = useCallback(
    debounce(async (search, status) => {
      setLoading(true);
      try {
        const params = {
          ...(search && { search }),
          ...(status && { status }),
        };
        const data = await api.getOrderHistory(params);
        setOrders(
          data.sort(
            (a: any, b: any) =>
              new Date(b.requested_at).getTime() -
              new Date(a.requested_at).getTime()
          )
        );
        setError(null);
      } catch (err) {
        setError(t("orderHistory.fetchError"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [t]
  );

  useEffect(() => {
    debouncedFetch(searchTerm, activeStatusFilter);
    return () => debouncedFetch.cancel();
  }, [searchTerm, activeStatusFilter, debouncedFetch]);

  const handleFilterClick = (status: string | null) => {
    setActiveStatusFilter(status);
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const deadlineDate = new Date(order.deadline);
    const correctedDate = new Date(
      deadlineDate.getTime() + deadlineDate.getTimezoneOffset() * 60000
    );

    return (
      <div className="border border-amber-200 dark:border-gray-700 p-4 rounded-xl bg-gradient-to-br from-white to-amber-50 dark:from-gray-800/50 dark:to-gray-800/20 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shrink-0 shadow-md">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                Order #{order.order_number}
              </p>
            </div>
          </div>
          <div className="mt-2 sm:mt-0">
            <StatusBadge status={order.status as Status} />
          </div>
        </div>
        <div className="mt-4 border-t border-amber-100 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            <p>
              <strong>Quantity:</strong> {order.total_qty} items
            </p>
            {order.notes && (
              <p className="mt-1">
                <strong>Notes:</strong> {order.notes}
              </p>
            )}
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
            <CalendarIcon size={14} className="mr-2" />
            <span>
              <strong>Due Date:</strong> {format(correctedDate, "PPP")}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const filterButtons = [
    { label: t("orderHistory.all"), status: null },
    { label: t("orderHistory.fulfilled"), status: "Order Fulfilled" },
    { label: t("orderHistory.rejected"), status: "Rejected" },
    { label: t("orderHistory.cancelled"), status: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:via-black">
      <div className="relative z-10 p-6">
        <DashboardHeader title="Order History" icon={History} />
        <main className="mt-6">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-amber-200 dark:border-gray-800 shadow-2xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {t("orderHistory.title")}
              </CardTitle>
              <CardDescription>{t("orderHistory.subtitle")}</CardDescription>

              {/* Search and filters */}
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder={t("orderHistory.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {filterButtons.map(({ label, status }) => (
                    <Button
                      key={label}
                      variant={
                        activeStatusFilter === status ? "default" : "outline"
                      }
                      className={
                        "shrink-0 font-semibold transition-all duration-300 " +
                        (activeStatusFilter === status
                          ? "text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                          : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700")
                      }
                      onClick={() => handleFilterClick(status)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && <p className="text-red-500">{error}</p>}
              <div className="space-y-4 mt-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="border p-4 rounded-xl space-y-3 bg-white/70 dark:bg-gray-800/70 animate-pulse"
                    >
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-1/2 rounded" />
                        <Skeleton className="h-6 w-1/4 rounded" />
                      </div>
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-4 w-1/2 rounded" />
                    </div>
                  ))
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))
                ) : (
                  <EmptyState message={t("orderHistory.noOrders")} />
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
