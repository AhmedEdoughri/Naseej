import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { InfoCard } from "@/components/InfoCard";
import { EmptyState } from "@/components/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building, LayoutGrid, List } from "lucide-react";

interface Store {
  store_id: string;
  storeName: string;
  address: string;
  city: string;
  storeNotes: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: string;
}

export const StoreInfoTab = ({ stores }: { stores: Store[] }) => {
  const [view, setView] = useState<"card" | "table">("card");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "Deactivated"
  >("all");

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return store.status !== "Deactivated";
      return store.status === statusFilter;
    });
  }, [stores, statusFilter]);

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 rounded-2xl mt-6 shadow-xl overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20">
        <div className="flex items-center space-x-3">
          <Building className="h-6 w-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Partner Stores
          </h2>
        </div>
        <div className="inline-flex rounded-full border border-amber-200 dark:border-gray-700 overflow-hidden">
          {["all", "active", "Deactivated"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors ${
                statusFilter === status
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                  : "bg-amber-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center w-full my-4">
        <div className="p-1 bg-amber-50 dark:bg-gray-800 rounded-lg flex items-center space-x-1">
          <Button
            variant={view === "card" ? "default" : "ghost"}
            size="icon"
            onClick={() => setView("card")}
            title="Card View"
            className={
              view === "card"
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                : "hover:bg-amber-100 dark:hover:bg-gray-700"
            }
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "table" ? "default" : "ghost"}
            size="icon"
            onClick={() => setView("table")}
            title="Table View"
            className={
              view === "table"
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                : "hover:bg-amber-100 dark:hover:bg-gray-700"
            }
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredStores.length > 0 ? (
        view === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 md:p-6">
            {filteredStores.map((store, index) => (
              <InfoCard
                key={store.store_id}
                item={store}
                type="customer"
                delay={index * 50}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto p-4 md:p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store) => (
                  <TableRow key={store.store_id}>
                    <TableCell>{store.storeName}</TableCell>
                    <TableCell>{store.contact_name}</TableCell>
                    <TableCell>{store.contact_phone}</TableCell>
                    <TableCell>
                      {store.address}, {store.city}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`capitalize px-3 py-1 text-xs font-semibold rounded-full ${
                          store.status === "Deactivated"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {store.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        <div className="p-4 md:p-6">
          <EmptyState message="No stores found." />
        </div>
      )}
    </div>
  );
};
