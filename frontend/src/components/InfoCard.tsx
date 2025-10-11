import { useEffect, useState } from "react";
import {
  User,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  FileText,
  Pencil,
  MapPin,
  Home,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CardProps {
  item: any;
  type: "user" | "customer";
  onEdit?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onDeny?: () => void;
  delay?: number;
}

export const InfoCard = ({
  item,
  type,
  onEdit,
  onDelete,
  onApprove,
  onDeny,
  delay = 0,
}: CardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const isUser = type === "user";
  const name = isUser ? item.name : item.storeName;
  const id = item.user_id || item.store_id;
  const roleOrStoreName = isUser ? item.roleName : item.contact_name;
  const email = isUser ? item.email : item.contact_email;
  const phone = isUser ? item.phone : item.contact_phone;
  const notes = isUser ? item.notes : item.storeNotes;
  const Icon = isUser ? User : Building;

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 animate-pulse";
      case "Deactivated":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div
      className={`
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm 
        border border-amber-200 dark:border-gray-800 
        rounded-2xl shadow-lg group relative overflow-hidden
        transform transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* --- EDIT BUTTON WITH TOOLTIP --- */}
      <div className="absolute top-1 right-4 z-30 flex items-center">
        {onEdit && (
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="
        h-9 w-9 bg-white/50 dark:bg-gray-800/50 rounded-full 
        opacity-0 group-hover:opacity-100 
        transition-all duration-300 
        hover:bg-amber-100 dark:hover:bg-gray-700 
        hover:scale-110 
        focus:scale-110 focus:opacity-100
        peer
      "
            >
              <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </Button>

            {/* EDIT TOOLTIP */}
            <div
              className="
      absolute top-1/2 -translate-y-1/2 right-full mr-2 px-3 py-1 
      bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20 dark:border-gray-800 text-xs font-semibold rounded-md
      opacity-0 scale-0 origin-right
      transition-all duration-300
      peer-hover:scale-100 peer-hover:opacity-100
    "
            >
              Edit
            </div>
          </div>
        )}
        {/* DELETE BUTTON */}
        {onDelete && (
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="
        h-9 w-9 bg-white/50 dark:bg-gray-800/50 rounded-full 
        opacity-0 group-hover:opacity-100 
        transition-all duration-300 
        hover:bg-red-100 dark:hover:bg-red-900/50 hover:scale-110
        focus:scale-110 focus:opacity-100
        peer
      "
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Button>

            {/* DELETE TOOLTIP */}
            <div
              className="
      absolute top-1/2 -translate-y-1/2 right-full mr-2 px-3 py-1 
      bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20 dark:border-gray-800 text-xs font-semibold rounded-md
      opacity-0 scale-0 origin-right
      transition-all duration-300
      peer-hover:scale-100 peer-hover:opacity-100
    "
            >
              Delete
            </div>
          </div>
        )}
      </div>

      <div className="p-5 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                User ID: {id}
              </p>
            </div>
          </div>
          <span
            className={`capitalize px-3 py-1 text-xs font-semibold rounded-full mt-6 ${getStatusClasses(
              item.status
            )}`} // mt-6 gives extra vertical gap
          >
            {item.status}
          </span>
        </div>

        <div className="mt-4 border-t border-amber-200 dark:border-gray-700 pt-4 space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <ShieldCheck className="h-4 w-4 mr-2 text-amber-500" />
            <span>{roleOrStoreName}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Mail className="h-4 w-4 mr-2 text-amber-500" />
            <span>{email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Phone className="h-4 w-4 mr-2 text-amber-500" />
            <span>{phone || "-"}</span>
          </div>

          {!isUser && (
            <>
              {/* Address */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 mr-2 text-amber-500" />
                <span>{item.address || "-"}</span>
              </div>

              {/* City */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Home className="h-4 w-4 mr-2 text-amber-500" />
                <span>{item.city || "-"}</span>
              </div>
            </>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2 text-amber-500" />
                <span className="underline truncate">
                  {notes ? "View Notes" : "No Notes"}
                </span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notes for {name}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap break-words pt-4">
                {notes || "No notes have been added."}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Approve / Deny buttons for pending users */}
      {type === "user" &&
        item.status === "pending" &&
        (onApprove || onDeny) && (
          <div className="flex justify-center space-x-2 mt-4">
            {onApprove && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Approve
              </Button>
            )}
            {onDeny && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeny();
                }}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Deny
              </Button>
            )}
          </div>
        )}
    </div>
  );
};
