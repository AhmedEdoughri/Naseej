import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, type ButtonProps } from "@/components/ui/button"; // MODIFICATION: Import ButtonProps
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StoreForm } from "@/components/StoreForm";
import {
  Building,
  PlusCircle,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
} from "lucide-react";

// --- Type Definitions ---
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

interface CustomerManagementTabProps {
  stores: Store[];
  onStoreSubmit: (
    formData: StoreFormData,
    editingStore: StoreFormData | null
  ) => Promise<boolean>;
  onDeleteStore: (storeId: string) => void;
  viewMode: "card" | "table";
  setViewMode: (mode: "card" | "table") => void;
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

// --- Reusable Helper Components ---
const AnimatedTableRow = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <TableRow
      className={`transform transition-all duration-500 ease-out hover:from-amber-50 hover:to-yellow-50 dark:hover:bg-gray-800/50 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      } dark:border-gray-800 group cursor-pointer`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </TableRow>
  );
};

// MODIFICATION: Corrected props for AnimatedActionButton
interface AnimatedActionButtonProps {
  children: React.ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  onClick?: () => void;
  title?: string;
  className?: string;
}

const AnimatedActionButton = ({
  children,
  variant = "ghost",
  size = "icon",
  onClick,
  title,
  className = "",
}: AnimatedActionButtonProps) => (
  <Button
    variant={variant}
    size={size}
    onClick={onClick}
    title={title}
    className={`transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-amber-100 hover:border-amber-300 dark:hover:bg-gray-800 dark:hover:border-amber-700 ${className}`}
  >
    {children}
  </Button>
);

// --- Main Component ---
export const CustomerManagementTab = ({
  stores,
  onStoreSubmit,
  onDeleteStore,
  viewMode,
  setViewMode,
}: CustomerManagementTabProps) => {
  const { t } = useTranslation();
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreFormData | null>(null);

  const [customerStatusFilter, setCustomerStatusFilter] = useState<
    "all" | "active" | "Deactivated"
  >("all");

  const filteredCustomers = useMemo(() => {
    return stores.filter((customer) => {
      if (customerStatusFilter === "all") return true;
      // Handle both "active" and specific statuses like "pending"
      if (customerStatusFilter === "active")
        return customer.status !== "Deactivated";
      return customer.status === customerStatusFilter;
    });
  }, [stores, customerStatusFilter]);

  const handleEditClick = (customer: Store) => {
    const formCompatibleStore: StoreFormData = {
      id: customer.store_id,
      name: customer.contact_name,
      email: customer.contact_email,
      phone: customer.contact_phone,
      storeName: customer.storeName,
      address: customer.address,
      city: customer.city,
      notes: customer.storeNotes,
    };
    setEditingStore(formCompatibleStore);
    setIsStoreDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingStore(null);
    setIsStoreDialogOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const success = await onStoreSubmit(formData, editingStore);
    if (success) {
      setIsStoreDialogOpen(false);
      setEditingStore(null);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 rounded-2xl mt-6 shadow-xl overflow-hidden">
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
        <Button // MODIFICATION: Changed to a regular Button as AnimatedActionButton expects different props by default
          size="default"
          title="Add New Customer"
          onClick={handleAddNewClick}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg hover:from-amber-500 hover:to-yellow-600 transform transition-transform hover:scale-105"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add a New Customer
        </Button>
      </div>

      <div className="flex justify-center w-full my-4">
        <div className="p-1 bg-amber-50 dark:bg-gray-800 rounded-lg flex items-center space-x-1">
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("card")}
            title="Card View"
            className={
              viewMode === "card"
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                : "hover:bg-amber-100 dark:hover:bg-gray-700"
            }
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
            title="Table View"
            className={
              viewMode === "table"
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                : "hover:bg-amber-100 dark:hover:bg-gray-700"
            }
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredCustomers.length > 0 ? (
        viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 md:p-6">
            {filteredCustomers.map((customer, index) => (
              <InfoCard
                key={customer.store_id}
                item={customer}
                type="customer"
                delay={index * 50}
                onEdit={() => handleEditClick(customer)}
                onDelete={() => onDeleteStore(customer.store_id)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto p-4 md:p-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20">
                  <TableHead className="text-center">Store Name</TableHead>
                  <TableHead className="text-center">Contact Name</TableHead>
                  <TableHead className="text-center">User ID</TableHead>
                  <TableHead className="text-center">Phone</TableHead>
                  <TableHead className="text-center">Address</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((store, index) => (
                  <AnimatedTableRow key={store.store_id} delay={index * 100}>
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
                      {store.address}, {store.city}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`capitalize px-3 py-1 text-xs font-semibold rounded-full ${
                          store.status === "Deactivated"
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
                    <TableCell className="text-center space-x-2">
                      <AnimatedActionButton
                        onClick={() => handleEditClick(store)}
                        title="Edit Store"
                      >
                        <Pencil className="h-4 w-4" />
                      </AnimatedActionButton>
                      <AnimatedActionButton
                        onClick={() => onDeleteStore(store.store_id)}
                        title="Delete Store"
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

      <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-6 w-6 text-amber-500" />
              <span>
                {editingStore ? "Edit Customer Details" : "Add New Customer"}
              </span>
            </DialogTitle>
          </DialogHeader>
          <StoreForm
            store={editingStore}
            onSubmit={handleFormSubmit}
            onClose={() => setIsStoreDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
