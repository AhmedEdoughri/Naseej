import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

interface Status {
  id: number;
  name: string;
  description: string;
  color: string;
  display_order: number;
}

interface DraggableStatusRowProps {
  status: Status;
  onEdit: (status: Status) => void;
  onDelete: (statusId: number) => void;
}

export const DraggableStatusRow = ({
  status,
  onEdit,
  onDelete,
}: DraggableStatusRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as const,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      <TableCell className="w-12 cursor-grab" {...listeners}>
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </TableCell>
      <TableCell>{status.display_order}</TableCell>
      <TableCell className="font-medium capitalize">{status.name}</TableCell>
      <TableCell>{status.description}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          {status.color}
        </div>
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(status)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(status.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
