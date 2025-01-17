import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

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
    onClose();
  };

  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-background p-6 shadow-lg md:inset-auto md:left-1/2 md:top-1/2 md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Record Activities</h2>
          <p className="text-muted-foreground">Select a date and record completed tasks</p>
        </div>
        
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>

        <ScrollArea className="h-[200px] rounded-md border p-4">
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
        </ScrollArea>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Records</Button>
        </div>
      </div>
    </Card>
  );
};