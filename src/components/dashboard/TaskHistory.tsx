import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Task } from "@/types/task";
import { ActivityRecord } from "@/components/activity-recorder/shared-types";

interface TaskHistoryProps {
  records: ActivityRecord[];
  tasks: Task[];
}

export const TaskHistory = ({ records, tasks }: TaskHistoryProps) => {
  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-background md:inset-auto md:left-1/2 md:top-1/2 md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:h-[80vh]">
      <div className="flex-1 p-6">
        <ScrollArea className="h-full">
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
                      Date: {format(new Date(record.date), 'PPP')}
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
      </div>
    </Card>
  );
};