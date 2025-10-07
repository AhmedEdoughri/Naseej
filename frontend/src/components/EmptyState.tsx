import { Inbox } from "lucide-react";

export const EmptyState = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl mt-6">
      <Inbox className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        {message}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        There is currently no data to display here.
      </p>
    </div>
  );
};
