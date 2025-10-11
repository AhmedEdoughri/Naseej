import { useState, useMemo, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 10;

export const RequestHistoryTab = ({
  requests,
  stores,
  currentPage,
  onPageChange,
}) => {
  const [selectedStore, setSelectedStore] = useState("all");
  const prevStoreRef = useRef(selectedStore);
  const [searchOrder, setSearchOrder] = useState("");

  // Only reset page if store actually changes
  useEffect(() => {
    if (prevStoreRef.current !== selectedStore) {
      onPageChange(1);
      prevStoreRef.current = selectedStore;
    }
  }, [selectedStore, onPageChange]);

  const filteredRequests = useMemo(() => {
    let filtered = requests;

    if (selectedStore !== "all") {
      filtered = filtered.filter((req) => req.store_id === selectedStore);
    }

    if (searchOrder.trim() !== "") {
      filtered = filtered.filter((req) =>
        req.order_number.toString().includes(searchOrder.trim())
      );
    }

    return filtered;
  }, [requests, selectedStore, searchOrder]);

  const { paginatedRequests, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filteredRequests.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
    const total = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
    return { paginatedRequests: paginated, totalPages: total > 0 ? total : 1 };
  }, [filteredRequests, currentPage]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const clearFilter = () => {
    setSelectedStore("all");
    setSearchOrder("");
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <CardTitle>Request History</CardTitle>

        {/* Filter panel */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="relative w-64">
            <Input
              placeholder="Search by Order #"
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
            />
            {searchOrder && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchOrder("")}
              >
                ✕
              </button>
            )}
          </div>

          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by store..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.store_id} value={store.store_id}>
                  {store.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={clearFilter} variant="outline">
            Clear Filter
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {filteredRequests.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Total Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.order_number}
                    </TableCell>
                    <TableCell>{request.storeName}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(request.deadline).toLocaleString()}
                    </TableCell>
                    <TableCell>{request.total_qty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <EmptyState message="No request history found for the selected filter." />
        )}
      </CardContent>
    </Card>
  );
};
