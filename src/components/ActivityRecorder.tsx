import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "pending" | "completed">("all");

  const isTaskCompletedForDate = (taskId: number, date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return records.some(record => 
      record.taskId === taskId && 
      record.date === formattedDate
    );
  };

  const handleTaskToggle = (taskId: number) => {
    if (isTaskCompletedForDate(taskId, selectedDate)) {
      return;
    }
    
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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || new Date());
    setIsCalendarOpen(false);
    setCompletedTasks(new Set());
  };

  const filteredTasks = tasks.filter(task => {
    const isCompleted = isTaskCompletedForDate(task.id, selectedDate);
    switch (viewMode) {
      case "pending":
        return !isCompleted;
      case "completed":
        return isCompleted;
      default:
        return true;
    }
  });

  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-background md:inset-auto md:left-1/2 md:top-1/2 md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:h-[80vh]">
      <div className="flex flex-col h-full p-6">
        <h2 className="text-2xl font-bold mb-4">Activity Manager</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="record">Record Activities</TabsTrigger>
            <TabsTrigger value="history">View History</TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="flex-1 flex flex-col space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Filter Tasks</Label>
                <select 
                  className="w-full p-2 border rounded-md mt-1"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as "all" | "pending" | "completed")}
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending Tasks</option>
                  <option value="completed">Completed Tasks</option>
                </select>
              </div>

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-h-0 border rounded-md">
              <ScrollArea className="h-[40vh] p-4">
                {filteredTasks.map((task) => {
                  const isCompleted = isTaskCompletedForDate(task.id, selectedDate);
                  return (
                    <div key={task.id} className="flex items-center space-x-2 py-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={isCompleted || completedTasks.has(task.id)}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                        disabled={isCompleted}
                      />
                      <Label 
                        htmlFor={`task-${task.id}`} 
                        className={cn(
                          "flex-1",
                          isCompleted && "text-muted-foreground line-through"
                        )}
                      >
                        <span className="font-medium">{task.title}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          (Assigned to: {task.assignedTo})
                        </span>
                        {isCompleted && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            (Already completed)
                          </span>
                        )}
                      </Label>
                    </div>
                  );
                })}
                {filteredTasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No {viewMode} tasks available
                  </p>
                )}
              </ScrollArea>
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                onClick={handleSave}
                className="w-full"
                size="lg"
                disabled={completedTasks.size === 0}
              >
                Submit Activities
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Close
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
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full mt-4"
            >
              Close
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};