import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { format } from "date-fns";
import { Task } from "@/types/task";
import { ActivityRecord } from "@/components/activity-recorder/shared-types";

interface TaskHistoryProps {
  records: ActivityRecord[];
  tasks: Task[];
  onClose: () => void;
}

export const TaskHistory = ({ records, tasks, onClose }: TaskHistoryProps) => {
  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  return (
    <Card className="fixed inset-4 z-40 flex flex-col bg-background md:inset-auto md:left-1/2 md:top-1/2 md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:h-[80vh]">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Activity History</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
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