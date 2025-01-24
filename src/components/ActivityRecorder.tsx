import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, ListCheck, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { ActivityRecorderProps } from "./activity-recorder/types";
import { TaskList } from "./activity-recorder/TaskList";
import { HistoryView } from "./activity-recorder/HistoryView";
import { DateSelector } from "./activity-recorder/DateSelector";

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

  const isTaskCompletedForDate = (taskId: string) => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    return records.some(record => 
      record.taskId === taskId && 
      record.date === formattedDate
    );
  };

  const handleTaskToggle = (taskId: string) => {
    if (isTaskCompletedForDate(taskId)) {
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

        const memberName = completedBy[taskId];
        if (!memberName) continue;

        const familyMember = familyMembers.find(m => m.name === memberName);
        if (!familyMember) continue;

        console.log('Inserting task record:', {
          task_id: taskId,
          completed_by: familyMember.id,
          completed_at: selectedDate.toISOString()
        });

        const { error } = await supabase
          .from('task_records')
          .insert({
            task_id: taskId,
            completed_by: familyMember.id,
            completed_at: selectedDate.toISOString()
          });

        if (error) {
          console.error('Error details:', error);
          throw error;
        }

        newRecords.push({
          taskId,
          completed: true,
          date: format(selectedDate, 'yyyy-MM-dd'),
          completedBy: memberName,
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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || new Date());
    setIsCalendarOpen(false);
    setCompletedTasks(new Set());
  };

  const filteredTasks = tasks.filter(task => {
    const isCompleted = isTaskCompletedForDate(task.id);
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

              <DateSelector
                selectedDate={selectedDate}
                isCalendarOpen={isCalendarOpen}
                onCalendarOpenChange={setIsCalendarOpen}
                onDateSelect={handleDateSelect}
              />
            </div>

            <TaskList
              tasks={filteredTasks}
              completedTasks={completedTasks}
              completedBy={completedBy}
              onTaskToggle={handleTaskToggle}
              onCompletedByChange={(taskId, value) => setCompletedBy({ ...completedBy, [taskId]: value })}
              isTaskCompletedForDate={isTaskCompletedForDate}
            />

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
            <HistoryView records={records} tasks={tasks} />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};