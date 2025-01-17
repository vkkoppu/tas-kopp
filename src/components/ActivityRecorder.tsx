import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: number;
  title: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  frequency: "once" | "daily" | "weekly" | "custom";
  customDays?: number;
  assignedTo: string;
}

interface ActivityRecord {
  taskId: number;
  completed: boolean;
  date: string;
}

interface ActivityRecorderProps {
  familyMembers: { name: string; role: string }[];
  tasks: Task[];
  onClose: () => void;
}

export const ActivityRecorder = ({ familyMembers, tasks, onClose }: ActivityRecorderProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [activeTab, setActiveTab] = useState("record");

  const handleTaskToggle = (taskId: number) => {
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
    } else {
      newCompletedTasks.add(taskId);
    }
    setCompletedTasks(newCompletedTasks);
  };

  const handleSave = () => {
    const newRecords = Array.from(completedTasks).map(taskId => ({
      taskId,
      completed: true,
      date: format(selectedDate, 'yyyy-MM-dd'),
    }));
    setRecords([...records, ...newRecords]);
    setCompletedTasks(new Set());
  };

  const getTaskTitle = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-background md:inset-auto md:left-1/2 md:top-1/2 md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:h-[80vh]">
      <div className="flex flex-col h-full p-6">
        <h2 className="text-2xl font-bold mb-4">Activity Manager</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="record">Record Activities</TabsTrigger>
            <TabsTrigger value="history">View History</TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="flex-1 flex flex-col">
            <div className="space-y-4 mb-4">
              <p className="text-muted-foreground">Select a date and mark completed tasks</p>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={completedTasks.has(task.id)}
                      onCheckedChange={() => handleTaskToggle(task.id)}
                    />
                    <Label htmlFor={`task-${task.id}`} className="flex-1">
                      <span className="font-medium">{task.title}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        (Assigned to: {task.assignedTo})
                      </span>
                    </Label>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No tasks available for recording
                  </p>
                )}
              </ScrollArea>
            </div>

            <div className="mt-4 space-y-2">
              <Button 
                onClick={handleSave}
                className="w-full"
                size="lg"
                disabled={completedTasks.size === 0}
              >
                Submit Activities
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 border rounded-md p-4">
              {records.length > 0 ? (
                <div className="space-y-4">
                  {records.map((record, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <span className="font-medium">{getTaskTitle(record.taskId)}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          Completed on: {record.date}
                        </span>
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
          </TabsContent>
        </Tabs>

        <Button 
          variant="outline" 
          onClick={onClose}
          className="w-full mt-4"
        >
          Close
        </Button>
      </div>
    </Card>
  );
};