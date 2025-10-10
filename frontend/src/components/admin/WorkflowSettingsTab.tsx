import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { StatusForm } from "@/components/StatusForm";
import { DraggableStatusRow } from "@/components/DraggableStatusRow";
import { Workflow, PlusCircle, Save, X, Sparkles } from "lucide-react";

// --- Type Definition ---
interface Status {
  id: number;
  name: string;
  description: string;
  color: string;
  display_order: number;
}

// --- Reusable Helper Component ---
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
export const WorkflowSettingsTab = ({
  statuses,
  onDragEnd,
  onSaveOrder,
  onCancelReorder,
  hasOrderChanged,
  onStatusSubmit,
  onDeleteStatus,
}) => {
  const { t } = useTranslation();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleAddNewClick = () => {
    setEditingStatus(null);
    setIsStatusDialogOpen(true);
  };

  const handleEditClick = (status: Status) => {
    setEditingStatus(status);
    setIsStatusDialogOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const success = await onStatusSubmit(formData, editingStatus);
    if (success) {
      setIsStatusDialogOpen(false);
      setEditingStatus(null);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 rounded-2xl p-6 mt-6 shadow-xl">
      <div className="flex justify-between items-center mb-6 flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500">
            <Workflow className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Workflow Statuses
          </h2>
        </div>
        <div className="flex items-center space-x-2 flex-wrap">
          {hasOrderChanged && (
            <>
              <AnimatedActionButton
                onClick={onCancelReorder}
                variant="outline"
                size="default"
                title="Cancel reorder"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                <X className="h-4 w-4 mr-2" /> Cancel
              </AnimatedActionButton>
              <AnimatedActionButton
                onClick={onSaveOrder}
                size="default"
                title="Save order"
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" /> Save Order
              </AnimatedActionButton>
            </>
          )}
          <AnimatedActionButton
            size="default"
            title="Add New Status"
            onClick={handleAddNewClick}
            className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 shadow-lg"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add a New Status
          </AnimatedActionButton>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-amber-200 dark:border-gray-800">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={statuses}
            strategy={verticalListSortingStrategy}
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20 dark:border-gray-800">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Order
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Description
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Color
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.map((status) => (
                  <DraggableStatusRow
                    key={status.id}
                    status={status}
                    onEdit={handleEditClick}
                    onDelete={onDeleteStatus}
                  />
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-amber-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
              {editingStatus ? "Edit Status" : "Create a New Status"}
            </DialogTitle>
            <DialogDescription>
              {editingStatus
                ? "Update the details for this status."
                : "Add a new status to the workflow."}
            </DialogDescription>
          </DialogHeader>
          <StatusForm
            status={editingStatus}
            statuses={statuses}
            onSubmit={handleFormSubmit}
            onClose={() => setIsStatusDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
