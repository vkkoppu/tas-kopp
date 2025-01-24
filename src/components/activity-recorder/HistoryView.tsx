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
    return task ? task.title : 'Unknown Task';
  };

  return (
    <ScrollArea className="flex-1 border rounded-md p-4">
      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="space-y-1">
                <div className="font-medium">{getTaskTitle(record.taskId)}</div>
                <div className="text-sm text-muted-foreground">
                  Completed by: {record.completedBy}
                </div>
                <div className="text-sm text-muted-foreground">
                  Date: {record.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-4">
          No activity records yet
        </p>
      )}
    </ScrollArea>
  );
};