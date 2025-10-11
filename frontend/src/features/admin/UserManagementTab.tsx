import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { Input } from "@/components/ui/input";
import { Button, ButtonProps } from "@/components/ui/button"; // Import ButtonProps
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  Trash2,
  Pencil,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  X,
  LayoutGrid,
  List,
  Clock,
  Users,
} from "lucide-react";
import { InfoCard } from "@/components/InfoCard";
import { EmptyState } from "@/components/EmptyState";
import { UserForm } from "@/components/UserForm";

// --- Type Definitions ---
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  roleName: string;
  role_id: number;
  status: string;
  user_id: number;
}

type SortKey = keyof User;

// --- Helper Components ---
const AnimatedTableRow = ({
  children,
  delay = 0,
  isPending = false,
}: {
  children: React.ReactNode;
  delay?: number;
  isPending?: boolean;
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
      } ${
        isPending
          ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-600"
          : "dark:border-gray-800"
      } group cursor-pointer`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </TableRow>
  );
};

// MODIFICATION: Corrected the props for AnimatedActionButton
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
export const UserManagementTab = ({
  users,
  roles,
  onUserSubmit,
  onDeleteUser,
  onApproveUser,
  onDenyRegistration,
}) => {
  const { t, i18n } = useTranslation();
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userTab, setUserTab] = useState("all");
  const [userView, setUserView] = useState<"card" | "table">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>({ key: "name", direction: "ascending" });
  const [userStatusFilter, setUserStatusFilter] = useState<
    "all" | "active" | "Deactivated"
  >("all");

  const processUsers = (userList: User[]) => {
    // This logic is now combined into filteredUsers and sortedUsers below
    return userList;
  };

  const pendingUsers = useMemo(
    () => users.filter((user) => user.status === "pending"),
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(user.user_id).includes(searchTerm);

      const statusMatch =
        userStatusFilter === "all" || user.status === userStatusFilter;

      return searchMatch && statusMatch;
    });
  }, [users, searchTerm, userStatusFilter]);

  const sortedAndFilteredUsers = useMemo(() => {
    let sortableItems = [...filteredUsers];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredUsers, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const SortableHeader = ({ sortKey, children, className }) => {
    const isActive = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction;

    return (
      <TableHead className={className}>
        <Button
          variant="ghost"
          size="default"
          onClick={() => requestSort(sortKey)}
          className={`hover:bg-transparent hover:text-amber-700 dark:hover:text-amber-400 ${
            isActive ? "text-amber-600 dark:text-amber-400 font-semibold" : ""
          }`}
        >
          {children}
          <ArrowUpDown
            className={`ml-2 h-4 w-4 transition-transform ${
              isActive && direction === "descending" ? "rotate-180" : ""
            }`}
          />
        </Button>
      </TableHead>
    );
  };

  const renderUserTable = (userList: User[], startDelay = 0) => (
    <Table dir={i18n.dir()} className="w-full">
      <TableHeader>
        <TableRow className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20 dark:border-gray-800">
          <SortableHeader
            sortKey="name"
            className="whitespace-nowrap text-center"
          >
            {t("adminPanel.tableHeaders.name")}
          </SortableHeader>
          <SortableHeader sortKey="user_id" className="text-center">
            {t("adminPanel.tableHeaders.userId", "User ID")}
          </SortableHeader>
          <SortableHeader
            sortKey="email"
            className="whitespace-nowrap text-center"
          >
            {t("adminPanel.tableHeaders.email")}
          </SortableHeader>
          <TableHead className="whitespace-nowrap text-center">
            {t("adminPanel.tableHeaders.phone")}
          </TableHead>
          <SortableHeader
            sortKey="roleName"
            className="whitespace-nowrap text-center"
          >
            {t("adminPanel.tableHeaders.role")}
          </SortableHeader>
          <SortableHeader
            sortKey="status"
            className="whitespace-nowrap text-center"
          >
            {t("adminPanel.tableHeaders.status")}
          </SortableHeader>
          <TableHead className="whitespace-nowrap text-center">
            {t("adminPanel.tableHeaders.notes")}
          </TableHead>
          <TableHead className="text-center whitespace-nowrap">
            {t("adminPanel.tableHeaders.actions")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList.map((user, index) => (
          <AnimatedTableRow
            key={user.id}
            delay={startDelay + index * 100}
            isPending={user.status === "pending"}
          >
            <TableCell className="font-medium text-center">
              {user.name}
            </TableCell>
            <TableCell className="text-center">{user.user_id}</TableCell>
            <TableCell className="text-center">{user.email}</TableCell>
            <TableCell className="text-center">{user.phone || "-"}</TableCell>
            <TableCell className="text-center">
              <span className="capitalize px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium dark:bg-amber-900/50 dark:text-amber-300">
                {t(`adminPanel.roles.${user.roleName.toLowerCase()}`, {
                  defaultValue: user.roleName,
                })}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <span
                className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                    : user.status === "Deactivated"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                }`}
              >
                {t(`adminPanel.statuses.${user.status.toLowerCase()}`, {
                  defaultValue: user.status,
                })}
              </span>
            </TableCell>
            <TableCell className="text-center">
              <p
                className="max-w-[150px] truncate cursor-pointer text-sm text-gray-600 underline hover:text-amber-700 transition-colors duration-300 dark:text-gray-400 dark:hover:text-amber-400 mx-auto"
                title={user.notes || ""}
              >
                {user.notes || "-"}
              </p>
            </TableCell>
            <TableCell className="text-center space-x-1">
              {user.status === "pending" ? (
                <>
                  <AnimatedActionButton
                    onClick={() => onApproveUser(user.id)}
                    title={t("adminPanel.users.approve")}
                    className="hover:bg-green-100 hover:border-green-300 dark:hover:bg-green-900/50 dark:hover:border-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </AnimatedActionButton>
                  <AnimatedActionButton
                    onClick={() => onDenyRegistration(user.id)}
                    title={t("adminPanel.users.deny")}
                    className="hover:bg-red-100 hover:border-red-300 dark:hover:bg-red-900/50 dark:hover:border-red-700"
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                  </AnimatedActionButton>
                </>
              ) : (
                <>
                  <AnimatedActionButton
                    onClick={() => {
                      setEditingUser(user);
                      setIsUserDialogOpen(true);
                    }}
                    title="Edit User"
                  >
                    <Pencil className="h-4 w-4" />
                  </AnimatedActionButton>
                  <AnimatedActionButton
                    onClick={() => onDeleteUser(user.id)}
                    className="hover:bg-red-100 hover:border-red-300 dark:hover:bg-red-900/50 dark:hover:border-red-700"
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </AnimatedActionButton>
                </>
              )}
            </TableCell>
          </AnimatedTableRow>
        ))}
      </TableBody>
    </Table>
  );

  const handleUserSubmitWrapper = async (formData) => {
    const success = await onUserSubmit(formData, editingUser);
    if (success) {
      setIsUserDialogOpen(false);
      setEditingUser(null);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-amber-200 dark:border-gray-800 rounded-2xl mt-6 shadow-xl overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-amber-200 dark:border-gray-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800/50 dark:to-gray-800/20 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder={t("adminPanel.users.filterPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${
              i18n.dir() === "rtl" ? "pl-8 text-right" : "pr-8 text-left"
            } border-amber-200 focus:border-amber-400 focus:ring-amber-400 dark:bg-gray-800 dark:border-gray-700 dark:focus:border-amber-500 dark:focus:ring-amber-500`}
          />
          {searchTerm && (
            <AnimatedActionButton
              title="Clear search"
              className={`absolute top-0 h-full px-3 ${
                i18n.dir() === "rtl" ? "left-0" : "right-0"
              }`}
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </AnimatedActionButton>
          )}
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="inline-flex rounded-full border border-amber-200 dark:border-gray-700 overflow-hidden">
            {["all", "active", "Deactivated"].map((status, index) => (
              <button
                key={status}
                onClick={() => setUserStatusFilter(status as any)}
                className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors ${
                  userStatusFilter === status
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

        <AnimatedActionButton
          size="default"
          title="Add a New User"
          onClick={() => {
            setEditingUser(null);
            setIsUserDialogOpen(true);
          }}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 shadow-lg"
        >
          <UserPlus className="h-4 w-4 mr-2" />{" "}
          {t("adminPanel.users.addNewUser")}
        </AnimatedActionButton>
      </div>

      <div className="flex justify-center w-full">
        <div className="p-1 bg-amber-50 dark:bg-gray-800 rounded-lg flex items-center space-x-1">
          <Button
            variant={userView === "card" ? "default" : "ghost"}
            size="icon"
            onClick={() => setUserView("card")}
            title="Card View"
            className={
              userView === "card"
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                : "hover:bg-amber-100 dark:hover:bg-gray-700"
            }
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={userView === "table" ? "default" : "ghost"}
            size="icon"
            onClick={() => setUserView("table")}
            title="Table View"
            className={
              userView === "table"
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow"
                : "hover:bg-amber-100 dark:hover:bg-gray-700"
            }
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={userTab} onValueChange={setUserTab} className="w-full">
        <TabsList
          className={`w-full flex ${
            i18n.dir() === "rtl" ? "flex-row-reverse" : "flex-row"
          } justify-start rounded-none bg-amber-50/50 dark:bg-gray-800/30 p-0 border-b border-amber-200 dark:border-gray-800`}
        >
          <TabsTrigger
            value="all"
            className={`flex-1 flex items-center ${
              i18n.dir() === "rtl" ? "justify-end" : "justify-start"
            } px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-amber-700 font-medium dark:data-[state=active]:text-amber-400 gap-x-2`}
          >
            <Users
              className={`h-4 w-4 ${
                i18n.dir() === "rtl" ? "ml-2 mr-0" : "mr-2"
              }`}
            />
            {t("adminPanel.users.allUsers")}
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className={`flex-1 flex items-center ${
              i18n.dir() === "rtl" ? "justify-end" : "justify-start"
            } px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-amber-700 font-medium dark:data-[state=active]:text-amber-400 gap-x-2`}
          >
            <Clock
              className={`h-4 w-4 ${
                i18n.dir() === "rtl" ? "ml-2 mr-0" : "mr-2"
              }`}
            />
            {t("adminPanel.users.pendingRequests")}
            {pendingUsers.length > 0 && (
              <span
                className={`${
                  i18n.dir() === "rtl" ? "mr-2 ml-0" : "ml-2"
                } bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-sm`}
              >
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="p-4 md:p-6">
          {sortedAndFilteredUsers.length > 0 ? (
            userView === "card" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedAndFilteredUsers.map((user, index) => (
                  <InfoCard
                    key={user.id}
                    item={user}
                    type="user"
                    delay={index * 50}
                    onEdit={() => {
                      setEditingUser(user);
                      setIsUserDialogOpen(true);
                    }}
                    onDelete={() => onDeleteUser(user.id)}
                  />
                ))}
              </div>
            ) : (
              renderUserTable(sortedAndFilteredUsers)
            )
          ) : (
            <EmptyState message="No users found." />
          )}
        </TabsContent>
        <TabsContent value="pending" className="p-4 md:p-6">
          {pendingUsers.length > 0 ? (
            userView === "card" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pendingUsers.map((user, index) => (
                  <InfoCard
                    key={user.id}
                    item={user}
                    type="user"
                    delay={index * 50}
                    onEdit={() => {
                      setEditingUser(user);
                      setIsUserDialogOpen(true);
                    }}
                    onDelete={() => onDeleteUser(user.id)}
                    onApprove={() => onApproveUser(user.id)}
                    onDeny={() => onDenyRegistration(user.id)}
                  />
                ))}
              </div>
            ) : (
              renderUserTable(pendingUsers)
            )
          ) : (
            <EmptyState message="No pending user requests." />
          )}
        </TabsContent>
      </Tabs>
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-amber-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-x-2">
              <Users className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
              {editingUser
                ? t("adminPanel.users.editUser")
                : t("adminPanel.users.createUser")}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={editingUser}
            roles={roles.filter((role) => role.name !== "customer")}
            onSubmit={handleUserSubmitWrapper}
            onClose={() => {
              setIsUserDialogOpen(false);
              setEditingUser(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
