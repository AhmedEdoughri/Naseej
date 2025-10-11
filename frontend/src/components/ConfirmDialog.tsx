import React from "react";
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

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmColor?: "green" | "red" | "amber" | "blue";
  onConfirm: () => void;
  showTextarea?: boolean;
  textareaValue?: string;
  onTextareaChange?: (value: string) => void;
  textareaLabel?: string;
  disabled?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Go Back",
  confirmColor = "green",
  onConfirm,
  showTextarea = false,
  textareaValue = "",
  onTextareaChange,
  textareaLabel = "Reason",
  disabled = false,
}) => {
  const colorClasses = {
    green: "bg-gradient-to-br from-green-500 to-green-700 border-green-400/30",
    red: "bg-gradient-to-br from-red-500 to-red-700 border-red-400/30",
    amber: "bg-gradient-to-br from-amber-500 to-amber-700 border-amber-400/30",
    blue: "bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400/30",
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white via-amber-50/20 to-yellow-50/10 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-800/50 backdrop-blur-sm border-2 border-amber-300 dark:border-amber-700/50 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-400 flex items-center gap-2">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="bg-amber-100/50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-amber-500 space-y-4">
          {showTextarea && (
            <div>
              <label
                htmlFor="rejection-note"
                className="text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                {textareaLabel}
              </label>
              <Textarea
                id="rejection-note"
                value={textareaValue}
                onChange={(e) => onTextareaChange?.(e.target.value)}
                placeholder="Type your note here..."
                className="mt-2 bg-white/50 dark:bg-gray-800/50 focus-visible:ring-amber-500 border-amber-300 dark:border-gray-600"
                rows={3}
              />
            </div>
          )}
          <AlertDialogDescription className="text-gray-700 dark:text-gray-300 text-base">
            {description}
          </AlertDialogDescription>
        </div>

        <AlertDialogFooter className="gap-2 mt-6">
          <AlertDialogCancel asChild>
            <button className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95">
              {cancelLabel}
            </button>
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={disabled}
            className={cn(
              "group relative px-5 py-2.5 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 border overflow-hidden",
              colorClasses[confirmColor],
              disabled &&
                "bg-gray-400 dark:bg-gray-600 cursor-not-allowed border-gray-300 dark:border-gray-500"
            )}
          >
            <span className="relative">{confirmLabel}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
