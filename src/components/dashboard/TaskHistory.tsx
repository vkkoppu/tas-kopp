import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { format, parseISO } from "date-fns";
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

  // Group records by date
  const groupedRecords = records.reduce((acc, record) => {
    const date = format(new Date(record.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, ActivityRecord[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => 
    parseISO(b).getTime() - parseISO(a).getTime()
  );

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
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="space-y-4">
                  <h3 className="text-lg font-semibold sticky top-0 bg-background py-2">
                    {format(parseISO(date), 'PPPP')}
                  </h3>
                  <div className="space-y-4">
                    {groupedRecords[date].map((record, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="space-y-1">
                          <div className="font-medium">{getTaskTitle(record.taskId)}</div>
                          <div className="text-sm text-muted-foreground">
                            Completed by: {record.completedBy}
                          </div>
                        </div>
                      </div>
                    ))}
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