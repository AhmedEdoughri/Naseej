import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApprovalQueueProps {
  requestsToShow: any[];
  stores: any[];
  onAction: (id: string, action: "approve" | "reject") => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  requestsToShow,
  stores,
  onAction,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [searchOrder, setSearchOrder] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");

  // Filter requests by order number and store reactively
  const filteredRequests = useMemo(() => {
    return requestsToShow.filter((req) => {
      const matchesStore =
        selectedStore === "all" || req.store_id === selectedStore;
      const matchesOrder =
        searchOrder.trim() === "" ||
        req.order_number.toString().includes(searchOrder.trim());
      return matchesStore && matchesOrder;
    });
  }, [requestsToShow, searchOrder, selectedStore]);

  const clearFilter = () => {
    setSearchOrder("");
    setSelectedStore("all");
  };

  return (
    <div>
      {/* Filter Panel */}
      <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm">
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

        <Button
          onClick={clearFilter}
          variant="outline"
          className="h-10 self-end"
        >
          Clear Filter
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Store Name</TableHead>
            <TableHead>Total Quantity</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.order_number}
                </TableCell>
                <TableCell>{request.storeName}</TableCell>
                <TableCell>{request.total_qty}</TableCell>
                <TableCell>
                  {new Date(request.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StatusBadge status="Pending Approval" />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => onAction(request.id, "approve")}
                    className="mr-2"
                    variant="outline"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => onAction(request.id, "reject")}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No orders match your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
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
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
