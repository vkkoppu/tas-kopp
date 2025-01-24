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
import { CalendarIcon, History, ListCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface ActivityRecord {
  taskId: string;
  completed: boolean;
  date: string;
  completedBy: string;
}

interface ActivityRecorderProps {
  familyMembers: { id: string; name: string; role: string }[];
  tasks: Task[];
  onClose: () => void;
  records: ActivityRecord[];
  onRecordAdded: (newRecords: ActivityRecord[]) => void;
}

export const ActivityRecorder = ({ 
  familyMembers, 
  tasks, 
  onClose,
  records,
  onRecordAdded 
}: ActivityRecorderProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "pending" | "completed">("all");
  const [completedBy, setCompletedBy] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("record");
  const { toast } = useToast();

  const isTaskCompletedForDate = (taskId: string, date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return records.some(record => 
      record.taskId === taskId && 
      record.date === formattedDate
    );
  };

  const handleTaskToggle = (taskId: string) => {
    if (isTaskCompletedForDate(taskId, selectedDate)) {
      return;
    }
    
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
      const newCompletedBy = { ...completedBy };
      delete newCompletedBy[taskId];
      setCompletedBy(newCompletedBy);
    } else {
      newCompletedTasks.add(taskId);
    }
    setCompletedTasks(newCompletedTasks);
  };

  const handleSave = async () => {
    try {
      const newRecords = [];
      
      for (const taskId of completedTasks) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) continue;

        const familyMember = familyMembers.find(m => m.name === completedBy[taskId]);
        if (!familyMember) continue;

        const { error } = await supabase
          .from('task_records')
          .insert({
            task_id: task.id,
            completed_by: familyMember.id,
            completed_at: new Date().toISOString()
          });

        if (error) throw error;

        newRecords.push({
          taskId,
          completed: true,
          date: format(selectedDate, 'yyyy-MM-dd'),
          completedBy: completedBy[taskId] || '',
        });
      }

      onRecordAdded(newRecords);
      setCompletedTasks(new Set());
      setCompletedBy({});
      
      toast({
        title: "Success",
        description: "Activities recorded successfully",
      });
    } catch (error) {
      console.error('Error saving records:', error);
      toast({
        title: "Error",
        description: "Failed to save activities. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTaskTitle = (taskId: string) => {
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
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-2xl font-bold">Activity Manager</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="record" className="flex items-center gap-2">
              <ListCheck className="h-4 w-4" />
              Record Activities
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              View History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="flex-1 flex flex-col space-y-4">
            <div className="space-y-4">
              <Select value={viewMode} onValueChange={(value: "all" | "pending" | "completed") => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending Tasks</SelectItem>
                  <SelectItem value="completed">Completed Tasks</SelectItem>
                </SelectContent>
              </Select>

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

            <ScrollArea className="flex-1 border rounded-md p-4">
              {filteredTasks.map((task) => {
                const isCompleted = isTaskCompletedForDate(task.id, selectedDate);
                return (
                  <div key={task.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={isCompleted || completedTasks.has(task.id)}
                      onCheckedChange={() => handleTaskToggle(task.id)}
                      disabled={isCompleted}
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`task-${task.id}`} 
                        className={cn(
                          "flex-1",
                          isCompleted && "text-muted-foreground line-through"
                        )}
                      >
                        {task.title}
                        <span className="ml-2 text-sm text-muted-foreground">
                          (Assigned to: {task.assignedTo.join(", ")})
                        </span>
                      </Label>
                      {completedTasks.has(task.id) && !isCompleted && (
                        <Select
                          value={completedBy[task.id] || ""}
                          onValueChange={(value) => setCompletedBy({ ...completedBy, [task.id]: value })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select who completed this task" />
                          </SelectTrigger>
                          <SelectContent>
                            {task.assignedTo.map((member) => (
                              <SelectItem key={member} value={member}>
                                {member}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredTasks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No {viewMode} tasks available
                </p>
              )}
            </ScrollArea>

            <div className="pt-4 space-y-2">
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
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};