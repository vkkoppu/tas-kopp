import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { format } from "date-fns";
import { Task } from "@/types/task";
import { ActivityRecord } from "@/components/activity-recorder/shared-types";

interface HistoryViewProps {
  records: ActivityRecord[];
  tasks: Task[];
  onClose: () => void;
}

export const HistoryView = ({ records, tasks, onClose }: HistoryViewProps) => {
  const getTaskTitle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
      <Card className="relative w-full max-w-2xl h-[80vh] flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold">Activity History</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
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
      </Card>
    </div>
  );
};