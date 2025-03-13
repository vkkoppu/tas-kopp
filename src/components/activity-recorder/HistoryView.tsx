
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityRecord } from "./types";
import { Task } from "@/types/task";

interface HistoryViewProps {
  records: ActivityRecord[];
  tasks: Task[];
}

export const HistoryView = ({ records, tasks }: HistoryViewProps) => {
  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : null;
  };

  // Sort records by date (newest first)
  const sortedRecords = [...records].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const validRecords = sortedRecords.filter(record => getTaskTitle(record.taskId) !== null);

  return (
    <ScrollArea className="flex-1 border rounded-md p-4 bg-pastel-purple/10">
      {validRecords.length > 0 ? (
        <div className="space-y-4">
          {validRecords.map((record, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-4 border-b last:border-0 bg-pastel-purple/20 rounded-lg hover:bg-pastel-purple/30 transition-colors">
              <div className="space-y-1">
                <div className="font-medium text-purple-primary">{getTaskTitle(record.taskId)}</div>
                <div className="text-sm text-purple-tertiary">
                  Completed by: {record.completedBy}
                </div>
                <div className="text-sm text-purple-tertiary">
                  Date: {record.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-purple-tertiary py-4">
          No activity records yet
        </p>
      )}
    </ScrollArea>
  );
};
